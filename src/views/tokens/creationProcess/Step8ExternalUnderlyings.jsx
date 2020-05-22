import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import StepsBottomNav from './StepsBottomNav';
import Button from '../../../components/Button';
import { TextField, FormControlLabel, Checkbox } from '@material-ui/core';
import { faMinusCircle, faAsterisk } from '@fortawesome/free-solid-svg-icons';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import update from 'react-addons-update';
import Dropdown from '../../../components/Dropdown';
import moment from 'moment';

function StepExternalUnderlyings(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [externalUnderlyings, setExternalUnderlyings] = useState({}); // name and parameters
	const [newDraft, setNewDraft] = useState({});
	const [mode, setMode] = useState('allCollapsed'); // addExisting, addNew

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		setExternalUnderlyings(draft.externalUnderlyings);
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'externalUnderlyings',
			node: externalUnderlyings
		});
		props.handleNext();
	};

	const updateDraftVal = (key, val) => {
		setNewDraft({
			...newDraft,
			[key]: val
		});
	};

	const updateParamVal = (name, pName, val) => {
		setExternalUnderlyings(
			update(externalUnderlyings, {
				[name]: {
					parameters: {
						[pName]: { $set: val }
					}
				}
			})
		);
	};

	const removeExternalUnderlying = name => {
		setExternalUnderlyings(Object.keys(externalUnderlyings).filter(n => name !== name));
	};

	return (
		<>
			{Object.keys(externalUnderlyings).length > 0 && Object.keys(props.allUnderlyings).length > 0 && (
				<div style={{ fontFamily: 'arial' }}>
					{Object.keys(externalUnderlyings).map((name, index) => {
						let underlyingObj = props.allUnderlyings[name];
						if (!props.allUnderlyings[name]) {
							return;
						}
						return (
							<div key={'externalUnderlying_' + index} style={{ paddingTop: '20px' }}>
								<div
									key={'externalUnderlyingLabel_' + index}
									title={underlyingObj.contractAddress}
									style={{ display: 'flex', alignItems: 'center' }}>
									<ArrowRightIcon />
									{underlyingObj.name}
									<FontAwesomeIcon
										icon={faMinusCircle}
										style={styles.removeIcon}
										title="Remove external source of value"
										onClick={() => removeExternalUnderlying(name)}
									/>
									{underlyingObj.hasOwnProperty('usableForAll') && (
										<FontAwesomeIcon
											icon={faAsterisk}
											style={styles.newIcon}
											title="Will be created new during token creation"
										/>
									)}
								</div>
								{underlyingObj.paramsEncoded &&
									underlyingObj.paramsEncoded.split(',').map((paramStr, paramIndex) => {
										let type = paramStr.split(':')[0];
										let paramName = paramStr.split(':')[1];
										let description = paramStr.split(':')[2];
										let key = 'externalUnderlying_' + index + '_param_' + paramIndex;
										return (
											<span key={key}>
												<TextField
													type={type === 'uint' ? 'number' : 'text'}
													label={
														<>
															<span>{paramName}</span>
															{description && <span style={{ fontSize: 'x-small' }}> ({description})</span>}{' '}
														</>
													}
													defaultValue={externalUnderlyings[name].parameters[paramName]}
													onChange={e => updateParamVal(name, paramName, e.target.value)}
													style={styles.normalField}
												/>
											</span>
										);
									})}
							</div>
						);
					})}
				</div>
			)}
			{Object.keys(externalUnderlyings).length > 0 && <Spacer />}
			{mode === 'allCollapsed' && (
				<>
					<Button onClick={() => setMode('addExisting')} center="true" color="inherit">
						Add existing
					</Button>
					<div style={{ marginBottom: '30px' }}></div>
					<Button
						center="true"
						color="inherit"
						onClick={() => {
							setMode('addNew');
							setNewDraft({
								name: '',
								contractAddress: '',
								usableForAll: true
							});
						}}>
						Add new
					</Button>
				</>
			)}
			{mode === 'addExisting' && (
				<Dropdown
					onChange={e => {
						let name = e.value;
						let parameters = {};
						let underlyingObj = props.allUnderlyings[name];
						if (underlyingObj.paramsEncoded) {
							underlyingObj.paramsEncoded.split(',').map(paramStr => {
								let paramName = paramStr.split(':')[1];
								parameters[paramName] = null;
							});
						}
						setExternalUnderlyings({
							...externalUnderlyings,
							[name]: {
								parameters: parameters
							}
						});
						setMode('allCollapsed');
					}}
					options={Object.keys(props.allUnderlyings)
						.filter(name => !props.allUnderlyings[name].isSourcerer)
						.filter(name => Object.keys(externalUnderlyings).filter(n => n === name).length === 0)
						.map(name => {
							return {
								value: name,
								label: name
							};
						})}
					label="Choose existing"
				/>
			)}
			{mode === 'addNew' && (
				<>
					<TextField
						key="name-field"
						type="text"
						label="Name"
						value={newDraft.name}
						onChange={e => updateDraftVal('name', e.target.value)}
						style={inputFieldStyle}
					/>
					<TextField
						key="contract-address-field"
						type="text"
						label="Contract address (optional)"
						value={newDraft.contractAddress}
						onChange={e => updateDraftVal('contractAddress', e.target.value)}
						style={inputFieldStyle}
					/>
					<FormControlLabel
						control={
							<Checkbox
								checked={newDraft.usableForAll}
								onChange={() => updateDraftVal('usableForAll', !newDraft.usableForAll)}
							/>
						}
						label="Other token creators can add this too"
					/>
					<center style={{ marginTop: '10px' }}>
						<Button
							color="inherit"
							onClick={() => {
								// adding them here already to avoid having to reload for the
								// newly added ones to become available
								props.dispatch({
									type: 'ADD_UNDERLYING',
									underlying: newDraft
								});
								setExternalUnderlyings({
									...externalUnderlyings,
									[newDraft.name]: newDraft
								});
								setMode('allCollapsed');
							}}>
							Add
						</Button>
						<span style={{ marginRight: '20px' }}></span>
						<Button onClick={() => setMode('allCollapsed')} color="inherit">
							Cancel
						</Button>
					</center>
					<br />
				</>
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
	newIcon: {
		color: 'orange',
		width: '14px',
		height: '14px',
		paddingLeft: '7px'
	},
	normalField: {
		width: '80%',
		margin: '8px 0 8px 25px'
	}
};

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

const mapStateToProps = state => {
	return {
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(StepExternalUnderlyings, mapStateToProps);
