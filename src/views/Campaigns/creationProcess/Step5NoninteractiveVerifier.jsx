import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import Dropdown from '../../../components/Dropdown';
import Button from '../../../components/Button';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { TextField } from '@material-ui/core';
import styled from 'styled-components';
import { findVerifierTypeAddressByContractName } from '../../../components/utils';

function StepNoninteractiveVerifier(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const [verifiersAdded, setVerifiersAdded] = useState([]);
	const verifiers = useRef({});

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		verifiers.current = draft.noninteractiveVerifiers;

		setVerifiersAdded(
			Object.keys(draft.noninteractiveVerifiers).map(contractName =>
				findVerifierTypeAddressByContractName(props.verifierTypes, contractName)
			)
		);
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'noninteractiveVerifiers',
			node: verifiers.current
		});
		props.handleNext();
	};

	const addVerifier = addr => {
		let verifier = props.verifierTypes[addr];
		let contractName = verifier.contractName;

		verifiers.current[contractName] = {
			parameters: {}
		};

		if (verifier.paramsEncoded) {
			verifiers.current[contractName].parameters = {};
			verifier.paramsEncoded.split(',').map(paramStr => {
				let paramName = paramStr.split(':')[1];
				verifiers.current[contractName].parameters[paramName] = null;
			});
		}

		setVerifiersAdded(verifiersAdded.concat(addr));
		setShowDropdown(false);
	};

	const removeVerifier = addr => {
		setVerifiersAdded(verifiersAdded.filter(a => a !== addr));
		delete verifiers.current[props.verifierTypes[addr].contractName];
	};

	return (
		<>
			{verifiersAdded.length > 0 && Object.keys(props.verifierTypes).length > 0 && (
				<div style={{ fontFamily: 'arial' }}>
					{verifiersAdded.map((verifierAddress, index) => {
						let verifier = props.verifierTypes[verifierAddress];
						let name = verifier.label;
						let contractName = verifier.contractName;
						return (
							<div key={'verifier_' + index} style={{ paddingTop: '20px' }}>
								<div
									key={'verifierLabel_' + index}
									title={verifier.description}
									style={{ display: 'flex', alignItems: 'center' }}>
									<ArrowRightIcon />
									{name}
									<FontAwesomeIcon
										icon={faMinusCircle}
										style={styles.removeIcon}
										title={t('token-creator.step5-verifiers1.fields.remove-verifier-tooltip.label')}
										onClick={() => removeVerifier(verifierAddress)}
									/>
									{verifier.paramsEncoded.length > 0 && (
										<FontAwesomeIcon
											icon={faPlusSquare}
											style={styles.plusIcon}
											title={t('token-creator.step5-verifiers1.fields.verifier-to-parameterize-tooltip.label')}
										/>
									)}
								</div>
								{verifier.paramsEncoded &&
									verifier.paramsEncoded.split(',').map((paramStr, paramIndex) => {
										// e.g. uint:interval:days,uint:maxQuantity:quantity
										let type = paramStr.split(':')[0];
										let isArray = type.includes('[]');
										let paramName = paramStr.split(':')[1];
										let description = paramStr.split(':')[2];
										let key = 'verifier_' + index + '_param_' + paramIndex;
										return (
											<span key={key}>
												<TextField
													type={type === 'uint' ? 'number' : 'text'}
													label={
														<>
															<span>{paramName}</span>
															{description && <small> ({description})</small>}{' '}
														</>
													}
													inputProps={{
														style: { fontSize: isArray ? 'small' : 'medium' }
													}}
													multiline={isArray ? true : null}
													rows={isArray ? 1 : null}
													variant={isArray ? 'outlined' : 'standard'}
													defaultValue={verifiers.current[contractName].parameters[paramName]}
													onChange={e => (verifiers.current[contractName].parameters[paramName] = e.target.value)}
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
			{verifiersAdded.length > 0 && <Spacer />}
			{showDropdown ? (
				<Dropdown
					onChange={e => addVerifier(e.value)}
					options={Object.keys(props.verifierTypes)
						.filter(addr => props.verifierTypes[addr].isNoninteractive)
						.filter(addr => !verifiers.current[props.verifierTypes[addr].label])
						.map(addr => props.verifierTypes[addr])}
					label={t('token-creator.step5-verifiers1.fields.add-token-verifier.label')}
				/>
			) : (
				<Button onClick={() => setShowDropdown(true)} center="true" color="inherit">
					{t('token-creator.step5-verifiers1.fields.add-button.label')}
				</Button>
			)}
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
	plusIcon: {
		color: 'lightgreen',
		width: '16px',
		height: '16px',
		paddingLeft: '7px'
	},
	normalField: {
		width: '80%',
		margin: '8px 0 8px 25px'
	}
};

const mapStateToProps = state => {
	return {
		verifierTypes: state.fin4Store.verifierTypes
	};
};

export default drizzleConnect(StepNoninteractiveVerifier, mapStateToProps);
