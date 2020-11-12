import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { Checkbox, FormControlLabel, TextField, Radio } from '@material-ui/core';

const PROPERTY_DEFAULT = {
	text: '',
	feesActive: false,
	feeAmountPerClaim: 0.0025,
	feeBeneficiary: 'token-creator'
};

function StepActions(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [actions, setActions] = useState(PROPERTY_DEFAULT);

	const getValue = (draft, prop) => {
		return draft.properties.hasOwnProperty(prop) ? draft.properties[prop] : PROPERTY_DEFAULT[prop];
	};

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		setActions({
			text: getValue(draft, 'text'),
			feesActive: getValue(draft, 'feesActive'),
			feeAmountPerClaim: getValue(draft, 'feeAmountPerClaim'),
			feeBeneficiary: getValue(draft, 'feeBeneficiary'),
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
					<Checkbox
						checked={actions.feesActive}
						onChange={() => {
							updateVal('feesActive', !actions.feesActive);
						}}
					/>
				}
				label='Claimers have to pay a fee upfront'
			/>
			{actions.feesActive && (
				<>
					<TextField
						type='number'
						label='fee per claim in ETH'
						value={actions.feeAmountPerClaim}
						onChange={e => updateVal('feeAmountPerClaim', Number(e.target.value))}
					/>
					<br/><br/>
					<span style={{ fontFamily: 'arial' }}>Beneficiary:</span>
					<br/>
					<FormControlLabel
						checked={actions.feeBeneficiary === 'token-creator'}
						control={<Radio />}
						label='Token creator (you)'
						onChange={e => updateVal('feeBeneficiary', 'token-creator')}
					/>
					<br/>
					<FormControlLabel
						checked={actions.feeBeneficiary !== 'token-creator'}
						control={<Radio />}
						label={
							<TextField
								disabled={actions.feeBeneficiary === 'token-creator'}
								type='text'
								label='Specific address'
								inputProps={{
									style: { fontSize: 'small' }
								}}
								value={actions.feeBeneficiary === 'token-creator' ? '' : actions.feeBeneficiary}
								onChange={e => updateVal('feeBeneficiary', e.target.value)}
							/>
						}
						onChange={e => updateVal('feeBeneficiary', '')}
					/>
					<br/><br/>
				</>
			)}
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

export default drizzleConnect(StepActions);
