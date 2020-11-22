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
import StepActions from './creationProcess/Step2Actions';
import StepToken from './creationProcess/Step3Tokens';
import StepDesign from './creationProcess/Step4Design';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Fin4Colors } from '../../components/utils';
import { contractCall, zeroAddress } from '../../components/Contractor';
import CheckIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { IconButton } from '@material-ui/core';
import history from '../../components/history';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(theme => ({
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

function CampaignCreationProcess(props, context) {
	const { t } = useTranslation();
	const classes = useStyles();

	const getSteps = () => {
		// ['Identity', 'Actions', 'Token(s)', 'Token features']
		const steps = [];
		const numbOfSteps = 4;
		for (let i = 0; i < numbOfSteps; i++) {
			steps.push('');
		}
		return steps;
	};

	const getStepContent = stepIndex => {
		switch (stepIndex) {
			case 0:
				return t('campaign-creator.step1-identity.title');
			case 1:
				return t('campaign-creator.step2-actions.title');
			case 2:
				return t('campaign-creator.step3-tokens.title');
			case 3:
				return t('campaign-creator.step4-design.title');
			default:
				return '';
		}
	};

	const buildInfoContent = (stepName, fieldNames = []) => {
		let items = [];
		items.push(
			<div key={stepName + '_info'}>
				{t('campaign-creator.' + stepName + '.info')}
				<br />
				<br />
				<br />
			</div>
		);
		fieldNames.map((field, index) => {
			let translationKey = 'campaign-creator.' + stepName + '.fields.' + field;
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

	const getStepInfoBoxContent = stepIndex => {
		switch (stepIndex) {
			case 0:
				return buildInfoContent('step1-identity', ['name', 'start-date', 'end-date']);
			case 1:
				return buildInfoContent('step2-actions');
			case 2:
				return buildInfoContent('step3-tokens');
			case 3:
				return buildInfoContent('step4-design');
			default:
				return '';
		}
	};

	const [draftId, setDraftId] = useState(null);

	useEffect(() => {
		let draftIdViaURL = props.match.params.draftId;
		if (draftId || !draftIdViaURL || !props.campaignCreationDrafts[draftIdViaURL]) {
			return;
		}

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
		window.history.pushState('', '', '/campaign/create/' + _draftId + '/' + step);
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
			draft: props.campaignCreationDrafts[draftId],
			nav: [activeStep, getSteps().length, classes, handleBack],
			handleNext: handleNext
		});
	};

	const [showInfoBox, setShowInfoBox] = useState(false);

	const validateDraft = draft => {
		if (!draft.basics.name || draft.basics.name.trim().length === 0) {
			return t('token-creator.validation.name-empty');
		}

		if (draft.interactiveVerifiers.Location) {
			let latLonStr = draft.interactiveVerifiers.Location.parameters['latitude / longitude'];
			if (latLonStr.split('/').length !== 2) {
				return "The 'latitude / longitude' field of the location verifier must use '/' as separator";
			}
		}
		return '';
	};

	const createCampaign = () => {
		let draft = props.campaignCreationDrafts[draftId];

		let validationResult = validateDraft(draft);
		if (validationResult) {
			alert(validationResult);
			return;
		}

		if (!keepAsDraft) {
			props.dispatch({
				type: 'DELETE_CAMPAIGN_CREATION_DRAFT',
				draftId: draftId
			});
		}

		let defaultAccount = props.store.getState().fin4Store.defaultAccount;

		let campaignCreationArgs = [
			draft.basics.name,
			defaultAccount,
			draft.actions.text,
			draft.basics.campaignStartTime,
			draft.basics.campaignEndTime,
			draft.tokens.allTokens,
			draft.design.successThreshold,
			draft.design.claimPerCampaignContributor
		];

		let sourcerersToParameterize = [];

		transactionsRequired.current += draft.sourcererPairs.length;

		for (let i = 0; i < draft.sourcererPairs.length; i++) {
			let pair = draft.sourcererPairs[i];
			let underlyingsObj = props.allUnderlyings[pair.sourcererName];
			let values = underlyingsObj.paramsEncoded.split(',').map(paramStr => {
				let pName = paramStr.split(':')[1];
				let val = pair.parameters[pName];
				if (pName === 'beneficiary' && !val) {
					return zeroAddress;
				}
				return val;
			});
			if (pair.sourcererName === 'BurnSourcerer') {
				values.splice(1, 0, zeroAddress);
			}
			sourcerersToParameterize.push({
				name: pair.sourcererName,
				values: values
			});
		}

		let campaignCreatorContract = 'CampaignCreator';

		updateTokenCreationStage(t('campaign-creator.navigation.waiting-for-completion'));
		contractCall(
			context,
			props,
			defaultAccount,
			campaignCreatorContract,
			'createNewCampaign',
			campaignCreationArgs,
			'Create new campaign: ',
			{
				transactionCompleted: receipt => {
					transactionCounter.current++;

					updateTokenCreationStage(t('completed'));
				},
				transactionFailed: reason => {
					setCampaignCreationStage(t('token-creator.navigation.transaction-failed') + ': ' + reason);
				},
				dryRunFailed: reason => {
					setCampaignCreationStage(t('token-creator.navigation.dry-run-failed') + ': ' + reason);
				}
			}
		);
	};

	const updateTokenCreationStage = text => {
		if (transactionCounter.current == transactionsRequired.current) {
			setCampaignCreationStage('completed');
		} else {
			setCampaignCreationStage(
				<span>
					{text}
					<br />
					Step: {transactionCounter.current + 1} / {transactionsRequired.current}
				</span>
			);
		}
	};

	const transactionCounter = useRef(0);
	const transactionsRequired = useRef(1);
	const [campaignCreationStage, setCampaignCreationStage] = useState('unstarted');

	const [keepAsDraft, setKeepAsDraft] = useState(false);

	return (
		<>
			{draftId ? (
				<Container>
					<Box title={t('campaign-creator.box-title')}>
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
							{activeStep === 0 && buildStepComponent(StepIdentity)}
							{activeStep === 1 && buildStepComponent(StepActions)}
							{activeStep === 2 && buildStepComponent(StepToken)}
							{activeStep === 3 && buildStepComponent(StepDesign)}
							{activeStep === getSteps().length && campaignCreationStage === 'unstarted' && (
								<center>
									<Typography className={classes.instructions}>
										{t('token-creator.navigation.all-steps-completed')}
									</Typography>
									<div style={{ paddingTop: '20px' }}>
										<Button onClick={handleReset} className={classes.backButton}>
											{t('campaign-creator.navigation.restart-button')}
										</Button>
										<Button variant="contained" color="primary" onClick={createCampaign}>
											{t('campaign-creator.navigation.launch-campaign-button')}
										</Button>
									</div>
								</center>
							)}
							{activeStep === getSteps().length &&
								campaignCreationStage !== 'unstarted' &&
								campaignCreationStage !== 'completed' &&
								!campaignCreationStage.toString().includes('failed') && (
									<center>
										<CircularProgress />
										<br />
										<br />
										<span style={{ fontFamily: 'arial', color: 'gray', width: '200px', display: 'inline-block' }}>
											{campaignCreationStage}
										</span>
									</center>
								)}
							{activeStep === getSteps().length && campaignCreationStage === 'completed' && (
								<center>
									<Typography className={classes.instructions}>
										{t('campaign-creator.navigation.campaign-created')}
									</Typography>
									<br />
									<IconButton
										style={{ color: 'green', transform: 'scale(2.4)' }}
										onClick={() => history.push('/campaigns')}>
										<CheckIcon />
									</IconButton>
								</center>
							)}
							{activeStep === getSteps().length && campaignCreationStage.toString().includes('failed') && (
								<center>
									<Typography className={classes.instructions}>{campaignCreationStage}</Typography>
									<br />
									<IconButton
										style={{ color: 'red', transform: 'scale(2.4)' }}
										onClick={() => history.push('/campaigns')}>
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
										{t('campaign-creator.navigation.info-box-close-button')}
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
					{t('campaign-creator.navigation.no-campaign-creation-draft-found', { Id: props.match.params.draftId })}
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

CampaignCreationProcess.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		campaignCreationDrafts: state.fin4Store.campaignCreationDrafts,
		verifierTypes: state.fin4Store.verifierTypes,
		fin4Tokens: state.fin4Store.fin4Tokens,
		fin4Campaigns: state.fin4Store.fin4Campaigns,
		defaultAccount: state.fin4Store.defaultAccount,
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(CampaignCreationProcess, mapStateToProps);
