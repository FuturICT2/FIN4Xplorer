import React, { useState, useEffect } from 'react';
import { Typography, Divider } from '@material-ui/core';
import ContractForm from '../../components/ContractForm';
import styled from 'styled-components';
import colors from '../../config/colors-config';
import { drizzleConnect } from 'drizzle-react';
import { findTokenBySymbol } from '../../components/Contractor';
import Box from '../../components/Box';
import Container from '../../components/Container';
import PropTypes from 'prop-types';
import LocationProof from './proofs/LocationProof';
import SelfieTogetherProof from './proofs/SelfieTogetherProof';
import PictureProof from './proofs/PictureProof';
import { Link } from 'react-router-dom';

function ProofSubmission(props) {
	const [pseudoClaimId, setPseudoClaimId] = useState(null);

	useEffect(() => {
		let symbol = props.match.params.tokenSymbol;
		if (
			!pseudoClaimId &&
			Object.keys(props.fin4Tokens).length > 0 &&
			Object.keys(props.proofTypes).length > 0 &&
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

	const buildProofSubmissionForm = (proofTypeName, tokenAddrToReceiveProof, claimId, index) => {
		switch (proofTypeName) {
			case 'Location':
				return <LocationProof key={'loc_' + index} tokenAddr={tokenAddrToReceiveProof} claimId={claimId} />;
			case 'SelfieTogether':
				return <SelfieTogetherProof key={'selfie_' + index} tokenAddr={tokenAddrToReceiveProof} claimId={claimId} />;
			case 'Picture':
				return <PictureProof key={'pic_' + index} tokenAddr={tokenAddrToReceiveProof} claimId={claimId} />;
			case 'Networking':
			/*case 'Networking':
				return <NetworkingProof key={'networking_' + index} tokenAddr={tokenAddrToReceiveProof} claimId={claimId} />;
			case 'HappyMoment':
				return <HappyMomentProof key={'happy_' + index} tokenAddr={tokenAddrToReceiveProof} claimId={claimId} />;*/
			default:
				return (
					<ContractForm
						contractName={proofTypeName}
						method="submitProof"
						staticArgs={{
							tokenAddrToReceiveProof: tokenAddrToReceiveProof,
							claimId: claimId + ''
						}}
						buttonLabel="Submit proof"
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
							{Object.keys(props.usersClaims[pseudoClaimId].proofStatuses).map((proofTypeAddr, index) => {
								let claim = props.usersClaims[pseudoClaimId];
								let proofIsApproved = claim.proofStatuses[proofTypeAddr];
								let proofObj = props.proofTypes[proofTypeAddr];
								return (
									<div key={index}>
										{index > 0 && <Divider variant="middle" style={{ margin: '50px 0' }} />}
										{proofIsApproved ? (
											<Status isapproved="true">
												{'The proof ' + proofObj.label + ' was submitted successfully.'}
											</Status>
										) : (
											<>
												<Status isapproved="false">
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

const Status = styled(Typography)`
	&& {
		background: ${props => (props.isapproved === 'true' ? colors.true : colors.wrong)};
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
		proofTypes: state.fin4Store.proofTypes
	};
};

export default drizzleConnect(ProofSubmission, mapStateToProps);
