import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { FormControlLabel, Radio, RadioGroup, TextField } from '@material-ui/core';

const PROPERTY_DEFAULT = {
	fixedQuantity: 1,
	userDefinedQuantityFactor: 0,
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
		let userDef = getValue(draft, 'userDefinedQuantityFactor'); // TODO rename to tokenCreatorDefined...?
		setValue({
			fixedQuantity: fixed,
			userDefinedQuantityFactor: userDef,
			unit: getValue(draft, 'unit')
		});

		if (!(fixed === 0 || userDef === 0)) {
			alert('Both fixedQuantity and userDefinedQuantityFactor are set. One of them must be zero.');
		}

		if (userDef !== 0) {
			setChoice('userDefinedQuantityFactor');
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
				<center style={{ fontFamily: 'arial', color: 'orange' }}>
					You set your token to not be mintable in the design step. Approving claims won't mint a balance to the
					claimer.
				</center>
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
										fixedQuantity: 1,
										userDefinedQuantityFactor: 0
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
						<td>
							<FormControlLabel
								disabled={choice === 'isMintableFalse'}
								checked={choice === 'userDefinedQuantityFactor'}
								control={<Radio />}
								label="Fixed factor"
								onChange={e => {
									setChoice('userDefinedQuantityFactor');
									setValue({
										...value,
										fixedQuantity: 0,
										userDefinedQuantityFactor: 1
									});
								}}
							/>
						</td>
						<td>
							<TextField
								disabled={choice !== 'userDefinedQuantityFactor'}
								type="number"
								label="multiplication factor"
								value={value.userDefinedQuantityFactor}
								onChange={e => updateVal('userDefinedQuantityFactor', Number(e.target.value))}
								style={{ paddingBottom: '10px' }}
							/>
							<TextField
								disabled={choice !== 'userDefinedQuantityFactor'}
								type="text"
								label="unit"
								value={value.unit}
								onChange={e => updateVal('unit', e.target.value)}
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
