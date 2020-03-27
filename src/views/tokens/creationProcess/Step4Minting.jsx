import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { FormControlLabel, Radio, RadioGroup, TextField } from '@material-ui/core';

const PROPERTY_DEFAULT = {
	fixedQuantity: 1,
	unit: 'quantity'
};

function StepMinting(props) {
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

		let fixed = getValue(draft, 'fixedQuantity');
		setValue({
			fixedQuantity: fixed,
			unit: getValue(draft, 'unit')
		});

		if (fixed === 0) {
			setChoice('variableAmount');
		}

		if (!draft.properties.isMintable) {
			setChoice('isMintableFalse');
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

	const [choice, setChoice] = useState('fixedQuantity');

	return (
		<>
			{choice === 'isMintableFalse' && (
				<>
					<center style={{ fontFamily: 'arial', color: 'orange' }}>
						You set your token to not be mintable in the design step. Approving claims won't mint a balance to the
						claimer.
					</center>
					<br />
				</>
			)}
			<table>
				<tbody>
					<tr>
						<td style={{ width: '50%' }}>
							<FormControlLabel
								disabled={choice === 'isMintableFalse'}
								checked={choice === 'fixedQuantity'}
								control={<Radio />}
								label="Fixed amount"
								onChange={e => {
									setChoice('fixedQuantity');
									setValue({
										...value,
										fixedQuantity: 1
									});
								}}
							/>
						</td>
						<td>
							<TextField
								disabled={choice !== 'fixedQuantity'}
								type="number"
								label="per claim"
								value={value.fixedQuantity}
								onChange={e => updateVal('fixedQuantity', Number(e.target.value))}
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
								disabled={choice === 'isMintableFalse'}
								checked={choice === 'variableAmount'}
								control={<Radio />}
								label="Variable amount"
								onChange={e => {
									setChoice('variableAmount');
									setValue({
										...value,
										fixedQuantity: 0
									});
								}}
							/>
						</td>
					</tr>
					<tr>
						<td colSpan={2}>
							<br />
							<TextField
								disabled={choice === 'isMintableFalse'}
								type="text"
								label="unit"
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

export default drizzleConnect(StepMinting);
