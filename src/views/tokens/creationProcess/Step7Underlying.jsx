import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import Dropdown from '../../../components/Dropdown';
import Button from '../../../components/Button';
import { faMinusCircle, faAsterisk } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import slugify from 'slugify';

function StepUnderlying(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [underlyings, setUnderlyings] = useState([]); // pseudoIds
	const [newUnderlyingDraft, setNewUnderlyingDraft] = useState({});

	const [mode, setMode] = useState('allCollapsed'); // addExisting, addNew

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		// that filter strips off new ones that were not created on-chain
		// TODO the complete draft-way would be to store info for new ones
		// and dispatch it to redux right here if its not there?
		setUnderlyings(draft.underlyings.filter(pseudoId => props.allUnderlyings[pseudoId]));
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'underlyings',
			node: underlyings
		});
		props.handleNext();
	};

	const updateVal = (key, val) => {
		if (key === 'name') {
			setNewUnderlyingDraft({
				...newUnderlyingDraft,
				name: val,
				pseudoId: 'NEW_' + slugify(val)
			});
		} else {
			setNewUnderlyingDraft({
				...newUnderlyingDraft,
				[key]: val
			});
		}
	};

	const removeUnderlying = pseudoId => {
		setUnderlyings(underlyings.filter(pId => pId !== pseudoId));
	};

	return (
		<>
			{underlyings.length > 0 && Object.keys(props.allUnderlyings).length > 0 && (
				<div style={{ fontFamily: 'arial' }}>
					{underlyings.map((pseudoId, index) => {
						if (!props.allUnderlyings[pseudoId]) {
							return;
						}
						let underlyingObj = props.allUnderlyings[pseudoId];
						return (
							<div key={'underlying_' + index} style={{ paddingTop: '20px' }}>
								<div
									key={'underlyingLabel_' + index}
									title={underlyingObj.contractAddress}
									style={{ display: 'flex', alignItems: 'center' }}>
									<ArrowRightIcon />
									{underlyingObj.name}
									<FontAwesomeIcon
										icon={faMinusCircle}
										style={styles.removeIcon}
										title="Remove underlying"
										onClick={() => removeUnderlying(pseudoId)}
									/>
									{underlyingObj.hasOwnProperty('addToFin4') && (
										<FontAwesomeIcon
											icon={faAsterisk}
											style={styles.newIcon}
											title="Will be created new during token creation"
										/>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
			{underlyings.length > 0 && <Spacer />}
			<>
				{mode === 'allCollapsed' && (
					<>
						<Button onClick={() => setMode('addExisting')} center="true" color="inherit">
							Add existing underlying
						</Button>
						<div style={{ marginBottom: '30px' }}></div>
						<Button
							center="true"
							color="inherit"
							onClick={() => {
								setMode('addNew');
								setNewUnderlyingDraft({
									pseudoId: '',
									id: null,
									name: '',
									contractAddress: '',
									addToFin4: true
								});
							}}>
							Add new underlying
						</Button>
					</>
				)}
				{mode === 'addExisting' && (
					<Dropdown
						onChange={e => {
							setUnderlyings([...underlyings, e.value]);
							setMode('allCollapsed');
						}}
						options={Object.keys(props.allUnderlyings)
							.filter(pseudoIdAll => underlyings.filter(pseudoId => pseudoId === pseudoIdAll).length === 0)
							.map(pseudoId => {
								return {
									value: pseudoId,
									label: props.allUnderlyings[pseudoId].name
								};
							})}
						label="Choose existing underlying"
					/>
				)}
				{mode === 'addNew' && (
					<>
						<TextField
							key="name-field"
							type="text"
							label="Name"
							value={newUnderlyingDraft.name}
							onChange={e => updateVal('name', e.target.value)}
							style={inputFieldStyle}
						/>
						<TextField
							key="contract-address-field"
							type="text"
							label="Contract address (optional)"
							value={newUnderlyingDraft.contractAddress}
							onChange={e => updateVal('contractAddress', e.target.value)}
							style={inputFieldStyle}
						/>
						<FormControlLabel
							control={
								<Checkbox
									checked={newUnderlyingDraft.addToFin4}
									onChange={() => updateVal('addToFin4', !newUnderlyingDraft.addToFin4)}
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
										underlying: newUnderlyingDraft
									});
									setUnderlyings([...underlyings, newUnderlyingDraft.pseudoId]);
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
			</>

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

export default drizzleConnect(StepUnderlying, mapStateToProps);
