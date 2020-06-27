import io from 'socket.io-client';
import { contractEventList, handleContractEvent } from './ContractEventHandler';

let serverConfig = null;
try {
	serverConfig = require('../config/server-urls.json');
} catch (err) {
	console.log('server-urls.json not found');
}

const notificationServerIsActive = () => {
	// TODO also check that its alive?
	return serverConfig && serverConfig.NOTIFICATION_SERVER_URL;
};

const subscribeToContractEventsViaNotificationServer = defaultAccount => {
	// { transports: ['websocket'] }} removes polling which would otherwise be a default
	// it causes disconnect-errors only on mobile every second if this is not active
	// via https://github.com/socketio/socket.io-client/issues/1097#issuecomment-301301030
	const socket = io(serverConfig.NOTIFICATION_SERVER_URL, { transports: ['websocket'] });
	socket.on('connect', () => {
		console.log(
			'Connected to notification server at ' +
				serverConfig.NOTIFICATION_SERVER_URL +
				' with public address ' +
				defaultAccount
		);
		socket.emit('register', defaultAccount);
	});
	contractEventList.map(eventName => {
		socket.on(eventName, values => {
			handleContractEvent(true, eventName, values);
		});
	});
};

export { notificationServerIsActive, subscribeToContractEventsViaNotificationServer };
