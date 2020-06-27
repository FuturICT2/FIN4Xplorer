import React from 'react';
import { Trans } from 'react-i18next';
import { notificationServerIsActive, subscribeToContractEventsViaNotificationServer } from './NotificationServerClient';
import { toast } from 'react-toastify';
import { ProofAndVerifierStatusEnum } from '../components/utils';
const BN = require('bignumber.js');

let defaultAccount;
let store;

// if NotificationServer is available, we'll take that
// otherwise we use the drizzle store contract event listeners here
const subscribeToContractEvents = _store => {
	store = _store;
	defaultAccount = store.getState().fin4Store.defaultAccount;
	if (notificationServerIsActive()) {
		console.log('Subscribing to contract events via the notification server');
		subscribeToContractEventsViaNotificationServer(defaultAccount);
	} else {
		console.log('Subscribing to contract events via the drizzle store contract event listeners');
		// TODO
	}
};

const handleContractEvent = (eventName, values) => {
	// let display = `${contractName}: ${eventName}`;
	let display = contractEventHandlers[eventName](values);
	if (display) {
		toast.success(display, { position: toast.POSITION.TOP_RIGHT });
	}
};

const contractEventHandlers = {
	handleFin4TokenCreated: values => {},
	ClaimSubmitted: claim => {
		let id = claim.tokenAddr + '_' + claim.claimId; // pseudoId, just for frontend
		let isCurrentUsersClaim = claim.claimer === defaultAccount;

		// block: claim-event not caused by current user / duplicate events
		if (!isCurrentUsersClaim || store.getState().fin4Store.usersClaims[id]) {
			return;
		}

		let quantity = new BN(claim.quantity).toNumber();
		let token = store.getState().fin4Store.fin4Tokens[claim.tokenAddr];

		let verifierStatusesObj = {};
		for (let i = 0; i < claim.requiredVerifierTypes.length; i++) {
			verifierStatusesObj[claim.requiredVerifierTypes[i]] = {
				status: ProofAndVerifierStatusEnum.UNSUBMITTED,
				message: ''
			};
		}

		store.dispatch({
			type: 'ADD_CLAIM',
			claim: {
				id: id,
				token: claim.tokenAddr,
				claimId: claim.claimId,
				claimer: claim.claimer,
				isApproved: false,
				gotRejected: false,
				quantity: quantity,
				claimCreationTime: new BN(claim.claimCreationTime).toNumber(),
				comment: claim.comment,
				verifierStatuses: verifierStatusesObj,
				// these will be fetched "upon request" (when opening the site) in ProofSubmission
				// and then filled into the
				verifiersWithMessages: []
			}
		});
		return (
			<Trans
				i18nKey="notification.claim-submitted"
				values={{ quantity: quantity, name: token.name, symbol: token.symbol }}
			/>
		);
	},
	ClaimApproved: values => {},
	ClaimRejected: values => {},
	UpdatedTotalSupply: values => {},
	VerifierPending: values => {},
	VerifierApproved: values => {},
	VerifierRejected: values => {},
	NewMessage: values => {},
	MessageMarkedAsRead: values => {},
	SubmissionAdded: values => {}
};

export { subscribeToContractEvents, handleContractEvent };
