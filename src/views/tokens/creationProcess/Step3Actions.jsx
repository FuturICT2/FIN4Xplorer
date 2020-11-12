import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { Checkbox, FormControlLabel, TextField, Radio } from '@material-ui/core';

function StepActions(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [actions, setActions] = useState({
		text: ''
	});

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		setActions({
			text: draft.actions.hasOwnProperty('text') ? draft.actions.text : ''
		});
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'actions',
			node: actions
		});
		props.handleNext();
	};

	const updateVal = (key, val) => {
		setActions({
			...actions,
			[key]: val
		});
	};

	return (
		<>
			<TextField
				multiline
				rows="3"
				fullWidth
				variant="outlined"
				value={actions.text}
				onChange={e => updateVal('text', e.target.value)}
			/>
			<br /><br />
			{/* TODO outsource strings below to translation files */}
			<FormControlLabel
				control={
					<Checkbox/>
				}
				label='Claimers have to pay a fee upfront'
			/>
			{true && (
				<>
					<TextField
						type='number'
						label='fee per claim in ETH'
					/>
					<br/><br/>
					<span style={{ fontFamily: 'arial' }}>Beneficiary:</span>
					<br/>
					<FormControlLabel
						control={<Radio />}
						label='Token creator (you)'
					/>
					<br/>
					<FormControlLabel
						control={<Radio />}
						label={
							<TextField
								type='text'
								label='Specific address'
								inputProps={{
									style: { fontSize: 'small' }
								}}
							/>
						}
					/>
					<br/><br/>
				</>
			)}
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

export default drizzleConnect(StepActions);
