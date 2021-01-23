import React from 'react';
import { Trans } from 'react-i18next';
import { toast } from 'react-toastify';
import { ProofAndVerifierStatusEnum } from '../components/utils';
import { subscribeToContractEventsViaEthersjsListeners } from './EthersjsListeners';
const BN = require('bignumber.js');

let contractEventList = [
	['Fin4TokenManagement', 'Fin4TokenCreated'],
	['Fin4Claiming', 'ClaimSubmitted'],
	['Fin4Claiming', 'ClaimApproved'],
	['Fin4Claiming', 'ClaimRejected'],
	['Fin4Claiming', 'UpdatedTotalSupply'],
	['Fin4Claiming', 'VerifierPending'],
	['Fin4Claiming', 'VerifierApproved'],
	['Fin4Claiming', 'VerifierRejected'],
	['Fin4Messaging', 'NewMessage'],
	['Fin4Messaging', 'MessageMarkedAsRead'],
	['Fin4Verifying', 'SubmissionAdded']
];

let defaultAccount;
let store;

const subscribeToContractEvents = _store => {
	store = _store;
	defaultAccount = store.getState().fin4Store.defaultAccount;
	subscribeToContractEventsViaEthersjsListeners(defaultAccount);

	/*if (notificationServerIsActive()) {
		console.log('Subscribing to contract events via the notification server');
		subscribeToContractEventsViaNotificationServer(defaultAccount);
	} else {
		console.log('Subscribing to contract events via the drizzle store contract event listeners');
		takeEventsFromNotificationServer = false;
	}*/
};

const handleContractEvent = (eventName, values) => {
	/*if (!viaNotificationServer && takeEventsFromNotificationServer) {
		return; // ignore drizzle store events when we are listening to notification server
	}
	let display = `${contractName}: ${eventName}`;*/
	let display = contractEventHandlers[eventName](values);
	if (display) {
		// let eventSource = viaNotificationServer ? 'notification server' : 'drizzle store subscription';
		// console.log('Received ' + eventName + ' contract event via ' + eventSource, values);
		if (display !== 'no-notification') {
			toast.success(display, { position: toast.POSITION.TOP_RIGHT });
		}
	}
};

const contractEventHandlers = {
	Fin4TokenCreated: token => {
		let address = token.addr;
		// block duplicate events, seems easier this "definite" way then latest block?
		if (store.getState().fin4Store.fin4Tokens[address]) {
			return;
		}
		let name = token.name;
		let symbol = token.symbol;
		store.dispatch({
			type: 'ADD_FIN4_TOKEN',
			token: {
				address: address,
				name: name,
				symbol: symbol,
				description: token.description,
				unit: token.unit,
				userIsCreator: token.creator === defaultAccount,
				totalSupply: 0,
				creationTime: token.creationTime,
				hasFixedMintingQuantity: token.hasFixedMintingQuantity,
				isOPAT: null
			}
		});
		// Have to use <Trans> here because the t()-hook doesn't work here
		return <Trans i18nKey="notification.token-created" values={{ name: name, symbol: symbol }} />;
	},
	ClaimSubmitted: claim => {
		let id = claim.tokenAddr + '_' + claim.claimId; // pseudoId, just for frontend
		let isCurrentUsersClaim = claim.claimer === defaultAccount;
		// block: claim-event not caused by current user / duplicate events
		if (!isCurrentUsersClaim || store.getState().fin4Store.usersClaims[id]) {
			return;
		}
		let quantity = new BN(claim.quantity).toNumber();
		let token = store.getState().fin4Store.fin4Tokens[claim.tokenAddr];
		if (!token) {
			return;
		}
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
	ClaimApproved: claim => {
		let id = claim.tokenAddr + '_' + claim.claimId; // pseudoId
		let isCurrentUsersClaim = claim.claimer === defaultAccount;
		// block: current user is not claimer / duplicate events / claim is already approved
		let usersClaims = store.getState().fin4Store.usersClaims;
		if (!isCurrentUsersClaim || (usersClaims[id] && usersClaims[id].isApproved)) {
			return;
		}
		store.dispatch({
			type: 'APPROVE_CLAIM',
			id: id
		});
		store.dispatch({
			type: 'UPDATE_BALANCE',
			tokenAddress: claim.tokenAddr,
			balance: Number(claim.newBalance)
		});
		let token = store.getState().fin4Store.fin4Tokens[claim.tokenAddr];
		if (!token) {
			return;
		}
		return (
			<Trans
				i18nKey="notification.claim-approved"
				values={{ quantity: claim.mintedQuantity, name: token.name, symbol: token.symbol }}
			/>
		);
	},
	ClaimRejected: claim => {
		let id = claim.tokenAddr + '_' + claim.claimId; // pseudoId
		let isCurrentUsersClaim = claim.claimer === defaultAccount;
		// block: current user is not claimer / duplicate events / claim is already rejected
		let usersClaims = store.getState().fin4Store.usersClaims;
		if (!isCurrentUsersClaim || (usersClaims[id] && usersClaims[id].gotRejected)) {
			return;
		}
		store.dispatch({
			type: 'REJECT_CLAIM',
			id: id
		});
		let token = store.getState().fin4Store.fin4Tokens[claim.tokenAddr];
		if (!token) {
			return;
		}
		return <Trans i18nKey="notification.claim-rejected" values={{ name: token.name }} />;
	},
	UpdatedTotalSupply: values => {
		let tokenAddr = values.tokenAddr;
		let totalSupply = new BN(values.totalSupply).toNumber();
		let token = store.getState().fin4Store.fin4Tokens[tokenAddr];
		if (!token) {
			return;
		}
		if (token.totalSupply === totalSupply) {
			// block duplicate events, not sure if this can happen, but just to be sure
			return;
		}
		store.dispatch({
			type: 'UPDATE_TOTAL_SUPPLY',
			tokenAddress: tokenAddr,
			totalSupply: totalSupply
		});
		return 'no-notification';
	},
	VerifierPending: pendingVerifier => {
		// TODO share code with VerifierApproved and VerifierRejected?
		let belongsToCurrentUsersClaim = pendingVerifier.claimer === defaultAccount;
		let pseudoClaimId = pendingVerifier.tokenAddrToReceiveVerifierNotice + '_' + pendingVerifier.claimId;
		let usersClaims = store.getState().fin4Store.usersClaims;
		if (!usersClaims[pseudoClaimId]) {
			console.log('Dev: this should not happen! Investigate why');
			return;
		}
		let claim = usersClaims[pseudoClaimId];
		// block: proof-approval belongs to claim not of current user / duplicate events / proof on claim is already approved
		if (
			!belongsToCurrentUsersClaim ||
			claim.verifierStatuses[pendingVerifier.verifierTypeAddress].status === ProofAndVerifierStatusEnum.PENDING
		) {
			return;
		}
		store.dispatch({
			type: 'SET_VERIFIER_STATUS',
			pseudoClaimId: pseudoClaimId,
			verifierTypeAddress: pendingVerifier.verifierTypeAddress,
			statusObj: {
				status: ProofAndVerifierStatusEnum.PENDING,
				message: pendingVerifier.message
			}
		});
		return <Trans i18nKey="notification.verifier-pending" />; // TODO show more info
	},
	VerifierApproved: approvedVerifier => {
		let belongsToCurrentUsersClaim = approvedVerifier.claimer === defaultAccount;
		let pseudoClaimId = approvedVerifier.tokenAddrToReceiveVerifierNotice + '_' + approvedVerifier.claimId;
		let usersClaims = store.getState().fin4Store.usersClaims;
		if (!usersClaims[pseudoClaimId]) {
			console.log('Dev: this should not happen! Investigate why');
			return;
		}
		let claim = usersClaims[pseudoClaimId];
		// block: proof-approval belongs to claim not of current user / duplicate events / proof on claim is already approved
		if (
			!belongsToCurrentUsersClaim ||
			claim.verifierStatuses[approvedVerifier.verifierTypeAddress].status === ProofAndVerifierStatusEnum.APPROVED
		) {
			return;
		}
		store.dispatch({
			type: 'SET_VERIFIER_STATUS',
			pseudoClaimId: pseudoClaimId,
			verifierTypeAddress: approvedVerifier.verifierTypeAddress,
			statusObj: {
				status: ProofAndVerifierStatusEnum.APPROVED,
				message: approvedVerifier.message
			}
		});
		return <Trans i18nKey="notification.verifier-approved" />; // TODO show more info
	},
	VerifierRejected: rejectedVerifier => {
		let belongsToCurrentUsersClaim = rejectedVerifier.claimer === defaultAccount;
		let pseudoClaimId = rejectedVerifier.tokenAddrToReceiveVerifierNotice + '_' + rejectedVerifier.claimId;
		let usersClaims = store.getState().fin4Store.usersClaims;
		if (!usersClaims[pseudoClaimId]) {
			console.log('Dev: this should not happen! Investigate why');
			return;
		}
		let claim = usersClaims[pseudoClaimId];
		// block: proof-approval belongs to claim not of current user / duplicate events / proof on claim is already approved
		if (
			!belongsToCurrentUsersClaim ||
			claim.verifierStatuses[rejectedVerifier.verifierTypeAddress].status === ProofAndVerifierStatusEnum.REJECTED
		) {
			return;
		}
		store.dispatch({
			type: 'SET_VERIFIER_STATUS',
			pseudoClaimId: pseudoClaimId,
			verifierTypeAddress: rejectedVerifier.verifierTypeAddress,
			statusObj: {
				status: ProofAndVerifierStatusEnum.REJECTED,
				message: rejectedVerifier.message
			}
		});
		return <Trans i18nKey="notification.verifier-rejected" />;
	},
	NewMessage: msg => {
		if (msg.receiver !== defaultAccount) {
			// user is not recipient: ignore
			return;
		}
		let messageId = msg.messageId.toString();
		if (messageIdAlreadyExists(store, messageId)) {
			// block duplicate events
			return;
		}
		store.dispatch({
			type: 'ADD_MESSAGE_STUB',
			oneMessage: {
				messageId: messageId,
				messageType: null,
				sender: null,
				verifierContractName: null,
				message: null,
				hasBeenActedUpon: null,
				attachment: null,
				pendingRequestId: null
			}
		});
		return <Trans i18nKey="notification.new-message" />;
	},
	MessageMarkedAsRead: msg => {
		if (msg.receiver !== defaultAccount) {
			return;
		}
		let messageId = msg.messageId.toString();
		if (messageHasBeenActedUpon(store, messageId)) {
			// block duplicate events
			return;
		}
		store.dispatch({
			type: 'MESSAGE_MARKED_AS_READ',
			messageId: msg.messageId.toString()
		});
		return <Trans i18nKey="notification.message-marked-as-read" />;
	},
	SubmissionAdded: submission => {
		if (store.getState().fin4Store.submissions[submission.submissionId]) {
			// block duplicate events, this submission is already here
			return;
		}
		store.dispatch({
			type: 'ADD_SUBMISSION',
			submission: submission
		});
		let tokenObj = store.getState().fin4Store.fin4Tokens[submission.token];
		return <Trans i18nKey="notification.submission-added" values={{ symbol: tokenObj.symbol }} />;
	}
};

const messageIdAlreadyExists = (store, messageId) => {
	let messages = store.getState().fin4Store.messages;
	for (let i = 0; i < messages.length; i++) {
		if (messages[i].messageId === messageId) {
			return true;
		}
	}
	return false;
};

const messageHasBeenActedUpon = (store, messageId) => {
	let messages = store.getState().fin4Store.messages;
	for (let i = 0; i < messages.length; i++) {
		if (messages[i].messageId === messageId) {
			return messages[i].hasBeenActedUpon;
		}
	}
	return false;
};

export { contractEventList, subscribeToContractEvents, handleContractEvent };
