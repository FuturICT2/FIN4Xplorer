import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import Dropdown from '../../../components/Dropdown';
import Button from '../../../components/Button';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getRandomStringOfLength } from '../../../components/utils';
import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';

const PROPERTY_DEFAULT = {
	allowAdditionAfterCreation: false,
	allowCollateralUsageForOthers: true
};

function StepSourcerers(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [sourcererPairs, setSourcererPairs] = useState([]); // name and pairs[]
	const [mode, setMode] = useState('collapsed'); // addFromDropdown

	const [sourcererSettings, setSourcererSettings] = useState(PROPERTY_DEFAULT);

	const getValue = (draft, prop) => {
		return draft.sourcererSettings && draft.sourcererSettings.hasOwnProperty(prop)
			? draft.sourcererSettings[prop]
			: PROPERTY_DEFAULT[prop];
	};

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		setSourcererPairs(draft.sourcererPairs);
		setDraftId(draft.id);
		setSourcererSettings({
			allowAdditionAfterCreation: getValue(draft, 'allowAdditionAfterCreation'),
			allowCollateralUsageForOthers: getValue(draft, 'allowCollateralUsageForOthers')
		});
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'sourcererPairs',
			node: sourcererPairs
		});
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'sourcererSettings',
			node: sourcererSettings
		});
		props.handleNext();
	};

	let updateParamValOnPair = (pair, paramName, val) => {
		pair.parameters[paramName] = val;
		return pair;
	};

	const updateSourcererPairs = (id, paramName, val) => {
		setSourcererPairs(
			sourcererPairs.map(pair => {
				return pair.id === id ? updateParamValOnPair(pair, paramName, val) : pair;
			})
		);
	};

	const removeSourcerer = id => {
		setSourcererPairs(sourcererPairs.filter(pair => pair.id !== id));
	};

	const getSourcererById = id => {
		return sourcererPairs.filter(pair => pair.id === id)[0];
	};

	const buildCheckboxWithLabel = (label, fieldName, size = 'medium') => {
		return (
			<>
				<FormControlLabel
					control={
						<Checkbox
							size={size}
							checked={sourcererSettings[fieldName]}
							onChange={() => {
								setSourcererSettings({
									...sourcererSettings,
									[fieldName]: !sourcererSettings[fieldName]
								});
							}}
						/>
					}
					label={<div style={{ fontSize: size === 'medium' ? '1rem' : '0.9rem' }}>{label}</div>}
				/>
				<br />
			</>
		);
	};

	return (
		<>
			{sourcererPairs.length > 0 && Object.keys(props.allUnderlyings).length > 0 && (
				<div style={{ fontFamily: 'arial' }}>
					{sourcererPairs.map((pair, index) => {
						let name = pair.sourcererName;
						if (!props.allUnderlyings[name]) {
							return;
						}
						let underlyingObj = props.allUnderlyings[name];
						return (
							<div key={'sourcerer_' + index} style={{ paddingTop: '20px' }}>
								<div
									key={'sourcererLabel_' + index}
									title={underlyingObj.contractAddress}
									style={{ display: 'flex', alignItems: 'center' }}>
									<ArrowRightIcon />
									{underlyingObj.name}
									<FontAwesomeIcon
										icon={faMinusCircle}
										style={styles.removeIcon}
										title="Remove sourcerer"
										onClick={() => removeSourcerer(pair.id)}
									/>
								</div>
								{underlyingObj.paramsEncoded &&
									underlyingObj.paramsEncoded.split(',').map((paramStr, paramIndex) => {
										let type = paramStr.split(':')[0];
										let paramName = paramStr.split(':')[1];
										let description = paramStr.split(':')[2];
										let key = 'underlying_' + index + '_param_' + paramIndex;
										return (
											<span key={key}>
												<TextField
													type={type === 'uint' ? 'number' : 'text'}
													label={
														<>
															<span>{paramName}</span>
															{description && <span style={{ fontSize: 'x-small' }}> ({description})</span>}{' '}
														</>
													}
													defaultValue={getSourcererById(pair.id).parameters[paramName]}
													onChange={e => updateSourcererPairs(pair.id, paramName, e.target.value)}
													style={styles.normalField}
												/>
											</span>
										);
									})}
							</div>
						);
					})}
				</div>
			)}
			{sourcererPairs.length > 0 && <Spacer />}
			<>
				{mode === 'collapsed' && (
					<Button onClick={() => setMode('addFromDropdown')} center="true" color="inherit">
						Add Sourcerer
					</Button>
				)}
				{mode === 'addFromDropdown' && (
					<Dropdown
						onChange={e => {
							let name = e.value;
							let parameters = {};
							let underlyingObj = props.allUnderlyings[name];
							if (underlyingObj.paramsEncoded) {
								underlyingObj.paramsEncoded.split(',').map(paramStr => {
									let paramName = paramStr.split(':')[1];
									parameters[paramName] = paramName === 'exchangeRatio' ? 1 : null;
								});
							}
							setSourcererPairs([
								...sourcererPairs,
								{
									id: getRandomStringOfLength(3),
									sourcererName: name,
									parameters: parameters
								}
							]);
							setMode('collapsed');
						}}
						options={Object.keys(props.allUnderlyings).map(name => {
							return {
								value: name,
								label: name
							};
						})}
						label="Choose sourcerer"
					/>
				)}
				<br />
				{buildCheckboxWithLabel(
					t('token-creator.step6-sourcerers.settings.allow-new-pairs'),
					'allowAdditionAfterCreation',
					'small'
				)}
				{buildCheckboxWithLabel(
					t('token-creator.step6-sourcerers.settings.allow-others-collateral-usage'),
					'allowCollateralUsageForOthers',
					'small'
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
								{buildCheckboxWithLabel(
									'Only with this address as the beneficiary:',
									'CreateMSpairs_fixedBeneficiary',
									'small'
								)}
							</>
						}
					</div>*/}
			</>
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const Spacer = styled.div`
	height: 30px;
`;

const styles = {
	removeIcon: {
		color: 'lightsalmon',
		width: '14px',
		height: '14px',
		paddingLeft: '7px'
	},
	normalField: {
		width: '80%',
		margin: '8px 0 8px 25px'
	}
};

const mapStateToProps = state => {
	return {
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(StepSourcerers, mapStateToProps);
