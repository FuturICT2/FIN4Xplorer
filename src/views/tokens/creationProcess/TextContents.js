import React from 'react';

//const steps = ['Identity', 'Design', 'Actions', 'Minting', 'Proving', 'Other', 'Underlying']; // Disbursement/Valuation instead of Value?
const steps = ['', '', '', '', '', '', ''];

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
			return 'Proving policy'; // Formerly: Add proof types that users will have to provide
		case 5:
			return 'Other policies';
		case 6:
			return 'Source of Token Value';
		default:
			return '';
	}
};

const getStepInfoBoxContent = (stepIndex, proofTypes) => {
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
					<b>Description</b>
					<br />
					Describe the purpose/idea of your new token in a short and understandable text.
				</>
			);
		case 1: // Traits (= Properties)
			return (
				<>
					<b>Token is transferable</b>
					<br />
					Users who have a balance on this token, can transfer some or all of it to other users. In most cases users
					want to be able to transfer positive action tokens (e.g. for trading).
					<br />
					<br />
					<b>Token is mintable</b>
					<br />
					Eligible users or smart contracts can "mint" any amount to a public address of their choosing. The total
					supply of this token gets increased by that amount.
					<br />
					<br />
					<b>Token is burnable</b>
					<br />
					Users can burn some or all of their balance on this token. The burned amount gets deducted from their balance
					and the total supply of the token shrinks by that amount.
					<br />
					<br />
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
					<b>Decimals</b>
					<br />
					The digits by which your token is divisible. Zero means that users can only have natural numbers (0,1,2,3,4..)
					as balance on your token and only amounts in natural numbers can be transferred. Other number indicate the
					decimal places, e.g., "3" means the token is divisible with 0.001 being the smallest unit.
					<br />
					<br />
					<b>Initial token supply</b>
					<br />
					As the token creator, you can give yourself an initial amount of your new token. The total supply (above) will
					adjust to this amount.{' '}
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
		case 3: // Value
			return (
				<>
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
			);
		case 4: // Proofs
			return (
				<>
					<b>Proving actions (read thoroughly)</b>
					<br />
					To obtain tokens, users need to prove to the system that they actually performed the action required. You can
					choose any combination of proofs from the list. Please take your time to think precisely about any combination
					you choose. Good proofs are suitable to the the nature of the token, suitable and practical for the users
					trying to obtain them, and practical for the token creators. The harder the proving is, the less users will
					try to obtain your token; the easier the proving is, the less perceived quality users will see in the token.
					In complex cases, you may want to experiment with different token designs at the same time. Finally, proving
					actions is a complex matter and we constantly work to improve the proving mechanisms.
					<br />
					<br />
					{Object.keys(proofTypes).map((proofAddr, idx) => {
						let proof = proofTypes[proofAddr];
						return (
							<span key={'proofInfo_' + idx}>
								<b>Proof type: {proof.label}</b>
								<br />
								{proof.description}
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
		case 5: // Other
			return (
				<>
					<b>Other policies</b>
					<br />
				</>
			);
		case 6: // Underlying
			return (
				<>
					<b>Source of Token Value</b>
					<br />
				</>
			);
		default:
			return <>TODO</>;
	}
};

export { steps, getStepContent, getStepInfoBoxContent };
