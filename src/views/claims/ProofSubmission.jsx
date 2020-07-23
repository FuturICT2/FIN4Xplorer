import React, { useState, useEffect } from 'react';
import { Typography, Divider } from '@material-ui/core';
import styled from 'styled-components';
import colors from '../../config/colors-config';
import { drizzleConnect } from 'drizzle-react';
import { findTokenBySymbol, getContractData } from '../../components/Contractor';
import Box from '../../components/Box';
import Container from '../../components/Container';
import PropTypes from 'prop-types';
import LocationProof from './proofs/LocationProof';
import Button from '../../components/Button';
import PictureUploadProof from './proofs/PictureUploadProof';
import FileUploadProof from './proofs/FileUploadProof';
import ContractFormSimple from '../../components/ContractFormSimple';
import {
	abiTypeToTextfieldType,
	capitalizeFirstLetter,
	ProofAndVerifierStatusEnum,
	translationMarkdown
} from '../../components/utils';
import VoteProof from './proofs/VoteProof';
import { useTranslation } from 'react-i18next';
import { contractCall, readOnlyCall } from '../../components/Contractor';

function ProofSubmission(props, context) {
	const { t } = useTranslation();

	const [pseudoClaimId, setPseudoClaimId] = useState(null);

	useEffect(() => {
		let symbol = props.match.params.tokenSymbol;
		if (
			!pseudoClaimId &&
			Object.keys(props.fin4Tokens).length > 0 &&
			Object.keys(props.verifierTypes).length > 0 &&
			symbol
		) {
			let token = findTokenBySymbol(props, symbol);
			if (!token) {
				return;
			}
			let claimId = props.match.params.claimId;
			let _pseudoClaimId = token.address + '_' + claimId;
			if (props.usersClaims[_pseudoClaimId]) {
				// acts as barrier to wait until usersClaims is available
				setPseudoClaimId(_pseudoClaimId);
				fetchMessagesFromVerifiers(_pseudoClaimId);
			}
		}
	});

	const fetchMessagesFromVerifiers = _pseudoClaimId => {
		let claim = props.usersClaims[_pseudoClaimId];
		let verifiersWithMessages = claim.verifiersWithMessages;
		if (verifiersWithMessages.length === 0) {
			return;
		}
		let Fin4ClaimingContract = context.drizzle.contracts.Fin4Claiming;
		let defaultAccount = props.store.getState().fin4Store.defaultAccount;
		verifiersWithMessages.map(verifierAddr => {
			getContractData(
				Fin4ClaimingContract,
				defaultAccount,
				'getVerifierMessageOnClaim',
				claim.token,
				claim.claimId,
				verifierAddr
			).then(message => {
				props.dispatch({
					type: 'SET_VERIFIER_MESSAGE',
					pseudoClaimId: _pseudoClaimId,
					verifierTypeAddress: verifierAddr,
					message: message
				});
			});
		});
	};

	const buildProofSubmissionForm = (verifierContractName, tokenAddrToReceiveVerifierNotice, claimId, index) => {
		switch (verifierContractName) {
			case 'Location':
				return <LocationProof key={'loc_' + index} tokenAddr={tokenAddrToReceiveVerifierNotice} claimId={claimId} />;
			/*case 'SelfieTogether':
				return (
					<PictureUploadProof
						key={'selfie_' + index}
						tokenAddr={tokenAddrToReceiveVerifierNotice}
						claimId={claimId}
						contractName={'SelfieTogether'}
					/>
				);*/
			case 'PictureSelfChosenApprover':
				return (
					<PictureUploadProof
						key={'pic_' + index}
						tokenAddr={tokenAddrToReceiveVerifierNotice}
						claimId={claimId}
						contractName="PictureSelfChosenApprover"
						showAddressField={true}
					/>
				);
			case 'PictureGivenApprovers':
				return (
					<PictureUploadProof
						key={'pic_' + index}
						tokenAddr={tokenAddrToReceiveVerifierNotice}
						claimId={claimId}
						contractName="PictureGivenApprovers"
						showAddressField={false}
					/>
				);
			case 'LimitedVoting':
				return (
					<FileUploadProof
						// key={'file_' + index}
						tokenAddr={tokenAddrToReceiveVerifierNotice}
						claimId={claimId}
						contractName={'LimitedVoting'}
					/>
				);
			case 'PictureVoting':
				return (
					<FileUploadProof
						// key={'file_' + index}
						tokenAddr={tokenAddrToReceiveVerifierNotice}
						claimId={claimId}
						contractName={'PictureVoting'}
						accept={'image/*'}
					/>
				);
			case 'VideoVoting':
				return (
					<FileUploadProof
						// key={'file_' + index}
						tokenAddr={tokenAddrToReceiveVerifierNotice}
						claimId={claimId}
						contractName={'VideoVoting'}
						accept={'video/*'}
					/>
				);
			/*case 'Networking':
				return <NetworkingProof key={'networking_' + index} tokenAddr={tokenAddrToReceiveVerifierNotice} claimId={claimId} />;
			case 'HappyMoment':
				return <HappyMomentProof key={'happy_' + index} tokenAddr={tokenAddrToReceiveVerifierNotice} claimId={claimId} />;*/
			case 'Vote':
				return <VoteProof key={'vote_' + index} tokenAddr={tokenAddrToReceiveVerifierNotice} claimId={claimId} />;
			default:
				const abi = require('../../build/contracts/Fin4Verifying').abi;
				let contractMethod = 'submitProof_' + verifierContractName;
				let inputs = abi.filter(el => el.name === contractMethod)[0].inputs;
				let fields = inputs.map(input => {
					return [capitalizeFirstLetter(input.name), abiTypeToTextfieldType(input.type, input.name)];
				});
				return (
					<ContractFormSimple
						contractName="Fin4Verifying"
						contractMethod={'submitProof_' + verifierContractName}
						pendingTxStr={'Submit proof ' + verifierContractName}
						fields={fields}
						fixValues={{
							TokenAddrToReceiveVerifierNotice: tokenAddrToReceiveVerifierNotice,
							ClaimId: claimId + '',
							VerifierName: verifierContractName
						}}
					/>
				);
		}
	};

	/*const transactionSentCallback = (_pseudoClaimId, _verifierTypeName) => {
		props.dispatch({
			type: 'SET_VERIFIER_STATUS',
			pseudoClaimId: _pseudoClaimId,
			verifierTypeAddress: findVerifierTypeAddressByName(props.verifierTypes, _verifierTypeName),
			status: ProofAndVerifierStatusEnum.PENDING
		});
	};*/

	const buildStatusElement = (status, text) => {
		return <Status status={status}>{text}</Status>;
	};

	function isEligibleEndVote(name, claimId) {
		let res = readOnlyCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			name,
			'endVotePossible',
			[claimId],
			'End Vote Possible',
			props.callbacks
		);
		Promise.all(res).then(result => {
			console.log(result[0]);
		});
	}

	const endVoting = () => {
		Object.keys(props.usersClaims[pseudoClaimId].verifierStatuses).map((verifierTypeAddr, index) => {
			let claimObj = props.usersClaims[pseudoClaimId];
			let generalVerifierObj = props.verifierTypes[verifierTypeAddr];
			switch (generalVerifierObj.label) {
				case 'PictureVoting':
				case 'VideoVoting':
				case 'LimitedVoting':
					// console.log("test");
					contractCall(
						context,
						props,
						props.store.getState().fin4Store.defaultAccount,
						'Fin4Verifying',
						'endVote',
						[generalVerifierObj.label, claimObj.claimId],
						'End Vote',
						props.callbacks
					);
				default:
			}
		});
	};

	const buildVerifierAppearance = (index, claimObj, generalVerifierObj) => {
		// console.log(isEligibleEndVote(generalVerifierObj.label, claimObj.claimId));
		let statusObj = claimObj.verifierStatuses[generalVerifierObj.value];
		let status = statusObj.status;
		let message = statusObj.message;
		switch (status) {
			case ProofAndVerifierStatusEnum.UNSUBMITTED:
				return (
					<>
						{buildStatusElement(
							status,
							t('proof-submission.verifier.unsubmitted', { description: generalVerifierObj.description })
						)}
						{buildProofSubmissionForm(generalVerifierObj.contractName, claimObj.token, claimObj.claimId, index)}
					</>
				);
			case ProofAndVerifierStatusEnum.PENDING:
				return (
					<div>
						{buildStatusElement(
							status,
							<span>
								{t('proof-submission.verifier.pending', { name: generalVerifierObj.label })}
								{addMessageIfExistent(message)}
							</span>
						)}

						{generalVerifierObj.label.includes('Voting') && (
							// isEligibleEndVote(generalVerifierObj.label, claimObj.claimId) &&
							<div>
								{/* <Status>{"End Voting After 1 Day"}</Status> */}
								<Button onClick={endVoting} center="true">
									End Vote
								</Button>
							</div>
						)}
					</div>
				);
			case ProofAndVerifierStatusEnum.APPROVED:
				return buildStatusElement(
					status,
					<span>
						{t('proof-submission.verifier.approved', { name: generalVerifierObj.label })}
						{addMessageIfExistent(message)}
					</span>
				);
			case ProofAndVerifierStatusEnum.REJECTED:
				return buildStatusElement(
					status,
					<span>
						{t('proof-submission.verifier.rejected', { name: generalVerifierObj.label })}
						{addMessageIfExistent(message)}
					</span>
				);
		}
	};

	const addMessageIfExistent = message => {
		if (!message) {
			return '';
		}
		return (
			<>
				<br />
				<small>
					<i>{message}</i>
				</small>
			</>
		);
	};

	return (
		pseudoClaimId && (
			<Container>
				<Box title={t('proof-submission.box-title')}>
					{props.usersClaims[pseudoClaimId].gotRejected && (
						<center style={{ fontFamily: 'arial' }}>
							<b style={{ color: 'red' }}>{t('proof-submission.claim-rejected') + '.'}</b>
							<br />
							<br />
							{translationMarkdown(t('proof-submission.reason-hint') + '.', {
								'msgs-link': label => {
									return (
										// TODO <Link> would be smoother than <a>
										<a key="msgs-link" href="/messages">
											{label}
										</a>
									);
								}
							})}
							<br />
							{translationMarkdown(t('proof-submission.submit-new-claim') + '.', {
								'new-claim-link': label => {
									return (
										// TODO <Link> would be smoother than <a>
										<a key="new-claim-link" href={'/claim/' + props.match.params.tokenSymbol}>
											{label}
										</a>
									);
								}
							})}
							{/* TODO "or contact the token creator" too? #ConceptualDecision */}
						</center>
					)}
					{
						<>
							{Object.keys(props.usersClaims[pseudoClaimId].verifierStatuses).map((verifierTypeAddr, index) => {
								let claimObj = props.usersClaims[pseudoClaimId];
								let generalVerifierObj = props.verifierTypes[verifierTypeAddr];
								return (
									<div key={index}>
										{index > 0 && <Divider variant="middle" style={{ margin: '50px 0' }} />}
										{buildVerifierAppearance(index, claimObj, generalVerifierObj)}
									</div>
								);
							})}
						</>
					}
				</Box>
			</Container>
		)
	);
}

const getStatusColor = status => {
	switch (status) {
		case ProofAndVerifierStatusEnum.UNSUBMITTED:
			return colors.wrong;
		case ProofAndVerifierStatusEnum.PENDING:
			return '#FED8B1'; // light orange
		case ProofAndVerifierStatusEnum.APPROVED:
			return colors.true;
		case ProofAndVerifierStatusEnum.REJECTED:
			return 'lightgray';
	}
};

const Status = styled(Typography)`
	&& {
		background: ${props => getStatusColor(props.status)};
		padding: 10px;
		margin: 20px 0;
		box-sizing: border-box;
		border-radius: 4px;
	}
`;

ProofSubmission.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		usersClaims: state.fin4Store.usersClaims,
		fin4Tokens: state.fin4Store.fin4Tokens,
		verifierTypes: state.fin4Store.verifierTypes
	};
};

export default drizzleConnect(ProofSubmission, mapStateToProps);
