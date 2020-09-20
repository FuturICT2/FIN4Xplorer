import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import Dropdown from '../../../components/Dropdown';
import Button from '../../../components/Button';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { TextField, IconButton } from '@material-ui/core';
import styled from 'styled-components';
import { findVerifierTypeAddressByContractName } from '../../../components/utils';
import AddLocation from '@material-ui/icons/AddLocation';

function StepInteractiveVerifier(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const verifiers = useRef({}); // TODO rework this to use state too as in other steps?

	useEffect(() => {
		if (!props.draft || draftId || Object.keys(props.verifierTypes).length === 0) {
			return;
		}
		let draft = props.draft;
		verifiers.current = draft.interactiveVerifiers;
		if (verifiers.current['Location']) {
			setLocVal(verifiers.current['Location'].parameters['latitude / longitude']);
		}

		setVerifiersAdded(
			Object.keys(draft.interactiveVerifiers).map(contractName =>
				findVerifierTypeAddressByContractName(props.verifierTypes, contractName)
			)
		);
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_CAMPAIGN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'interactiveVerifiers',
			node: verifiers.current
		});
		props.handleNext();
	};

	const [showDropdown, setShowDropdown] = useState(false);
	const [verifiersAdded, setVerifiersAdded] = useState([]);

	const addVerifier = addr => {
		let verifier = props.verifierTypes[addr];
		let contractName = verifier.contractName;

		verifiers.current[contractName] = {
			// address: addr,
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
		setShowDropdown(false);
	};

	const removeVerifier = addr => {
		setVerifiersAdded(verifiersAdded.filter(a => a !== addr));
		delete verifiers.current[props.verifierTypes[addr].contractName];
	};

	const requestLocation = (contractName, paramName) => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(pos => {
				let latitude = pos.coords.latitude;
				let longitude = pos.coords.longitude;
				let locStr = latitude + ' / ' + longitude;
				console.log('Captured location ' + locStr);
				verifiers.current[contractName].parameters[paramName] = locStr;
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
						let verifierType = props.verifierTypes[verifierAddress];
						let name = verifierType.label;
						let contractName = verifierType.contractName;
						return (
							<div key={'verifier_' + index} style={{ paddingTop: '20px' }}>
								<div
									key={'verifierLabel_' + index}
									title={verifierType.description}
									style={{ display: 'flex', alignItems: 'center' }}>
									<ArrowRightIcon />
									{name}
									<FontAwesomeIcon
										icon={faMinusCircle}
										style={styles.removeIcon}
										title={t('campaign-creator.step5-verifiers1.fields.remove-verifier-tooltip.label')}
										onClick={() => removeVerifier(verifierAddress)}
									/>
									{verifierType.paramsEncoded.length > 0 && (
										<FontAwesomeIcon
											icon={faPlusSquare}
											style={styles.plusIcon}
											title={t('campaign-creator.step5-verifiers1.fields.verifier-to-parameterize-tooltip.label')}
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
								{verifierType.paramsEncoded &&
									verifierType.paramsEncoded.split(',').map((paramStr, paramIndex) => {
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
														defaultValue={verifiers.current[contractName].parameters[paramName]}
														onChange={e => (verifiers.current[contractName].parameters[paramName] = e.target.value)}
														style={styles.normalField}
														inputProps={{
															style: { fontSize: isArray ? 'small' : 'medium' }
														}}
														multiline={isArray ? true : null}
														rows={isArray ? 1 : null}
														variant={isArray ? 'outlined' : 'standard'}
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
			{verifiersAdded.length > 0 && <Spacer />}
			{showDropdown ? (
				<Dropdown
					onChange={e => addVerifier(e.value)}
					options={Object.keys(props.verifierTypes)
						.filter(addr => !props.verifierTypes[addr].isNoninteractive)
						.filter(addr => !verifiers.current[props.verifierTypes[addr].label])
						.map(addr => props.verifierTypes[addr])}
					label={t('campaign-creator.step5-verifiers1.fields.add-token-verifier.label')}
				/>
			) : (
				<Button onClick={() => setShowDropdown(true)} center="true" color="inherit">
					{t('campaign-creator.step5-verifiers1.fields.add-button.label')}
				</Button>
			)}
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const Spacer = styled.div`
	height: 30px;
`;

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
	},
	shortenedField: {
		width: '68%',
		margin: '8px 0 8px 25px'
	}
};

const mapStateToProps = state => {
	return {
		verifierTypes: state.fin4Store.verifierTypes
	};
};

export default drizzleConnect(StepInteractiveVerifier, mapStateToProps);
