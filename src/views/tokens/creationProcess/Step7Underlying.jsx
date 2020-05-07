import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import Dropdown from '../../../components/Dropdown';
import Button from '../../../components/Button';

function StepUnderlying(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [underlyings, setUnderlyings] = useState([]); // just their Ids
	const [newUnderlyingDraft, setNewUnderlyingDraft] = useState({});

	const [mode, setMode] = useState('allCollapsed'); // addExisting, addNew

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		setUnderlyings(draft.underlyings);
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'underlyings',
			node: {}
		});
		props.handleNext();
	};

	const updateOptions = () => {
		// return only options that are in the redux list of all underlying and NOT in the already selected ones here
		return props.allUnderlyings.filter(reduxEl => underlyings.filter(el => el.name === reduxEl.name).length === 0);
	};

	const updateVal = (key, val) => {
		setNewUnderlyingDraft({
			...newUnderlyingDraft,
			[key]: val
		});
	};

	return (
		<>
			{underlyings && <></>}
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
									id: props.allUnderlyings.length, // pseudo ID for use in redux
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
						options={props.allUnderlyings.map(el => {
							return {
								value: el.id,
								label: el.name
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
									setUnderlyings([...underlyings, newUnderlyingDraft.id]);
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
