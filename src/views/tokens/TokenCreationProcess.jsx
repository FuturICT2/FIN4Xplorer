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
import StepProving from './creationProcess/Step5Proving';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { steps, getStepContent, getStepInfoBoxContent } from './creationProcess/TextContents';
import { findProofTypeAddressByName, BNstr } from '../../components/utils';
import { findTokenBySymbol, contractCall } from '../../components/Contractor';
import CheckIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { IconButton } from '@material-ui/core';
import history from '../../components/history';
import CircularProgress from '@material-ui/core/CircularProgress';

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

	const [draftId, setDraftId] = useState(null);

	useEffect(() => {
		let draftIdViaURL = props.match.params.draftId;
		if (draftId || !draftIdViaURL || !props.tokenCreationDrafts[draftIdViaURL]) {
			return;
		}
		setDraftId(draftIdViaURL);
	});

	const [activeStep, setActiveStep] = useState(0);

	const handleNext = () => {
		setActiveStep(prevActiveStep => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep(prevActiveStep => prevActiveStep - 1);
	};

	const handleReset = () => {
		setActiveStep(0);
	};

	const buildStepComponent = component => {
		return React.createElement(component, {
			draft: props.tokenCreationDrafts[draftId],
			nav: [activeStep, steps.length, classes, handleBack],
			handleNext: handleNext
		});
	};

	const [showInfoBox, setShowInfoBox] = useState(false);

	const validateDraft = draft => {
		// TODO do a proper validation with warning-signs in the respective steps

		if (draft.basics.name.trim().length === 0) {
			// check for letters only too?
			return "Name can't be empty";
		}

		if (draft.basics.symbol.length < 3 || draft.basics.symbol.length > 5) {
			return 'Symbol must have between 3 and 5 characters';
		}

		if (findTokenBySymbol(props, draft.basics.symbol) !== null) {
			return 'Symbol is already in use';
		}

		if (draft.proofs.Location) {
			let latLonStr = draft.proofs.Location.parameters['latitude / longitude'];
			if (latLonStr.split('/').length !== 2) {
				// also check for other possibly wrong cases?
				return "The 'latitude / longitude' field of the location proof must use '/' as separator";
			}
		}

		return '';
	};

	const createToken = () => {
		let draft = props.tokenCreationDrafts[draftId];

		let validationResult = validateDraft(draft);
		if (validationResult) {
			alert(validationResult);
			return;
		}

		let tokenCreationArgs = [
			draft.basics.name,
			draft.basics.symbol,
			[draft.properties.isBurnable, draft.properties.isTransferable, draft.properties.isMintable],
			[
				draft.properties.decimals, // TODO restrict to max 18. Default 18 too? #ConceptualDecision
				BNstr(draft.properties.initialSupply),
				BNstr(draft.properties.cap)
			]
		];

		let postCreationStepsArgs = [
			null, // token address
			Object.keys(draft.proofs).map(name => findProofTypeAddressByName(props.proofTypes, name)),
			draft.basics.description,
			draft.actions.text,
			draft.value.fixedAmount,
			draft.value.unit
		];

		let tokenCreatorContract = draft.properties.isCapped ? 'Fin4CappedTokenCreator' : 'Fin4UncappedTokenCreator';
		let defaultAccount = props.store.getState().fin4Store.defaultAccount;

		// proof types with parameters
		let proofsToParameterize = [];
		for (var name in draft.proofs) {
			if (draft.proofs.hasOwnProperty(name)) {
				let proof = draft.proofs[name];
				let parameterNames = Object.keys(proof.parameters);
				if (parameterNames.length === 0) {
					continue;
				}
				transactionsRequired.current++;
				let values = parameterNames.map(pName => proof.parameters[pName]);
				proofsToParameterize.push({
					name: name,
					values: values
				});
			}
		}

		updateTokenCreationStage('Waiting for the token creation to complete.');
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

					if (proofsToParameterize.length === 0) {
						tokenParameterization(defaultAccount, tokenCreatorContract, postCreationStepsArgs);
						return;
					}

					updateTokenCreationStage('Waiting for proof contracts to receive parameters.');
					proofsToParameterize.map(proof => {
						setParamsOnProofContract(
							defaultAccount,
							proof.name,
							newTokenAddress,
							proof.values,
							tokenCreatorContract,
							postCreationStepsArgs
						);
					});
				},
				transactionFailed: reason => {
					setTokenCreationStage('Token creation failed with reason: ' + reason);
				},
				dryRunFailed: reason => {
					setTokenCreationStage('Token creation failed with reason: ' + reason);
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

	const setParamsOnProofContract = (
		defaultAccount,
		contractName,
		tokenAddr,
		values,
		tokenCreatorContract,
		postCreationStepsArgs
	) => {
		contractCall(
			context,
			props,
			defaultAccount,
			contractName,
			'setParameters',
			[tokenAddr, ...values],
			'Set parameter on proof type: ' + contractName,
			{
				transactionCompleted: () => {
					transactionCounter.current++;
					updateTokenCreationStage('Waiting for proof contracts to receive parameters.');

					if (transactionCounter.current == transactionsRequired.current - 1) {
						tokenParameterization(defaultAccount, tokenCreatorContract, postCreationStepsArgs);
					}
				},
				transactionFailed: reason => {
					setTokenCreationStage('Token creation failed with reason: ' + reason);
				},
				dryRunFailed: reason => {
					setTokenCreationStage('Token creation failed with reason: ' + reason);
				}
			}
		);
	};

	const tokenParameterization = (defaultAccount, tokenCreatorContract, postCreationStepsArgs) => {
		updateTokenCreationStage('Waiting for the new token to receive further parameters.');

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
					updateTokenCreationStage('Waiting for proof contracts to receive parameters.');
				},
				transactionFailed: reason => {
					setTokenCreationStage('Token creation failed with reason: ' + reason);
				},
				dryRunFailed: reason => {
					setTokenCreationStage('Token creation failed with reason: ' + reason);
				}
			}
		);
	};

	return (
		<>
			{draftId ? (
				<Container>
					<Box title="Token creation">
						<div className={classes.root}>
							<Stepper activeStep={activeStep} alternativeLabel>
								{steps.map(label => (
									<Step key={label}>
										<StepLabel>{label}</StepLabel>
									</Step>
								))}
							</Stepper>
							<center>
								<Typography className={classes.instructions}>
									<b>{getStepContent(activeStep)}</b>
								</Typography>
								{activeStep < steps.length && (
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
							{activeStep === 4 && buildStepComponent(StepProving)}
							{activeStep === steps.length && tokenCreationStage === 'unstarted' && (
								<center>
									<Typography className={classes.instructions}>All steps completed</Typography>
									{/*countProofsWithParams() > 0 && (
										<small style={{ color: 'gray', fontFamily: 'arial' }}>
											You added {countProofsWithParams()} proofs with parameters. Each requires a separate transaction.
											Plus one for the creation of the token. You will have to confirm all consecutive transactions to
											complete the token creation. The first transaction has to complete before continuing - all
											following ones can be confirmed without waiting for their completion. Your token will be in a
											disabled state until all parameterization transactions are completed.
										</small>
									)*/}
									<div style={{ paddingTop: '20px' }}>
										<Button onClick={handleReset} className={classes.backButton}>
											Restart
										</Button>
										<Button variant="contained" color="primary" onClick={createToken}>
											Create token
										</Button>
									</div>
								</center>
							)}
							{activeStep === steps.length &&
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
							{activeStep === steps.length && tokenCreationStage === 'completed' && (
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
							{activeStep === steps.length && tokenCreationStage.toString().includes('failed') && (
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
						<Box title={steps[activeStep] + ' info'}>
							<div style={{ fontFamily: 'arial' }}>
								<center>
									<small style={{ color: 'gray' }} onClick={() => setShowInfoBox(false)}>
										CLOSE
									</small>
								</center>
								<br />
								{getStepInfoBoxContent(activeStep, props.proofTypes)}
							</div>
						</Box>
					)}
				</Container>
			) : (
				<center style={{ fontFamily: 'arial' }}>
					No token creation draft found with ID {props.match.params.draftId}
				</center>
			)}
		</>
	);
}

const styles = {
	infoIcon: {
		color: 'silver',
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
		proofTypes: state.fin4Store.proofTypes,
		fin4Tokens: state.fin4Store.fin4Tokens,
		defaultAccount: state.fin4Store.defaultAccount
	};
};

export default drizzleConnect(TokenCreationProcess, mapStateToProps);
