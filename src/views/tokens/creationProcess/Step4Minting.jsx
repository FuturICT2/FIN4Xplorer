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
	const value = useRef({});

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
		value.current = {
			fixedQuantity: fixed,
			userDefinedQuantityFactor: userDef,
			unit: getValue(draft, 'unit')
		};

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

	const submit = () => {
		if (choice === 'fixedQuantity') {
			value.current.userDefinedQuantityFactor = 0;
		}

		if (choice === 'userDefinedQuantityFactor') {
			value.current.fixedQuantity = 0;
		}

		if (choice === 'isMintableFalse') {
			// TODO otherwise errors on the smart contract
			// handle this differently? #ConceptualDecision
			value.current.fixedQuantity = 1;
			value.current.userDefinedQuantityFactor = 0;
		}

		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'value',
			node: value.current
		});
		props.handleNext();
	};

	const [choice, setChoice] = useState('fixedQuantity');

	return (
		<>
			{draftId && (
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
										onChange={e => setChoice('fixedQuantity')}
									/>
								</td>
								<td>
									<TextField
										disabled={choice !== 'fixedQuantity'}
										type="number"
										label="per claim"
										defaultValue={value.current.fixedQuantity}
										onChange={e => (value.current.fixedQuantity = e.target.value)}
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
										onChange={e => setChoice('userDefinedQuantityFactor')}
									/>
								</td>
								<td>
									<TextField
										disabled={choice !== 'userDefinedQuantityFactor'}
										type="number"
										label="multiplication factor"
										defaultValue={value.current.userDefinedQuantityFactor}
										onChange={e => (value.current.userDefinedQuantityFactor = e.target.value)}
										style={{ paddingBottom: '10px' }}
									/>
									<TextField
										disabled={choice !== 'userDefinedQuantityFactor'}
										type="text"
										label="unit"
										defaultValue={value.current.unit}
										onChange={e => (value.current.unit = e.target.value)}
									/>
								</td>
							</tr>
						</tbody>
					</table>
					<br />
					<StepsBottomNav nav={props.nav} handleNext={submit} />
				</>
			)}
		</>
	);
}

export default drizzleConnect(StepMinting);
