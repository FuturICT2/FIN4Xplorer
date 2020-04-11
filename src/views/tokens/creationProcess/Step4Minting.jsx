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
	const [minting, setMinting] = useState(PROPERTY_DEFAULT);

	const getValue = (draft, prop) => {
		return draft.minting.hasOwnProperty(prop) ? draft.minting[prop] : PROPERTY_DEFAULT[prop];
	};

	const [choice, setChoice] = useState('fixedAmount');

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;

		let fixed = getValue(draft, 'fixedAmount');
		setMinting({
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
							checked={minting[fieldName]}
							onChange={() => {
								updateVal(fieldName, !minting[fieldName]);
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
			setMinting({
				...minting,
				fixedAmount: 1,
				unit: 'quantity',
				[key]: val
			});
			setChoice('fixedAmount');
		} else {
			setMinting({
				...minting,
				[key]: val
			});
		}
	};

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'minting',
			node: minting
		});
		props.handleNext();
	};

	return (
		<>
			{buildCheckboxWithLabel('Token is mintable', 'isMintable')}
			{minting.isMintable && (
				<>
					{buildCheckboxWithLabel('Fin4 has the minter role', 'Fin4ClaimingHasMinterRole')}
					<TextField
						label="Additional minter roles" // TODO add to info text on the right side
						style={{ margin: '10px 0 10px 0' }}
						inputProps={{
							style: { fontSize: 'small' }
						}}
						multiline
						rows="2"
						fullWidth
						variant="outlined"
						value={minting.additionalMinterRoles}
						onChange={e => updateVal('additionalMinterRoles', e.target.value)}
					/>
				</>
			)}
			{!minting.isMintable && (
				<>
					<br />
					<center style={{ fontFamily: 'arial', color: 'orange' }}>You set your token to not be mintable.</center>
					<br />
				</>
			)}
			{!minting.Fin4ClaimingHasMinterRole && minting.isMintable && (
				<>
					<br />
					<center style={{ fontFamily: 'arial', color: 'orange' }}>
						You removed the address of the Fin4Claiming contract from the minter roles in the design step. Therefore a
						minting policy can't be effectuated from the Finance 4.0 system.
					</center>
					<br />
				</>
			)}
			{minting.isMintable && minting.Fin4ClaimingHasMinterRole && (
				<table>
					<tbody>
						<tr>
							<td style={{ width: '50%' }}>
								<FormControlLabel
									disabled={!minting.Fin4ClaimingHasMinterRole}
									checked={choice === 'fixedAmount'}
									control={<Radio />}
									label="Fixed amount"
									onChange={e => {
										setChoice('fixedAmount');
										setMinting({
											...minting,
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
									value={minting.fixedAmount}
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
									disabled={!minting.Fin4ClaimingHasMinterRole}
									checked={choice === 'variableAmount'}
									control={<Radio />}
									label="Variable amount"
									onChange={e => {
										setChoice('variableAmount');
										setMinting({
											...minting,
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
									disabled={!minting.Fin4ClaimingHasMinterRole}
									type="text"
									label="Unit of measurement"
									value={minting.unit}
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
