import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { Checkbox, FormControlLabel, Radio, TextField } from '@material-ui/core';
import PropTypes from 'prop-types';
import { UnderlyingsActive } from '../../../components/utils';

const PROPERTY_DEFAULT = {
	isMintable: true,
	Fin4ClaimingHasMinterRole: true,
	MintingSourcererHasMinterRole: false,
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
			MintingSourcererHasMinterRole: getValue(draft, 'MintingSourcererHasMinterRole'),
			additionalMinterRoles: getValue(draft, 'additionalMinterRoles'),
			fixedAmount: fixed,
			unit: draft.minting.hasOwnProperty('unit')
				? draft.minting.unit
				: t('token-creator.step4-minting.fields.unit.default-value')
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
			{buildCheckboxWithLabel(t('token-creator.step4-minting.fields.is-mintable.label'), 'isMintable')}
			{minting.isMintable && (
				<>
					{buildCheckboxWithLabel(
						t('token-creator.step4-minting.fields.fin4-has-minter-role.label'),
						'Fin4ClaimingHasMinterRole'
					)}
					{UnderlyingsActive &&
						buildCheckboxWithLabel(
							t('token-creator.step4-minting.fields.minting-sourcerer-has-minter-role.label'),
							'MintingSourcererHasMinterRole'
						)}
					{/*<div style={minting.MintingSourcererHasMinterRole ? styles.divOutline : null}>
						{UnderlyingsActive &&
							buildCheckboxWithLabel(
								t('token-creator.step4-minting.fields.minting-sourcerer-has-minter-role.label'),
								'MintingSourcererHasMinterRole'
							)}
						{minting.MintingSourcererHasMinterRole &&
							<>
								<br/>
								<span style={{ fontFamily: 'arial' }}>Optional: restrict the Minting-Sourcerer pairs this token can be used as collateral in:</span>
								{buildCheckboxWithLabel(
									'Only I can create such pairs',
									'CreateMSpairs_onlyMe',
									'small'
								)}
								{buildCheckboxWithLabel(
									'Only users in this group can create such pairs:',
									'CreateMSpairs_onlyThisGroup',
									'small'
								)}
								{buildCheckboxWithLabel(
									'Such pairs can only be made for tokens in this collection:',
									'CreateMSpairs_onlyForTokensInThisCollection',
									'small'
								)}
								{buildCheckboxWithLabel(
									'There can\'t be more than this many such pairs:',
									'CreateMSpairs_maxNumber',
									'small'
								)}
							</>
						}
					</div>*/}
					<TextField
						label={t('token-creator.step4-minting.fields.additional-minter-roles.label')}
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
					<center style={{ fontFamily: 'arial', color: 'orange' }}>
						{t('token-creator.step4-minting.fields.is-mintable.hint')}
					</center>
					<br />
				</>
			)}
			{!minting.Fin4ClaimingHasMinterRole && minting.isMintable && (
				<>
					<br />
					<center style={{ fontFamily: 'arial', color: 'orange' }}>
						{t('token-creator.step4-minting.fields.fin4-has-minter-role.hint')}
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
									label={t('token-creator.step4-minting.fields.fixed-amount.label')}
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
									label={t('token-creator.step4-minting.fields.per-claim.label')}
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
									label={t('token-creator.step4-minting.fields.variable-amount.label')}
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
									label={t('token-creator.step4-minting.fields.unit.label')}
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
