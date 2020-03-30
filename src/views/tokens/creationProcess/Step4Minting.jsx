import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { FormControlLabel, Radio, TextField } from '@material-ui/core';
import PropTypes from 'prop-types';

const PROPERTY_DEFAULT = {
	fixedAmount: 1,
	unit: 'quantity'
};

function StepMinting(props, context) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [value, setValue] = useState(PROPERTY_DEFAULT);

	const getValue = (draft, prop) => {
		return draft.value.hasOwnProperty(prop) ? draft.value[prop] : PROPERTY_DEFAULT[prop];
	};

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;

		let fixed = getValue(draft, 'fixedAmount');
		setValue({
			fixedAmount: fixed,
			unit: getValue(draft, 'unit')
		});

		if (fixed === 0) {
			setChoice('variableAmount');
		}

		if (!draft.properties.isMintable) {
			setChoice('isMintableFalse');
		} else if (!draft.properties.Fin4ClaimingHasMinterRole) {
			setChoice('fin4HasNoMinterRole');
		}

		setDraftId(draft.id);
	});

	const updateVal = (key, val) => {
		setValue({
			...value,
			[key]: val
		});
	};

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'value',
			node: value
		});
		props.handleNext();
	};

	const [choice, setChoice] = useState('fixedAmount');

	const disabled = () => {
		return choice === 'isMintableFalse' || choice === 'fin4HasNoMinterRole';
	};

	return (
		<>
			{choice === 'isMintableFalse' && (
				<>
					<center style={{ fontFamily: 'arial', color: 'orange' }}>
						You set your token to not be mintable in the design step.
					</center>
					<br />
				</>
			)}
			{choice === 'fin4HasNoMinterRole' && (
				<>
					<center style={{ fontFamily: 'arial', color: 'orange' }}>
						You removed the address of the Fin4Claiming contract from the minter roles in the design step. Therefore a
						minting policy can't be effectuated from the Finance 4.0 system.
					</center>
					<br />
				</>
			)}
			<table>
				<tbody>
					<tr>
						<td style={{ width: '50%' }}>
							<FormControlLabel
								disabled={disabled()}
								checked={choice === 'fixedAmount'}
								control={<Radio />}
								label="Fixed amount"
								onChange={e => {
									setChoice('fixedAmount');
									setValue({
										...value,
										fixedAmount: 1
									});
								}}
							/>
						</td>
						<td>
							<TextField
								disabled={choice !== 'fixedAmount'}
								type="number"
								label="per claim"
								value={value.fixedAmount}
								onChange={e => updateVal('fixedAmount', Number(e.target.value))}
							/>
						</td>
					</tr>
					<tr>
						<td>&nbsp;</td>
						<td>&nbsp;</td>
					</tr>
					<tr>
						<td colSpan={2}>
							<FormControlLabel
								disabled={disabled()}
								checked={choice === 'variableAmount'}
								control={<Radio />}
								label="Variable amount"
								onChange={e => {
									setChoice('variableAmount');
									setValue({
										...value,
										fixedAmount: 0
									});
								}}
							/>
						</td>
					</tr>
					<tr>
						<td colSpan={2}>
							<br />
							<TextField
								disabled={disabled()}
								type="text"
								label="Unit of measurement"
								value={value.unit}
								onChange={e => updateVal('unit', e.target.value)}
								style={{ width: '100%' }}
							/>
						</td>
					</tr>
				</tbody>
			</table>
			<br />
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

StepMinting.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(StepMinting);
