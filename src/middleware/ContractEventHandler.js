import { notificationServerIsActive, subscribeToContractEventsViaNotificationServer } from './NotificationServerClient';

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

const handleContractEvent = () => {};

const contractEventHandlers = {
	handleFin4TokenCreated: () => {},
	ClaimSubmitted: () => {},
	ClaimApproved: () => {},
	ClaimRejected: () => {},
	UpdatedTotalSupply: () => {},
	VerifierPending: () => {},
	VerifierApproved: () => {},
	VerifierRejected: () => {},
	NewMessage: () => {},
	MessageMarkedAsRead: () => {},
	SubmissionAdded: () => {}
};

export { subscribeToContractEvents, handleContractEvent };
