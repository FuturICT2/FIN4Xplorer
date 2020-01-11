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
import { findProofTypeAddressByName } from '../../../components/utils';
import AddLocation from '@material-ui/icons/AddLocation';

function StepProving(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const proofs = useRef({}); // TODO rework this to use state too as in other steps?

	useEffect(() => {
		if (!props.draft || draftId || Object.keys(props.proofTypes).length === 0) {
			return;
		}
		let draft = props.draft;
		proofs.current = draft.proofs;
		if (proofs.current['Location']) {
			setLocVal(proofs.current['Location'].parameters['latitude / longitude']);
		}

		setProofsAdded(Object.keys(draft.proofs).map(name => findProofTypeAddressByName(props.proofTypes, name)));
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'proofs',
			node: proofs.current
		});
		props.handleNext();
	};

	const [showDropdown, setShowDropdown] = useState(false);
	const [proofsAdded, setProofsAdded] = useState([]);

	const addProof = addr => {
		let proofType = props.proofTypes[addr];
		let name = proofType.label;

		proofs.current[name] = {
			// address: addr,
			parameters: {}
		};

		if (proofType.paramsEncoded) {
			proofs.current[name].parameters = {};
			proofType.paramsEncoded.split(',').map(paramStr => {
				let paramName = paramStr.split(':')[1];
				proofs.current[name].parameters[paramName] = null;
			});
		}

		setProofsAdded(proofsAdded.concat(addr));
		setShowDropdown(false);
	};

	const removeProof = addr => {
		setProofsAdded(proofsAdded.filter(a => a !== addr));
		delete proofs.current[props.proofTypes[addr].label];
	};

	const requestLocation = (proofName, paramName) => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(pos => {
				let latitude = pos.coords.latitude;
				let longitude = pos.coords.longitude;
				let locStr = latitude + ' / ' + longitude;
				console.log('Captured location ' + locStr);
				proofs.current[proofName].parameters[paramName] = locStr;
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
			{proofsAdded.length > 0 && Object.keys(props.proofTypes).length > 0 && (
				<div style={{ fontFamily: 'arial' }}>
					{proofsAdded.map((proofAddress, index) => {
						let proofType = props.proofTypes[proofAddress];
						let name = proofType.label;
						return (
							<div key={'proof_' + index} style={{ paddingTop: '20px' }}>
								<div
									key={'proofLabel_' + index}
									title={proofType.description}
									style={{ display: 'flex', alignItems: 'center' }}>
									<ArrowRightIcon />
									{name}
									<FontAwesomeIcon
										icon={faMinusCircle}
										style={styles.removeIcon}
										onClick={() => removeProof(proofAddress)}
									/>
									{proofType.paramsEncoded.length > 0 && (
										<FontAwesomeIcon
											icon={faPlusSquare}
											style={styles.plusIcon}
											title="Since this proof has parameters to set, it will require an extra transaction when creating the token"
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
								{proofType.paramsEncoded &&
									proofType.paramsEncoded.split(',').map((paramStr, paramIndex) => {
										// e.g. uint:interval:days,uint:maxQuantity:quantity
										let type = paramStr.split(':')[0];
										let paramName = paramStr.split(':')[1];
										let description = paramStr.split(':')[2];
										let key = 'proof_' + index + '_param_' + paramIndex;

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
															proofs.current[name].parameters[paramName] = e.target.value;
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
														defaultValue={proofs.current[name].parameters[paramName]}
														onChange={e => (proofs.current[name].parameters[paramName] = e.target.value)}
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
			{proofsAdded.length > 0 && <Spacer />}
			{showDropdown ? (
				<Dropdown
					onChange={e => addProof(e.value)}
					options={Object.keys(props.proofTypes)
						.filter(addr => !proofs.current[props.proofTypes[addr].label])
						.map(addr => props.proofTypes[addr])}
					label="Add proof type"
				/>
			) : (
				<Button onClick={() => setShowDropdown(true)} center="true" color="inherit">
					Add
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
		proofTypes: state.fin4Store.proofTypes
	};
};

export default drizzleConnect(StepProving, mapStateToProps);
