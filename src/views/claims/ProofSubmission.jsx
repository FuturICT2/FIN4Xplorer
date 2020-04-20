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
import { abiTypeToTextfieldType, capitalizeFirstLetter } from '../../components/utils';

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

	const buildProofSubmissionForm = (verifierTypeName, tokenAddrToReceiveProof, claimId, index) => {
		switch (verifierTypeName) {
			case 'Location':
				return <LocationProof key={'loc_' + index} tokenAddr={tokenAddrToReceiveProof} claimId={claimId} />;
			case 'SelfieTogether':
				return (
					<PictureUploadProof
						key={'selfie_' + index}
						tokenAddr={tokenAddrToReceiveProof}
						claimId={claimId}
						contractName={'SelfieTogether'}
					/>
				);
			case 'Picture':
				return (
					<PictureUploadProof
						key={'pic_' + index}
						tokenAddr={tokenAddrToReceiveProof}
						claimId={claimId}
						contractName={'Picture'}
					/>
				);
			/*case 'Networking':
				return <NetworkingProof key={'networking_' + index} tokenAddr={tokenAddrToReceiveProof} claimId={claimId} />;
			case 'HappyMoment':
				return <HappyMomentProof key={'happy_' + index} tokenAddr={tokenAddrToReceiveProof} claimId={claimId} />;*/
			default:
				const abi = require('../../build/contracts/' + verifierTypeName).abi;
				let contractMethod = 'submitProof_' + verifierTypeName;
				let inputs = abi.filter(el => el.name === contractMethod)[0].inputs;
				let fields = inputs.map(input => {
					return [capitalizeFirstLetter(input.name), abiTypeToTextfieldType(input.type)];
				});
				return (
					<ContractFormSimple
						contractName={verifierTypeName}
						contractMethod={'submitProof_' + verifierTypeName}
						pendingTxStr={'Submit proof ' + verifierTypeName}
						fields={fields}
						fixValues={{
							TokenAddrToReceiveProof: tokenAddrToReceiveProof,
							ClaimId: claimId + ''
						}}
					/>
				);
		}
	};

	return (
		pseudoClaimId && (
			<Container>
				<Box title="Proof Submission">
					{props.usersClaims[pseudoClaimId].gotRejected ? (
						<center style={{ fontFamily: 'arial' }}>
							<b style={{ color: 'red' }}>Your claim got rejected.</b>
							<br />
							<br />
							See the reason(s) in your <Link to={'/messages'}>messages</Link>.
							<br />
							If you want, you can submit <Link to={'/claim/' + props.match.params.tokenSymbol}>a new claim</Link>.
							{/* TODO "or contact the token creator" too? #ConceptualDecision */}
						</center>
					) : (
						<>
							{Object.keys(props.usersClaims[pseudoClaimId].verifierStatuses).map((verifierTypeAddr, index) => {
								let claim = props.usersClaims[pseudoClaimId];
								let proofIsApproved = claim.verifierStatuses[verifierTypeAddr];
								let proofObj = props.verifierTypes[verifierTypeAddr];
								return (
									<div key={index}>
										{index > 0 && <Divider variant="middle" style={{ margin: '50px 0' }} />}
										{proofIsApproved ? (
											<Status status="approved">
												{'The proof ' + proofObj.label + ' was submitted successfully.'}
											</Status>
										) : (
											<>
												<Status status="unsubmitted">
													{'Your claim requires you to provide the following proof: ' + proofObj.description}
												</Status>
												{buildProofSubmissionForm(proofObj.label, claim.token, claim.claimId, index)}
											</>
										)}
									</div>
								);
							})}
						</>
					)}
				</Box>
			</Container>
		)
	);
}

const getStatusColor = status => {
	switch (status) {
		case 'approved':
			return colors.true;
		case 'unsubmitted':
			return colors.wrong;
		case 'pending':
			return '#FED8B1'; // light orange
	} // case rejected not needed because the whole submission-page collapses into one message
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
