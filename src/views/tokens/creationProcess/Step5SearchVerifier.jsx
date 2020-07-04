import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import Dropdown from '../../../components/Dropdown';
import Button from '../../../components/Button';
import { verifiers as verifierDefinitions, verifierOptions } from '../../../config/verifier-info';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { TextField, IconButton } from '@material-ui/core';
import { findVerifierTypeAddressByName } from '../../../components/utils';
import AddLocation from '@material-ui/icons/AddLocation';

function valuesToOptions(values) {
	let result = [];
	for (let value of values) {
		result.push({ label: value, value: value });
	}
	return result;
}

function StepSearchVerifier(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [verifierProperty, setVerifierProperty] = useState({
		name: '',
		chain: '',
		verifierType: '',
		dataType: ''
	});
	const [search, setSearch] = useState({
		searchInitiate: false,
		searchResults: null
	});
	const [verifiersAdded, setVerifiersAdded] = useState([]);
	const verifiers = useRef({});

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		verifiers.current = draft.noninteractiveVerifiers;
		if (verifiers.current['Location']) {
			setLocVal(verifiers.current['Location'].parameters['latitude / longitude']);
		}
		setVerifiersAdded(
			Object.keys(draft.noninteractiveVerifiers).map(name => findVerifierTypeAddressByName(props.verifierTypes, name))
		);
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'noninteractiveVerifiers',
			node: verifiers.current
		});
		props.handleNext();
	};

	const addVerifier = addr => {
		let verifier = props.verifierTypes[addr];
		let name = verifier.label;

		verifiers.current[name] = {
			parameters: {}
		};

		if (verifier.paramsEncoded) {
			verifiers.current[name].parameters = {};
			verifier.paramsEncoded.split(',').map(paramStr => {
				let paramName = paramStr.split(':')[1];
				verifiers.current[name].parameters[paramName] = null;
			});
		}

		setVerifiersAdded(verifiersAdded.concat(addr));
	};

	const removeVerifier = addr => {
		setVerifiersAdded(verifiersAdded.filter(a => a !== addr));
		delete verifiers.current[props.verifierTypes[addr].label];
	};

	const typesHandler = type => {
		setVerifierProperty({
			...verifierProperty,
			verifierType: type
		});
	};

	const dataTypesHandler = dataType => {
		setVerifierProperty({
			...verifierProperty,
			dataType: dataType
		});
	};

	const chainTypesHandler = chain => {
		setVerifierProperty({
			...verifierProperty,
			chain: chain
		});
	};

	const searchVerifiers = () => {
		let searchResults = [];
		for (let [key, value] of Object.entries(verifierDefinitions)) {
			if (
				verifierProperty.name.toLowerCase() !== '' &&
				!key.toLowerCase().includes(verifierProperty.name.toLowerCase())
			)
				continue;
			if (verifierProperty.verifierType !== '' && value.type !== verifierProperty.verifierType) continue;
			if (verifierProperty.dataType !== '' && value.claimerInput.inputType !== verifierProperty.dataType) continue;
			if (verifierProperty.chain !== '' && value.chain !== verifierProperty.chain) continue;
			searchResults.push({ label: key, value: value.address });
		}
		setSearch({
			searchResults,
			searchInitiate: true
		});
	};

	const requestLocation = (verifierName, paramName) => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(pos => {
				let latitude = pos.coords.latitude;
				let longitude = pos.coords.longitude;
				let locStr = latitude + ' / ' + longitude;
				console.log('Captured location ' + locStr);
				verifiers.current[verifierName].parameters[paramName] = locStr;
				setLocVal(locStr);
			});
		} else {
			console.error('Geolocation is not supported by this browser.');
		}
	};

	// TODO make this a general solution instead of for one field of one proof type
	const [locVal, setLocVal] = useState('');
	return (
		<>
			<TextField
				key={'drop_' + 1}
				type="text"
				value={verifierProperty.name}
				onChange={event => setVerifierProperty({ ...verifierProperty, name: event.target.value })}
				label="Name"
				style={{ width: '100%', marginBottom: 14 }}
			/>
			<Dropdown
				key={'drop_' + 3}
				onChange={e => chainTypesHandler(e.value)}
				options={valuesToOptions(verifierOptions.chain.values)}
				label="On or Off Chain"
			/>
			<Dropdown
				key={'drop_' + 2}
				onChange={e => typesHandler(e.value)}
				options={valuesToOptions(verifierOptions.type.values)}
				label="Types"
			/>
			<Dropdown
				key={'drop_' + 4}
				onChange={e => dataTypesHandler(e.value)}
				options={valuesToOptions(verifierOptions.claimerInput.inputType)}
				label="Claimer Input Data"
			/>
			<Button onClick={() => searchVerifiers()} center="true" color="inherit">
				Search
			</Button>
			{verifiersAdded.length > 0 && Object.keys(props.verifierTypes).length > 0 && (
				<div style={{ fontFamily: 'arial' }}>
					{verifiersAdded.map((verifierAddress, index) => {
						let verifier = props.verifierTypes[verifierAddress];
						let name = verifier.label;
						return (
							<div key={'verifier_' + index} style={{ paddingTop: '20px' }}>
								<div
									key={'verifierLabel_' + index}
									title={verifier.description}
									style={{ display: 'flex', alignItems: 'center' }}>
									<ArrowRightIcon />
									{name}
									<FontAwesomeIcon
										icon={faMinusCircle}
										style={styles.removeIcon}
										title="Remove verifier"
										onClick={() => removeVerifier(verifierAddress)}
									/>
									{verifier.paramsEncoded.length > 0 && (
										<FontAwesomeIcon
											icon={faPlusSquare}
											style={styles.plusIcon}
											title="Since this verifier has parameters to set, it will require an extra transaction when creating the token"
										/>
									)}
								</div>
								{name === 'Location' && (
									<small style={{ color: 'orange', padding: '' }}>
										<b>Note</b>: Submitting location proof is currently not
										<br />
										possible for users of MetaMask mobile on Android
									</small>
								)}
								{verifier.paramsEncoded &&
									verifier.paramsEncoded.split(',').map((paramStr, paramIndex) => {
										// e.g. uint:interval:days,uint:maxQuantity:quantity
										let type = paramStr.split(':')[0];
										let isArray = type.includes('[]');
										let paramName = paramStr.split(':')[1];
										let description = paramStr.split(':')[2];
										let key = 'verifier_' + index + '_param_' + paramIndex;
										if (description === 'gps') {
											// ONLY FOR LAT/LON FIELD OF LOCATION
											// more solid indicator?
											return (
												<span key={key}>
													<TextField
														type="text"
														label={
															<>
																<span>{paramName}</span>
																<small> ({description})</small>
															</>
														}
														value={locVal}
														onChange={e => {
															verifiers.current[name].parameters[paramName] = e.target.value;
															setLocVal(e.target.value);
														}}
														style={styles.shortenedField}
														inputProps={{ style: { fontSize: 'small' } }}
													/>
													<IconButton
														style={{ margin: '17px 0 0 6px', transform: 'scale(1.4)' }}
														onClick={() => requestLocation(name, paramName)}>
														<AddLocation />
													</IconButton>
												</span>
											);
										} else {
											return (
												<span key={key}>
													<TextField
														type={type === 'uint' ? 'number' : 'text'}
														label={
															<>
																<span>{paramName}</span>
																{description && <small> ({description})</small>}{' '}
															</>
														}
														inputProps={{
															style: { fontSize: isArray ? 'small' : 'medium' }
														}}
														multiline={isArray ? true : null}
														rows={isArray ? 1 : null}
														variant={isArray ? 'outlined' : 'standard'}
														defaultValue={verifiers.current[name].parameters[paramName]}
														onChange={e => (verifiers.current[name].parameters[paramName] = e.target.value)}
														style={styles.normalField}
													/>
												</span>
											);
										}
									})}
							</div>
						);
					})}
				</div>
			)}
			{search.searchInitiate && (
				<Dropdown onChange={e => addVerifier(e.value)} options={search.searchResults} label="Add token verifier" />
			)}
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const styles = {
	removeIcon: {
		color: 'lightsalmon',
		width: '14px',
		height: '14px',
		paddingLeft: '7px'
	},
	plusIcon: {
		color: 'lightgreen',
		width: '16px',
		height: '16px',
		paddingLeft: '7px'
	},
	normalField: {
		width: '80%',
		margin: '8px 0 8px 25px'
	}
};

const mapStateToProps = state => {
	return {
		verifierTypes: state.fin4Store.verifierTypes
	};
};

export default drizzleConnect(StepSearchVerifier, mapStateToProps);
