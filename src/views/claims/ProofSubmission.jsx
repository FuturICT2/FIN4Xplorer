import React, { useState, useEffect } from 'react';
import { Typography, Divider } from '@material-ui/core';
import styled from 'styled-components';
import colors from '../../config/colors-config';
import { drizzleConnect } from 'drizzle-react';
import { findTokenBySymbol, getContractData } from '../../components/Contractor';
import Box from '../../components/Box';
import AddIcon from '@material-ui/icons/Add';
import Container from '../../components/Container';
import PropTypes from 'prop-types';
import LocationProof from './proofs/LocationProof';
import Button from '../../components/Button';
import PictureUploadProof from './proofs/PictureUploadProof';
import FileUploadProof from './proofs/FileUploadProof';
import { Link } from 'react-router-dom';
import ContractFormSimple from '../../components/ContractFormSimple';
import { contractCall, readOnlyCall } from '../../components/Contractor';
import { abiTypeToTextfieldType, capitalizeFirstLetter, ProofAndVerifierStatusEnum } from '../../components/utils';

function ProofSubmission(props, context) {
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

	const buildProofSubmissionForm = (verifierTypeName, tokenAddrToReceiveVerifierNotice, claimId, index) => {
		switch (verifierTypeName) {
			case 'Location':
				return (
					<LocationProof
						key={'loc_' + index}
						tokenAddr={tokenAddrToReceiveVerifierNotice}
						claimId={claimId}
						callbacks={{
							markVerifierPendingUponBroadcastedTransaction: () => {
								return {
									pseudoClaimId: pseudoClaimId,
									verifierTypeName: verifierTypeName
								};
							}
						}}
					/>
				);
			case 'SelfieTogether':
				return (
					<PictureUploadProof
						key={'selfie_' + index}
						tokenAddr={tokenAddrToReceiveVerifierNotice}
						claimId={claimId}
						contractName={'SelfieTogether'}
						callbacks={{
							markVerifierPendingUponBroadcastedTransaction: () => {
								return {
									pseudoClaimId: pseudoClaimId,
									verifierTypeName: verifierTypeName
								};
							}
						}}
					/>
				);
			case 'Picture':
				return (
					<PictureUploadProof
						key={'pic_' + index}
						tokenAddr={tokenAddrToReceiveVerifierNotice}
						claimId={claimId}
						contractName={'Picture'}
						callbacks={{
							markVerifierPendingUponBroadcastedTransaction: () => {
								return {
									pseudoClaimId: pseudoClaimId,
									verifierTypeName: verifierTypeName
								};
							}
						}}
					/>
				);
			case 'LimitedVoting':
				return (
					<FileUploadProof
						// key={'file_' + index}
						tokenAddr={tokenAddrToReceiveVerifierNotice}
						claimId={claimId}
						contractName={'LimitedVoting'}
						callbacks={{
							markVerifierPendingUponBroadcastedTransaction: () => {
								return {
									pseudoClaimId: pseudoClaimId,
									verifierTypeName: verifierTypeName
								};
							}
						}}
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
						callbacks={{
							markVerifierPendingUponBroadcastedTransaction: () => {
								return {
									pseudoClaimId: pseudoClaimId,
									verifierTypeName: verifierTypeName
								};
							}
						}}
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
						callbacks={{
							markVerifierPendingUponBroadcastedTransaction: () => {
								return {
									pseudoClaimId: pseudoClaimId,
									verifierTypeName: verifierTypeName
								};
							}
						}}
					/>
				);
			/*case 'Networking':
				return <NetworkingProof key={'networking_' + index} tokenAddr={tokenAddrToReceiveVerifierNotice} claimId={claimId} />;
			case 'HappyMoment':
				return <HappyMomentProof key={'happy_' + index} tokenAddr={tokenAddrToReceiveVerifierNotice} claimId={claimId} />;*/
			default:
				const abi = require('../../build/contracts/' + verifierTypeName).abi;
				let contractMethod = 'submitProof_' + verifierTypeName;
				let inputs = abi.filter(el => el.name === contractMethod)[0].inputs;
				let fields = inputs.map(input => {
					return [capitalizeFirstLetter(input.name), abiTypeToTextfieldType(input.type, input.name)];
				}); // I don't remember why I capitalized the first letter...
				// if(verifierTypeName.localeCompare('Password') == 0){
				// console.log(fields);
				// }
				return (
					<ContractFormSimple
						contractName={verifierTypeName}
						contractMethod={'submitProof_' + verifierTypeName}
						pendingTxStr={'Submit proof ' + verifierTypeName}
						fields={fields}
						fixValues={{
							TokenAddrToReceiveVerifierNotice: tokenAddrToReceiveVerifierNotice,
							ClaimId: claimId + ''
						}}
						callbacks={{
							markVerifierPendingUponBroadcastedTransaction: () => {
								return {
									pseudoClaimId: pseudoClaimId,
									verifierTypeName: verifierTypeName
								};
							}
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
						generalVerifierObj.label,
						'endVote',
						[claimObj.claimId],
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
							'Your claim requires you to provide the following proof: ' + generalVerifierObj.description
						)}
						{buildProofSubmissionForm(generalVerifierObj.label, claimObj.token, claimObj.claimId, index)}
					</>
				);
			case ProofAndVerifierStatusEnum.PENDING:
				return (
					<div>
						{buildStatusElement(
							status,
							<span>
								{'The proof ' + generalVerifierObj.label + ' is in pending state'}
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
						{'The proof ' + generalVerifierObj.label + ' got verified successfully'}
						{addMessageIfExistent(message)}
					</span>
				);
			case ProofAndVerifierStatusEnum.REJECTED:
				return buildStatusElement(
					status,
					<span>
						{'The proof ' + generalVerifierObj.label + ' got rejected'}
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
				<Box title="Proof Submission">
					{props.usersClaims[pseudoClaimId].gotRejected && (
						<center style={{ fontFamily: 'arial' }}>
							<b style={{ color: 'red' }}>Your claim got rejected.</b>
							<br />
							<br />
							See the reason(s) in your <Link to={'/messages'}>messages</Link>.
							<br />
							If you want, you can submit <Link to={'/claim/' + props.match.params.tokenSymbol}>a new claim</Link>.
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
