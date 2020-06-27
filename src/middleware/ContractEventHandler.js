import { notificationServerIsActive, subscribeToContractEventsViaNotificationServer } from './NotificationServerClient';

// if NotificationServer is available, we'll take that
// otherwise we use the drizzle store contract event listeners here
const subscribeToContractEvents = defaultAccount => {
	if (notificationServerIsActive()) {
		console.log('Subscribing to contract events via the notification server');
		subscribeToContractEventsViaNotificationServer(defaultAccount);
	} else {
		console.log('Subscribing to contract events via the drizzle store contract event listeners');
		// TODO
	}
};

export { subscribeToContractEvents };
