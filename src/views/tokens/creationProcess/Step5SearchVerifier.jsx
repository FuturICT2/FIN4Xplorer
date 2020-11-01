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
import { findVerifierTypeAddressByContractName } from '../../../components/utils';
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
	const [search, setSearch] = useState([]);
	const [verifiersAdded, setVerifiersAdded] = useState([]);
	const verifiers = useRef({});

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		verifiers.current = draft.verifiers;
		if (verifiers.current['Location']) {
			setLocVal(verifiers.current['Location'].parameters['latitude / longitude']);
		}
		setVerifiersAdded(
			Object.keys(draft.verifiers).map(contractName =>
				findVerifierTypeAddressByContractName(props.verifierTypes, contractName)
			)
		);
		setDraftId(draft.id);
		searchVerifiers(verifierProperty);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'verifiers',
			node: verifiers.current
		});
		props.handleNext();
	};

	const addVerifier = addr => {
		let verifier = props.verifierTypes[addr];
		let contractName = verifier.contractName;

		verifiers.current[contractName] = {
			parameters: {}
		};

		if (verifier.paramsEncoded) {
			verifiers.current[contractName].parameters = {};
			verifier.paramsEncoded.split(',').map(paramStr => {
				let paramName = paramStr.split(':')[1];
				verifiers.current[contractName].parameters[paramName] = null;
			});
		}

		setVerifiersAdded(verifiersAdded.concat(addr));
	};

	const removeVerifier = addr => {
		setVerifiersAdded(verifiersAdded.filter(a => a !== addr));
		delete verifiers.current[props.verifierTypes[addr].contractName];
	};

	const updateVerifierProperty = (key, val) => {
		// setting the state is not fast enough to work with the object
		// straight afterwards, that's why a temp object needs to be used
		let tmp = verifierProperty;
		tmp[key] = val;
		searchVerifiers(tmp);
		setVerifierProperty({
			...verifierProperty,
			[key]: val
		});
	};

	const resetVerifierProperty = () => {
		let reset = {
			name: '',
			chain: '',
			verifierType: '',
			dataType: ''
		};
		setVerifierProperty(reset);
		searchVerifiers(reset);
	};

	const searchVerifiers = newVerifierProperty => {
		let searchResults = [];
		for (let [key, value] of Object.entries(verifierDefinitions)) {
			if (
				newVerifierProperty.name.toLowerCase() !== '' &&
				!key.toLowerCase().includes(newVerifierProperty.name.toLowerCase())
			)
				continue;
			if (newVerifierProperty.verifierType !== '' && value.type !== newVerifierProperty.verifierType) continue;
			if (newVerifierProperty.dataType !== '' && value.claimerInput.inputType !== newVerifierProperty.dataType)
				continue;
			if (newVerifierProperty.chain !== '' && value.chain !== newVerifierProperty.chain) continue;
			searchResults.push({ label: key, value: value.address });
		}
		setSearch(searchResults);
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
			{verifiersAdded.length > 0 && Object.keys(props.verifierTypes).length > 0 && (
				<div style={{ fontFamily: 'arial' }}>
					{verifiersAdded.map((verifierAddress, index) => {
						let verifier = props.verifierTypes[verifierAddress];
						let contractName = verifier.contractName;
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
										title={t('token-creator.step5-verifiers.fields.remove-verifier-tooltip.label')}
										onClick={() => removeVerifier(verifierAddress)}
									/>
									{verifier.paramsEncoded.length > 0 && (
										<FontAwesomeIcon
											icon={faPlusSquare}
											style={styles.plusIcon}
											title={t('token-creator.step5-verifiers.fields.verifier-to-parameterize-tooltip.label')}
										/>
									)}
								</div>
								{contractName === 'Location' && (
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
															verifiers.current[contractName].parameters[paramName] = e.target.value;
															setLocVal(e.target.value);
														}}
														style={styles.shortenedField}
														inputProps={{ style: { fontSize: 'small' } }}
													/>
													<IconButton
														style={{ margin: '17px 0 0 6px', transform: 'scale(1.4)' }}
														onClick={() => requestLocation(contractName, paramName)}>
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
														defaultValue={verifiers.current[contractName].parameters[paramName]}
														onChange={e => (verifiers.current[contractName].parameters[paramName] = e.target.value)}
														style={styles.normalField}

														// TODO post-merge keep this?
														/*inputProps={{
															style: { fontSize: isArray ? 'small' : 'medium' }
														}}
														multiline={isArray ? true : null}
														rows={isArray ? 1 : null}
														variant={isArray ? 'outlined' : 'standard'}*/
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
			{verifiersAdded.length === 0 && (
				<center style={{ fontFamily: 'arial' }}>
					<i>No verifiers added yet</i>
				</center>
			)}
			<br />
			<hr />
			<br />
			<div style={{ fontFamily: 'arial', color: 'gray' }}>Filter by criteria and add verifier:</div>
			<TextField
				key={'drop_' + 1}
				type="text"
				value={verifierProperty.name}
				onChange={e => updateVerifierProperty('name', e.target.value)}
				label="Name"
				style={{ width: '100%', marginBottom: 14 }}
			/>
			<Dropdown
				key={'drop_' + 3}
				onChange={e => updateVerifierProperty('chain', e ? e.value : '')}
				options={valuesToOptions(verifierOptions.chain.values)}
				label="On or Off Chain"
				isClearable={true}
			/>
			<Dropdown
				key={'drop_' + 2}
				onChange={e => updateVerifierProperty('verifierType', e ? e.value : '')}
				options={valuesToOptions(verifierOptions.type.values)}
				label="Types"
				isClearable={true}
			/>
			<Dropdown
				key={'drop_' + 4}
				onChange={e => updateVerifierProperty('dataType', e ? e.value : '')}
				options={valuesToOptions(verifierOptions.claimerInput.inputType)}
				label="Claimer Input Data"
				isClearable={true}
			/>
			<Button onClick={() => resetVerifierProperty()} center="true" color="inherit">
				Reset criteria
			</Button>
			<br />
			{
				<div style={{ fontFamily: 'arial', color: 'gray' }}>
					Verifiers matching the criteria:
					<br />
					<br />
					{search.map((verifier, idx) => {
						return (
							<div key={'searchVer_' + idx}>
								<a style={{ textDecoration: 'none' }} href="#" onClick={() => addVerifier(verifier.value)}>
									{verifier.label}
								</a>
							</div>
						);
					})}
					{/*<Dropdown onChange={e => addVerifier(e.value)} options={search.searchResults} label="Add token verifier" />*/}
				</div>
			}
			<br />
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
