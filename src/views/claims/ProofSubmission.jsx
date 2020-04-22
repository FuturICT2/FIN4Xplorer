import React, { useState, useEffect } from 'react';
import { Typography, Divider } from '@material-ui/core';
import styled from 'styled-components';
import colors from '../../config/colors-config';
import { drizzleConnect } from 'drizzle-react';
import { findTokenBySymbol } from '../../components/Contractor';
import Box from '../../components/Box';
import Container from '../../components/Container';
import PropTypes from 'prop-types';
import LocationProof from './proofs/LocationProof';
import PictureUploadProof from './proofs/PictureUploadProof';
import { Link } from 'react-router-dom';
import ContractFormSimple from '../../components/ContractFormSimple';
import { abiTypeToTextfieldType, capitalizeFirstLetter, ProofAndVerifierStatusEnum } from '../../components/utils';

function ProofSubmission(props) {
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
			}
		}
	});

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
			/*case 'Networking':
				return <NetworkingProof key={'networking_' + index} tokenAddr={tokenAddrToReceiveVerifierNotice} claimId={claimId} />;
			case 'HappyMoment':
				return <HappyMomentProof key={'happy_' + index} tokenAddr={tokenAddrToReceiveVerifierNotice} claimId={claimId} />;*/
			default:
				const abi = require('../../build/contracts/' + verifierTypeName).abi;
				let contractMethod = 'submitProof_' + verifierTypeName;
				let inputs = abi.filter(el => el.name === contractMethod)[0].inputs;
				let fields = inputs.map(input => {
					return [capitalizeFirstLetter(input.name), abiTypeToTextfieldType(input.type)];
				}); // I don't remember why I capitalized the first letter...
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

	const buildVerifierAppearance = (index, claimObj, verifierObj) => {
		let status = claimObj.verifierStatuses[verifierObj.value];
		switch (status) {
			case ProofAndVerifierStatusEnum.UNSUBMITTED:
				return (
					<>
						{buildStatusElement(
							status,
							'Your claim requires you to provide the following proof: ' + verifierObj.description
						)}
						{buildProofSubmissionForm(verifierObj.label, claimObj.token, claimObj.claimId, index)}
					</>
				);
			case ProofAndVerifierStatusEnum.PENDING:
				return buildStatusElement(status, 'The proof ' + verifierObj.label + ' is in pending state.');
			case ProofAndVerifierStatusEnum.APPROVED:
				return buildStatusElement(status, 'The proof ' + verifierObj.label + ' got verified successfully.');
			case ProofAndVerifierStatusEnum.REJECTED:
				return buildStatusElement(status, 'The proof ' + verifierObj.label + ' got rejected.');
		}
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
								let verifierObj = props.verifierTypes[verifierTypeAddr];
								return (
									<div key={index}>
										{index > 0 && <Divider variant="middle" style={{ margin: '50px 0' }} />}
										{buildVerifierAppearance(index, claimObj, verifierObj)}
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
