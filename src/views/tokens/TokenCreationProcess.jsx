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
import StepNoninteractiveVerifier from './creationProcess/Step5NoninteractiveVerifier';
import StepInteractiveVerifier from './creationProcess/Step6InteractiveVerifier';
import StepSourcerers from './creationProcess/Step7Sourcerers';
import StepExternalUnderlyings from './creationProcess/Step8ExternalUnderlyings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { findVerifierTypeAddressByName, BNstr, stringToBytes32, UnderlyingsActive } from '../../components/utils';
import { findTokenBySymbol, contractCall, zeroAddress } from '../../components/Contractor';
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

	// TEXT CONTENT START

	const getSteps = () => {
		// ['Identity', 'Design', 'Actions', 'Minting', 'Verifying1', 'Verifying2', 'Sourcerers', 'ExternalUnderlyings']; // Disbursement/Valuation instead of Value?
		const steps = [];
		const numbOfSteps = UnderlyingsActive ? 8 : 6;
		for (let i = 0; i < numbOfSteps; i++) {
			steps.push('');
		}
		return steps;
	};

	const getStepContent = stepIndex => {
		switch (stepIndex) {
			case 0:
				return 'Token identity'; // Formerly: Basic infos
			case 1:
				return 'Token design'; // Formerly: Fundamental properties
			case 2:
				return 'Action policy'; // Formerly: For what action(s) can people claim this token?
			case 3:
				return 'Minting policy'; // Formerly: What quantity can be obtained per claim?
			case 4:
				return 'Noninteractive Verifiers'; // Formerly: Add proof types that users will have to provide
			case 5:
				return 'Interactive Verifiers';
			case 6:
				return UnderlyingsActive ? 'Sourcerers' : '';
			case 7:
				return 'External Source of Value';
			default:
				return '';
		}
	};

	const getStepInfoBoxContent = (stepIndex, verifierTypes) => {
		switch (stepIndex) {
			case 0: // Basics
				return (
					<>
						<b>Name</b>
						<br />
						Give the new token, you want to create, a descriptive/telling name.
						<br />
						<br />
						<b>Symbol</b>
						<br />
						Choose a short symbol of 3-5 letters (numbers are allowd, too) for your new token. Please note, that the
						system rejects symbols that are already in use.
						<br />
						<br />
						<b>Short and long description</b>
						<br />
						Describe the purpose/idea of your new token in two understandable versions.
					</>
				);
			case 1: // Traits (= Properties)
				return (
					<>
						<b>Token supply is capped</b>
						<br />
						Once the cap is reached, nobody (incl. the token creator) can mint this token anymore.
						<br />
						<br />
						<b>Cap</b>
						<br />
						If the token is capped, this is the value of the cap.
						<br />
						<br />
						<b>Initial token supply</b>
						<br />
						As the token creator, you can give yourself an initial amount of your new token. The total supply (above)
						will adjust to this amount. <br />
						<br />
						<b>Token is transferable</b>
						<br />
						Users who have a balance on this token, can transfer some or all of it to other users. In most cases users
						want to be able to transfer positive action tokens (e.g. for trading).
						<br />
						<br />
						<b>Token is burnable</b>
						<br />
						Users can burn some or all of their balance on this token. The burned amount gets deducted from their
						balance and the total supply of the token shrinks by that amount.
						<br />
						<br />
						<b>Decimals</b>
						<br />
						The digits by which your token is divisible. Zero means that users can only have natural numbers
						(0,1,2,3,4..) as balance on your token and only amounts in natural numbers can be transferred. Other number
						indicate the decimal places, e.g., "3" means the token is divisible with 0.001 being the smallest unit.
					</>
				);
			case 2: // Actions
				return (
					<>
						<b>Positive actions</b>
						<br />
						For what positive actions should users be able to obtain your new token? Take your time to think about this
						question. It very important for the future success for your token idea in the system. Also, it is important
						that users are able to prove they did the actions using the different proving methods (c.f. last section).
					</>
				);
			case 3: // Minting Policy
				return <center>TODO</center>;
			/*(
					<>
						<b>Token is mintable</b>
						<br />
						Eligible users or smart contracts can "mint" any amount to a public address of their choosing. The total
						supply of this token gets increased by that amount.
	
						<b>Fixed amount</b>
						<br />
						Once the claim is successful, this fixed amount of tokens will be minted to the user. Default is 1 token per
						action.
						<br />
						<br />
						<b>Fixed factor</b>
						<br />
						The user can put a quantity as part of their claim (e.g., "I claim 3 tokens for that action"). Once the claim
						is successful, the amount minted to the user is that quantity multiplied with the fixed factor you set here.
						Default is a fixed factor of 1.
					</>
				);*/
			case 4: // Noninteractive verifiers
				return (
					<>
						<b>Verifying actions</b>
						<br />
						To obtain tokens, users need to prove to the system that they actually performed the action required. You
						can choose any combination of verifiers from the list. Please take your time to think precisely about any
						combination you choose. Good verifiers are suitable to the the nature of the token, suitable and practical
						for the users trying to obtain them, and practical for the token creators. The harder the proving is, the
						less users will try to obtain your token; the easier the proving is, the less perceived quality users will
						see in the token. In complex cases, you may want to experiment with different token designs at the same
						time. Finally, proving actions is a complex matter and we constantly work to improve the verifiying
						mechanisms.
						<br />
						<br />
						{Object.keys(verifierTypes).map((verifierAddr, idx) => {
							let verifier = verifierTypes[verifierAddr];
							if (!verifier.isNoninteractive) {
								return '';
							}
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
						{/*
						<b>Proof type: picture</b>
						<br />
						The claimer submits a picture, based on which the approver will decide on the claim.
						<br />
						<br />
						<b>Proof type: location</b>
						<br />
						The claimer has to be located within a radius of a location you as token creator define.
						<br />
						<br />
						<b>Proof type: selfie-together</b>
						<br />
						The claimer submits a picture, based on which another approver and a member of a group of users appointed by
						the token creator decide to approve. Put simpler: If the token requires another person to be involved (e.g.
						for a service), they need to approve, too.
						<br />
						<br />
						<b>Proof type: specific address</b>
						<br />
						The claimer has to specify an address, which has to approve.
						<br />
						<br />
						<b>Proof type: token creator</b>
						<br />
						The token creator has to approve. (Short cut for specific address = token creator address.)
						<br />
						<br />
						<b>Proof type: password</b>
						<br />
						The claimer has to provide a numeric password (PIN) you as token creator define. Handle with care!
						<br />
						<br />
						<b>Proof type: self</b>
						<br />
						The claimer can approve their own claims. Handle with care!
						<br />
						<br />
						<b>Proof type: minimum interval</b>
						<br />
						Defines a minimum time that has to pass between claims by same user. Handle with care!
						<br />
						<br />
						<b>Proof type: maximum quantity per interval</b>
						<br />
						Defines the maximum quantity a user can claim within a specified time interval. Handle with care!
						<br />
						<br />
						<b>Proof type: group member approval</b>
						<br />
						The token creator specifies one or more user groups, of which one member has to approve. Handle with care!
						*/}
					</>
				);
			case 5: // Interactive verifiers
				return (
					<>
						{Object.keys(verifierTypes).map((verifierAddr, idx) => {
							let verifier = verifierTypes[verifierAddr];
							if (verifier.isNoninteractive) {
								return '';
							}
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
			case 6: // Sourcerers
				return <center>TODO</center>;
			case 7: // External source of value
				return <center>TODO</center>;
			default:
				return <center>TODO</center>;
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

		if (draft.basics.name.trim().length === 0) {
			// check for letters only too?
			return "Name can't be empty";
		}

		if (draft.basics.symbol.length < 3 || draft.basics.symbol.length > 5) {
			return 'Symbol must have between 3 and 5 characters';
		}

		// do a call to check on the contract here instead?
		if (findTokenBySymbol(props, draft.basics.symbol) !== null) {
			return 'Symbol is already in use';
		}

		if (draft.interactiveVerifiers.Location) {
			let latLonStr = draft.interactiveVerifiers.Location.parameters['latitude / longitude'];
			if (latLonStr.split('/').length !== 2) {
				// also check for other possibly wrong cases?
				return "The 'latitude / longitude' field of the location verifier must use '/' as separator";
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
			draft.properties.initialSupplyUserIsOwner ? defaultAccount : draft.properties.initialSupplyOtherOwner
		];

		let minterRoles = [];
		if (draft.minting.additionalMinterRoles.length > 0) {
			minterRoles = draft.minting.additionalMinterRoles.split(',').map(addr => addr.trim());
		}
		if (draft.minting.Fin4ClaimingHasMinterRole) {
			minterRoles.push(context.drizzle.contracts.Fin4Claiming.address);
		}

		let verifiers = {
			...draft.noninteractiveVerifiers,
			...draft.interactiveVerifiers
		};

		// SOURCERERS

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
			Object.keys(verifiers).map(name => findVerifierTypeAddressByName(props.verifierTypes, name)),
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

					if (
						verifiersToParameterize.length === 0 &&
						sourcerersToParameterize.length === 0 &&
						newExternalUnderlyings.names.length === 0
					) {
						tokenParameterization(defaultAccount, tokenCreatorContract, postCreationStepsArgs);
						return;
					}

					// verifiers and underlyings done
					let callbackOthersDone = () => {
						tokenParameterization(defaultAccount, tokenCreatorContract, postCreationStepsArgs);
					};

					updateTokenCreationStage('Waiting for other contracts to receive parameters.');
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

	const setParamsOnOtherContract = (type, defaultAccount, contractName, tokenAddr, values, callbackOthersDone) => {
		// hackish, find a better way to handle this conversion? TODO
		if (type === 'verifier' && (contractName === 'Whitelisting' || contractName === 'Blacklisting')) {
			let userList = values[0];
			let groupsList = values[1];
			values = [userList.split(',').map(str => str.trim()), groupsList.split(',').map(Number)];
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
					updateTokenCreationStage('Waiting for other contracts to receive parameters.');

					if (transactionCounter.current == transactionsRequired.current - 1) {
						callbackOthersDone();
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
					updateTokenCreationStage('Waiting for other contracts to receive parameters.');

					if (transactionCounter.current == transactionsRequired.current - 1) {
						callbackOthersDone();
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
					updateTokenCreationStage('');
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
								{getSteps().map((label, index) => (
									<Step key={label}>
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
							{activeStep === 4 && buildStepComponent(StepNoninteractiveVerifier)}
							{activeStep === 5 && buildStepComponent(StepInteractiveVerifier)}
							{UnderlyingsActive && (
								<>
									{activeStep === 6 && buildStepComponent(StepSourcerers)}
									{activeStep === 7 && buildStepComponent(StepExternalUnderlyings)}
								</>
							)}
							{activeStep === getSteps().length && tokenCreationStage === 'unstarted' && (
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
						<Box title={getSteps()[activeStep] + ' info'}>
							<div style={{ fontFamily: 'arial' }}>
								<center>
									<small style={{ color: 'gray' }} onClick={() => setShowInfoBox(false)}>
										CLOSE
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
		verifierTypes: state.fin4Store.verifierTypes,
		fin4Tokens: state.fin4Store.fin4Tokens,
		defaultAccount: state.fin4Store.defaultAccount,
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(TokenCreationProcess, mapStateToProps);
