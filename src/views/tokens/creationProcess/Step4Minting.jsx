import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { Checkbox, FormControlLabel, Radio, TextField } from '@material-ui/core';
import PropTypes from 'prop-types';

const PROPERTY_DEFAULT = {
	isMintable: true,
	Fin4ClaimingHasMinterRole: true,
	additionalMinterRoles: '',
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

	const [choice, setChoice] = useState('fixedAmount');

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;

		let fixed = getValue(draft, 'fixedAmount');
		setValue({
			isMintable: getValue(draft, 'isMintable'),
			Fin4ClaimingHasMinterRole: getValue(draft, 'Fin4ClaimingHasMinterRole'),
			additionalMinterRoles: getValue(draft, 'additionalMinterRoles'),
			fixedAmount: fixed,
			unit: getValue(draft, 'unit')
		});

		if (fixed === 0) {
			setChoice('variableAmount');
		}

		setDraftId(draft.id);
	});

	const buildCheckboxWithLabel = (label, fieldName, size = 'medium') => {
		return (
			<>
				<FormControlLabel
					control={
						<Checkbox
							size={size}
							checked={value[fieldName]}
							onChange={() => {
								updateVal(fieldName, !value[fieldName]);
							}}
						/>
					}
					label={<span style={{ fontSize: size === 'medium' ? '1rem' : '0.9rem' }}>{label}</span>}
				/>
				<br />
			</>
		);
	};

	const updateVal = (key, val) => {
		if (!val && (key === 'isMintable' || key === 'Fin4ClaimingHasMinterRole')) {
			setValue({
				...value,
				fixedAmount: 1,
				unit: 'quantity',
				[key]: val
			});
			setChoice('fixedAmount');
		} else {
			setValue({
				...value,
				[key]: val
			});
		}
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

	return (
		<>
			{buildCheckboxWithLabel('is mintable', 'isMintable')}
			{value.isMintable && (
				<div style={{ marginLeft: '40px', color: 'gray' }}>
					{buildCheckboxWithLabel('Fin4 has minter role', 'Fin4ClaimingHasMinterRole', 'small')}
					<TextField
						label="Additional minter roles" // TODO add to info text on the right side
						style={{ margin: '10px 0 10px 0' }}
						inputProps={{
							style: { fontSize: 'small', color: 'gray' }
						}}
						multiline
						rows="2"
						fullWidth
						variant="outlined"
						value={value.additionalMinterRoles}
						onChange={e => updateVal('additionalMinterRoles', e.target.value)}
					/>
				</div>
			)}
			{!value.isMintable && (
				<>
					<br />
					<center style={{ fontFamily: 'arial', color: 'orange' }}>You set your token to not be mintable.</center>
					<br />
				</>
			)}
			{!value.Fin4ClaimingHasMinterRole && value.isMintable && (
				<>
					<br />
					<center style={{ fontFamily: 'arial', color: 'orange' }}>
						You removed the address of the Fin4Claiming contract from the minter roles in the design step. Therefore a
						minting policy can't be effectuated from the Finance 4.0 system.
					</center>
					<br />
				</>
			)}
			{value.isMintable && value.Fin4ClaimingHasMinterRole && (
				<table>
					<tbody>
						<tr>
							<td style={{ width: '50%' }}>
								<FormControlLabel
									disabled={!value.Fin4ClaimingHasMinterRole}
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
									disabled={!value.Fin4ClaimingHasMinterRole}
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
									disabled={!value.Fin4ClaimingHasMinterRole}
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
			)}
			<br />
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

StepMinting.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(StepMinting);
