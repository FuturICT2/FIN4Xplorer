import React, { useEffect, useState, useRef } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import Box from '../../components/Box';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import StepIdentity from './creationProcess/Step1Identity';
import StepDesign from './creationProcess/Step2Design';
import StepActions from './creationProcess/Step3Actions';
import StepMinting from './creationProcess/Step4Minting';
import StepSearchVerifier from './creationProcess/Step5SearchVerifier';
import StepSourcerers from './creationProcess/Step6Sourcerers';
import StepExternalUnderlyings from './creationProcess/Step7ExternalUnderlyings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import {
	findVerifierTypeAddressByContractName,
	BNstr,
	stringToBytes32,
	UnderlyingsActive,
	Fin4Colors
} from '../../components/utils';
import { findTokenBySymbol, contractCall, zeroAddress } from '../../components/Contractor';
import CheckIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { IconButton } from '@material-ui/core';
import history from '../../components/history';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Checkbox, FormControlLabel } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
	// from https://material-ui.com/components/steppers/
	root: {
		width: '100%'
	},
	backButton: {
		marginRight: theme.spacing(1)
	},
	instructions: {
		fontSize: 'large',
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1)
	}
}));

function TokenCreationProcess(props, context) {
	const { t } = useTranslation();
	const classes = useStyles();

	// TEXT CONTENT START

	const getSteps = () => {
		// ['Identity', 'Design', 'Actions', 'Minting', 'Verifying', 'Sourcerers', 'ExternalUnderlyings']; // Disbursement/Valuation instead of Value?
		const steps = [];
		const numbOfSteps = UnderlyingsActive ? 7 : 5;
		for (let i = 0; i < numbOfSteps; i++) {
			steps.push('');
		}
		return steps;
	};

	const getStepContent = stepIndex => {
		switch (stepIndex) {
			case 0:
				return t('token-creator.step1-identity.title');
			case 1:
				return t('token-creator.step2-design.title');
			case 2:
				return t('token-creator.step3-actions.title');
			case 3:
				return t('token-creator.step4-minting.title');
			case 4:
				return t('token-creator.step5-verifiers.title');
			case 5:
				return UnderlyingsActive ? t('token-creator.step6-sourcerers.title') : '';
			case 6:
				return t('token-creator.step7-underlyings.title');
			default:
				return '';
		}
	};

	const buildInfoContent = (stepName, fieldNames = []) => {
		let items = [];
		items.push(
			<div key={stepName + '_info'}>
				{t('token-creator.' + stepName + '.info')}
				<br />
				<br />
				<br />
			</div>
		);
		fieldNames.map((field, index) => {
			let translationKey = 'token-creator.' + stepName + '.fields.' + field;
			items.push(
				<div key={stepName + '_' + field}>
					<b>{t(translationKey + '.label')}</b>
					<br />
					{t(translationKey + '.info')}
					<br />
					<br />
				</div>
			);
		});
		return <>{items}</>;
	};

	const getStepInfoBoxContent = (stepIndex, verifierTypes) => {
		switch (stepIndex) {
			case 0:
				return buildInfoContent('step1-identity', ['name', 'symbol', 'short-description', 'long-description']);
			case 1:
				return buildInfoContent('step2-design', [
					'is-capped',
					'cap',
					'initial-supply',
					'token-creator-owns-initial-supply',
					'other-initial-supply-owner',
					'is-transferable',
					'is-burnable',
					'decimals'
				]);
			case 2:
				return buildInfoContent('step3-actions');
			case 3:
				return buildInfoContent('step4-minting', [
					'is-mintable',
					'fin4-has-minter-role',
					'minting-sourcerer-has-minter-role',
					'additional-minter-roles',
					'fixed-amount',
					'variable-amount',
					'unit'
				]);
			case 4:
				return (
					<>
						{t('token-creator.step5-verifiers.info')}
						<br />
						<br />
						{t('token-creator.step5-verifiers.listing-header') + ':'}
						<br />
						<br />
						{Object.keys(verifierTypes).map((verifierAddr, idx) => {
							let verifier = verifierTypes[verifierAddr];
							return (
								<span key={'verifierInfo_' + idx}>
									<b>{verifier.label}</b>
									<br />
									{verifier.description}
									<br />
									<br />
								</span>
							);
						})}
					</>
				);
			case 5: // Sourcerers
				return '';
			case 6: // External source of value
				return '';
			default:
				return '';
		}
	};

	// TEXT CONTENT END

	const [draftId, setDraftId] = useState(null);

	useEffect(() => {
		let draftIdViaURL = props.match.params.draftId;
		if (draftId || !draftIdViaURL || !props.tokenCreationDrafts[draftIdViaURL]) {
			return;
		}

		// TODO browser back/forth navigation doesn't work, should be possible to make it work
		let stepIdViaURL = props.match.params.stepId;
		if (stepIdViaURL && Number(stepIdViaURL) > 0 && Number(stepIdViaURL) <= 8) {
			setActiveStep(Number(stepIdViaURL) - 1);
		} else {
			modifyURL(draftIdViaURL, 1);
		}

		setDraftId(draftIdViaURL);
	});

	const [activeStep, setActiveStep] = useState(0);

	const modifyURL = (_draftId, step) => {
		window.history.pushState('', '', '/token/create/' + _draftId + '/' + step);
	};

	const handleNext = () => {
		modifyURL(draftId, activeStep + 2);
		setActiveStep(prevActiveStep => prevActiveStep + 1);
	};

	const handleBack = () => {
		modifyURL(draftId, activeStep);
		setActiveStep(prevActiveStep => prevActiveStep - 1);
	};

	const handleReset = () => {
		modifyURL(draftId, 1);
		setActiveStep(0);
	};

	const buildStepComponent = component => {
		return React.createElement(component, {
			draft: props.tokenCreationDrafts[draftId],
			nav: [activeStep, getSteps().length, classes, handleBack],
			handleNext: handleNext
		});
	};

	const [showInfoBox, setShowInfoBox] = useState(false);

	const validateDraft = draft => {
		// TODO do a proper validation with warning-signs in the respective steps

		if (!draft.basics.name || draft.basics.name.trim().length === 0) {
			// check for letters only too?
			return t('token-creator.validation.name-empty');
		}

		if (!draft.basics.symbol || draft.basics.symbol.length < 3 || draft.basics.symbol.length > 5) {
			return t('token-creator.validation.symbol-length-wrong');
		}

		// do a call to check on the contract here instead?
		if (findTokenBySymbol(props, draft.basics.symbol) !== null) {
			return t('token-creator.validation.symbol-duplicate');
		}

		if (draft.verifiers.Location) {
			let latLonStr = draft.verifiers.Location.parameters['latitude / longitude'];
			if (latLonStr.split('/').length !== 2) {
				// also check for other possibly wrong cases?
				return "The 'latitude / longitude' field of the location verifier must use '/' as separator";
			}
		}
		if (draft.verifiers.Password) {
			let pass = draft.verifiers.Password.parameters['password'];
			var decimal = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
			if (!pass.match(decimal)) {
				return "The password you have chosen doesn't abide by the rules described";
			}
		}

		// TODO validate addresses in arrays: AllowOnlyThese, BlockThese, ApprovalByUsersOrGroups
		// and block if arrays are empty

		return '';
	};

	const createToken = () => {
		let draft = props.tokenCreationDrafts[draftId];

		let validationResult = validateDraft(draft);
		if (validationResult) {
			alert(validationResult);
			return;
		}

		if (!keepAsDraft) {
			props.dispatch({
				type: 'DELETE_TOKEN_CREATION_DRAFT',
				draftId: draftId
			});
		}

		let defaultAccount = props.store.getState().fin4Store.defaultAccount;

		let tokenCreationArgs = [
			draft.basics.name,
			draft.basics.symbol,
			[draft.properties.isBurnable, draft.properties.isTransferable, draft.minting.isMintable],
			[
				draft.properties.decimals, // TODO restrict to max 18. Default 18 too? #ConceptualDecision
				BNstr(draft.properties.initialSupply),
				BNstr(draft.properties.cap)
			],
			draft.properties.initialSupplyOwner === 'token-creator' ? defaultAccount : draft.properties.initialSupplyOwner
		];

		// MINTER ROLES

		let minterRoles = [];
		if (draft.minting.additionalMinterRoles.length > 0) {
			minterRoles = draft.minting.additionalMinterRoles.split(',').map(addr => addr.trim());
		}
		if (draft.minting.Fin4ClaimingHasMinterRole) {
			minterRoles.push(context.drizzle.contracts.Fin4Claiming.address);
		}
		if (draft.minting.MintingSourcererHasMinterRole) {
			minterRoles.push(context.drizzle.contracts.MintingSourcerer.address);
			// TODO
		}

		// VERIFIERS

		// TODO post-merge simplify?
		let verifiers = {
			...draft.verifiers
		};

		// SOURCERERS
		// pairs

		let sourcerersToParameterize = [];

		transactionsRequired.current += draft.sourcererPairs.length;

		for (let i = 0; i < draft.sourcererPairs.length; i++) {
			let pair = draft.sourcererPairs[i];
			let underlyingsObj = props.allUnderlyings[pair.sourcererName];

			// use the split-string again to ensure the right oder of values
			let values = underlyingsObj.paramsEncoded.split(',').map(paramStr => {
				let pName = paramStr.split(':')[1];
				let val = pair.parameters[pName];
				if (pName === 'beneficiary' && !val) {
					return zeroAddress;
				}
				return val;
			});
			if (pair.sourcererName === 'BurnSourcerer') {
				// hacking it in here to be able to use the same setParameters() method in all sourcerers
				values.splice(1, 0, zeroAddress);
			}
			sourcerersToParameterize.push({
				name: pair.sourcererName,
				values: values
			});
		}

		// settings
		// TODO a more elegant way to do this?

		let sourcererSettingValues = [];

		let allowAdditionAfterCreation = draft.sourcererSettings.allowAdditionAfterCreation;
		let allowCollateralUsageForOthers = draft.sourcererSettings.allowCollateralUsageForOthers;

		if (!allowAdditionAfterCreation && allowCollateralUsageForOthers) {
			// default, leave array empty
		} else {
			// if not default, we are making the call to the contract and then need both booleans
			sourcererSettingValues.push(allowAdditionAfterCreation);
			sourcererSettingValues.push(allowCollateralUsageForOthers);
		}

		if (sourcererSettingValues.length > 0) {
			transactionsRequired.current += 1;
		}

		// EXTERNAL UNDERLYINGS

		let externalUnderlyings = [];
		let newExternalUnderlyings = {
			names: [],
			contractAddresses: [],
			attachments: [],
			usableForAlls: []
		};
		for (let i = 0; i < draft.externalUnderlyings.length; i++) {
			let name = draft.externalUnderlyings[i];
			let underlyingObj = props.allUnderlyings[name];
			let nameBytes32 = stringToBytes32(underlyingObj.name);
			externalUnderlyings.push(nameBytes32);
			if (underlyingObj.hasOwnProperty('usableForAll')) {
				newExternalUnderlyings.names.push(nameBytes32);
				newExternalUnderlyings.contractAddresses.push(
					underlyingObj.contractAddress ? underlyingObj.contractAddress : zeroAddress
				);
				newExternalUnderlyings.attachments.push(stringToBytes32(underlyingObj.attachment));
				newExternalUnderlyings.usableForAlls.push(underlyingObj.usableForAll);
			}
		}

		if (newExternalUnderlyings.names.length > 0) {
			transactionsRequired.current += 1;
		}

		let postCreationStepsArgs = [
			null, // token address
			Object.keys(verifiers).map(contractName =>
				findVerifierTypeAddressByContractName(props.verifierTypes, contractName)
			),
			minterRoles,
			draft.basics.description,
			draft.actions.text,
			draft.minting.fixedAmount,
			draft.minting.unit,
			externalUnderlyings
		];

		let tokenCreatorContract = draft.properties.isCapped ? 'Fin4CappedTokenCreator' : 'Fin4UncappedTokenCreator';

		// verifier types with parameters
		let verifiersToParameterize = [];
		for (var name in verifiers) {
			if (verifiers.hasOwnProperty(name)) {
				let verifier = verifiers[name];
				let parameterNames = Object.keys(verifier.parameters);
				if (parameterNames.length === 0) {
					continue;
				}
				transactionsRequired.current++;
				let values = parameterNames.map(pName => verifier.parameters[pName]);
				verifiersToParameterize.push({
					name: name,
					values: values
				});
			}
		}

		updateTokenCreationStage(t('token-creator.navigation.waiting-for-completion'));
		contractCall(
			context,
			props,
			defaultAccount,
			tokenCreatorContract,
			'createNewToken',
			tokenCreationArgs,
			'Create new token: ' + draft.basics.symbol.toUpperCase(),
			{
				transactionCompleted: receipt => {
					transactionCounter.current++;

					let newTokenAddress = receipt.events.NewFin4TokenAddress.returnValues.tokenAddress;
					postCreationStepsArgs[0] = newTokenAddress;

					if (
						verifiersToParameterize.length === 0 &&
						sourcerersToParameterize.length === 0 &&
						newExternalUnderlyings.names.length === 0 &&
						sourcererSettingValues.length === 0
					) {
						tokenParameterization(defaultAccount, tokenCreatorContract, postCreationStepsArgs);
						return;
					}

					// verifiers and underlyings done
					let callbackOthersDone = () => {
						tokenParameterization(defaultAccount, tokenCreatorContract, postCreationStepsArgs);
					};

					if (sourcererSettingValues.length > 0) {
						setParamsOnOtherContract(
							'sourcerer',
							defaultAccount,
							'Fin4Underlyings',
							newTokenAddress,
							sourcererSettingValues,
							callbackOthersDone
						);
					}

					updateTokenCreationStage(t('token-creator.navigation.waiting-for-other-contracts'));

					verifiersToParameterize.map(verifier => {
						setParamsOnOtherContract(
							'verifier',
							defaultAccount,
							verifier.name,
							newTokenAddress,
							verifier.values,
							callbackOthersDone
						);
					});

					sourcerersToParameterize.map(sourcerer => {
						setParamsOnOtherContract(
							'sourcerer',
							defaultAccount,
							sourcerer.name,
							newTokenAddress,
							sourcerer.values,
							callbackOthersDone
						);
					});

					if (newExternalUnderlyings.names.length > 0) {
						addNewExternalUnderlyingsOnContract(defaultAccount, newExternalUnderlyings, callbackOthersDone);
					}
				},
				transactionFailed: reason => {
					setTokenCreationStage(t('token-creator.navigation.transaction-failed') + ': ' + reason);
				},
				dryRunFailed: reason => {
					setTokenCreationStage(t('token-creator.navigation.dry-run-failed') + ': ' + reason);
				}
			}
		);
	};

	const updateTokenCreationStage = text => {
		if (transactionCounter.current == transactionsRequired.current) {
			setTokenCreationStage('completed');
		} else {
			setTokenCreationStage(
				<span>
					{text}
					<br />
					Step: {transactionCounter.current + 1} / {transactionsRequired.current}
				</span>
			);
		}
	};

	const transactionCounter = useRef(0);
	const transactionsRequired = useRef(2);
	const [tokenCreationStage, setTokenCreationStage] = useState('unstarted');

	const setParamsOnOtherContract = (type, defaultAccount, contractName, tokenAddr, values, callbackOthersDone) => {
		// hackish, find a better way to handle this conversion? Get "[]" from encoded params again maybe? TODO
		if (
			type === 'verifier' &&
			(contractName === 'AllowOnlyThese' ||
				contractName === 'BlockThese' ||
				contractName === 'ApprovalByUsersOrGroups' ||
				contractName === 'PictureGivenApprovers')
		) {
			let userList = values[0] ? values[0].split(',').map(str => str.trim()) : [];
			let groupsList = values[1] ? values[1].split(',').map(Number) : [];
			values = [userList, groupsList];
			// TODO post-merge is this necessary? https://github.com/johnrachwan123/FIN4Xplorer/blob/65f00f14f14c245a15933f6069aefcd887691a78/src/views/tokens/TokenCreationProcess.jsx#L271
		}
		contractCall(
			context,
			props,
			defaultAccount,
			contractName,
			'setParameters',
			[tokenAddr, ...values],
			'Set parameter on ' + type + ': ' + contractName,
			{
				transactionCompleted: () => {
					transactionCounter.current++;
					updateTokenCreationStage(t('token-creator.navigation.waiting-for-other-contracts'));

					if (transactionCounter.current == transactionsRequired.current - 1) {
						callbackOthersDone();
					}
				},
				transactionFailed: reason => {
					setTokenCreationStage(t('token-creator.navigation.transaction-failed') + ': ' + reason);
				},
				dryRunFailed: reason => {
					setTokenCreationStage(t('token-creator.navigation.dry-run-failed') + ': ' + reason);
				}
			}
		);
	};

	const addNewExternalUnderlyingsOnContract = (defaultAccount, valueArrays, callbackOthersDone) => {
		contractCall(
			context,
			props,
			defaultAccount,
			'Fin4Underlyings',
			'addUnderlyings',
			[valueArrays.names, valueArrays.contractAddresses, valueArrays.attachments, valueArrays.usableForAlls],
			'Adding new external underlying sources of value',
			{
				transactionCompleted: () => {
					transactionCounter.current++;
					updateTokenCreationStage(t('token-creator.navigation.waiting-for-other-contracts'));

					if (transactionCounter.current == transactionsRequired.current - 1) {
						callbackOthersDone();
					}
				},
				transactionFailed: reason => {
					setTokenCreationStage(t('token-creator.navigation.transaction-failed') + ': ' + reason);
				},
				dryRunFailed: reason => {
					setTokenCreationStage(t('token-creator.navigation.dry-run-failed') + ': ' + reason);
				}
			}
		);
	};

	const tokenParameterization = (defaultAccount, tokenCreatorContract, postCreationStepsArgs) => {
		updateTokenCreationStage(t('token-creator.navigation.waiting-for-new-token'));

		contractCall(
			context,
			props,
			defaultAccount,
			tokenCreatorContract,
			'postCreationSteps',
			postCreationStepsArgs,
			'Set parameters on new token',
			{
				transactionCompleted: () => {
					transactionCounter.current++;
					updateTokenCreationStage('');
				},
				transactionFailed: reason => {
					setTokenCreationStage(t('token-creator.navigation.transaction-failed') + ': ' + reason);
				},
				dryRunFailed: reason => {
					setTokenCreationStage(t('token-creator.navigation.dry-run-failed') + ': ' + reason);
				}
			}
		);
	};

	const [keepAsDraft, setKeepAsDraft] = useState(false);

	return (
		<>
			{draftId ? (
				<Container>
					<Box title={t('token-creator.box-title')}>
						<div className={classes.root}>
							<Stepper activeStep={activeStep} alternativeLabel>
								{getSteps().map((label, index) => (
									<Step key={label + '_' + index}>
										<StepLabel
											onClick={() => {
												modifyURL(draftId, index + 1);
												setActiveStep(index);
											}}>
											{label}
										</StepLabel>
									</Step>
								))}
							</Stepper>
							<center>
								<Typography className={classes.instructions}>
									<b>{getStepContent(activeStep)}</b>
								</Typography>
								{activeStep < getSteps().length && (
									<FontAwesomeIcon
										icon={faInfoCircle}
										style={styles.infoIcon}
										onClick={() => setShowInfoBox(!showInfoBox)}
									/>
								)}
							</center>
						</div>
						<div style={{ padding: '10px 20px 30px 20px' }}>
							{/* Or create back/next buttons here and pass them down? */}
							{activeStep === 0 && buildStepComponent(StepIdentity)}
							{activeStep === 1 && buildStepComponent(StepDesign)}
							{activeStep === 2 && buildStepComponent(StepActions)}
							{activeStep === 3 && buildStepComponent(StepMinting)}
							{activeStep === 4 && buildStepComponent(StepSearchVerifier)}
							{UnderlyingsActive && (
								<>
									{activeStep === 5 && buildStepComponent(StepSourcerers)}
									{activeStep === 6 && buildStepComponent(StepExternalUnderlyings)}
								</>
							)}
							{activeStep === getSteps().length && tokenCreationStage === 'unstarted' && (
								<center>
									<Typography className={classes.instructions}>
										{t('token-creator.navigation.all-steps-completed')}
									</Typography>
									{/*countProofsWithParams() > 0 && (
										<small style={{ color: 'gray', fontFamily: 'arial' }}>
											You added {countProofsWithParams()} proofs with parameters. Each requires a separate transaction.
											Plus one for the creation of the token. You will have to confirm all consecutive transactions to
											complete the token creation. The first transaction has to complete before continuing - all
											following ones can be confirmed without waiting for their completion. Your token will be in a
											disabled state until all parameterization transactions are completed.
										</small>
									)*/}
									<FormControlLabel
										control={
											<Checkbox size="small" checked={keepAsDraft} onChange={() => setKeepAsDraft(!keepAsDraft)} />
										}
										label={<small style={{ color: 'gray' }}>{t('token-creator.navigation.keep-as-draft')}</small>}
									/>
									<div style={{ paddingTop: '20px' }}>
										<Button onClick={handleReset} className={classes.backButton}>
											{t('token-creator.navigation.restart-button')}
										</Button>
										<Button variant="contained" color="primary" onClick={createToken}>
											{t('token-creator.navigation.create-token-button')}
										</Button>
									</div>
								</center>
							)}
							{activeStep === getSteps().length &&
								tokenCreationStage !== 'unstarted' &&
								tokenCreationStage !== 'completed' &&
								!tokenCreationStage.toString().includes('failed') && (
									<center>
										<CircularProgress />
										<br />
										<br />
										<span style={{ fontFamily: 'arial', color: 'gray', width: '200px', display: 'inline-block' }}>
											{tokenCreationStage}
										</span>
									</center>
								)}
							{activeStep === getSteps().length && tokenCreationStage === 'completed' && (
								<center>
									<Typography className={classes.instructions}>Token successfully created!</Typography>
									<br />
									<IconButton
										style={{ color: 'green', transform: 'scale(2.4)' }}
										onClick={() => history.push('/tokens')}>
										<CheckIcon />
									</IconButton>
								</center>
							)}
							{activeStep === getSteps().length && tokenCreationStage.toString().includes('failed') && (
								<center>
									<Typography className={classes.instructions}>{tokenCreationStage}</Typography>
									<br />
									<IconButton style={{ color: 'red', transform: 'scale(2.4)' }} onClick={() => history.push('/tokens')}>
										<CancelIcon />
									</IconButton>
								</center>
							)}
						</div>
					</Box>
					{showInfoBox && (
						<Box>
							<div style={{ fontFamily: 'arial' }}>
								<center>
									<small style={{ color: 'gray' }} onClick={() => setShowInfoBox(false)}>
										{t('token-creator.navigation.info-box-close-button')}
									</small>
								</center>
								<br />
								{getStepInfoBoxContent(activeStep, props.verifierTypes)}
							</div>
						</Box>
					)}
				</Container>
			) : (
				<center style={{ fontFamily: 'arial' }}>
					{t('token-creator.navigation.no-token-creation-draft-found', { Id: props.match.params.draftId })}
				</center>
			)}
		</>
	);
}

const styles = {
	infoIcon: {
		color: Fin4Colors.blue,
		width: '20px',
		height: '20px'
	}
};

TokenCreationProcess.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		tokenCreationDrafts: state.fin4Store.tokenCreationDrafts,
		verifierTypes: state.fin4Store.verifierTypes,
		fin4Tokens: state.fin4Store.fin4Tokens,
		defaultAccount: state.fin4Store.defaultAccount,
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(TokenCreationProcess, mapStateToProps);
