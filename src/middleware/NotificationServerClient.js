import io from 'socket.io-client';

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

	socket.on('Fin4TokenCreated', values => {
		console.log('Received Fin4TokenCreated contract event via notification server', values);
	});
	socket.on('NewMessage', values => {
		console.log('Received NewMessage contract event via notification server', values);
	});
	socket.on('MessageMarkedAsRead', values => {
		console.log('Received MessageMarkedAsRead contract event via notification server', values);
	});
	socket.on('ClaimSubmitted', values => {
		console.log('Received ClaimSubmitted contract event via notification server', values);
	});
	socket.on('ClaimApproved', values => {
		console.log('Received ClaimApproved contract event via notification server', values);
	});
	socket.on('ClaimRejected', values => {
		console.log('Received ClaimRejected contract event via notification server', values);
	});
	socket.on('VerifierPending', values => {
		console.log('Received VerifierPending contract event via notification server', values);
	});
	socket.on('VerifierApproved', values => {
		console.log('Received VerifierApproved contract event via notification server', values);
	});
	socket.on('VerifierRejected', values => {
		console.log('Received VerifierRejected contract event via notification server', values);
	});
	socket.on('UpdatedTotalSupply', values => {
		console.log('Received UpdatedTotalSupply contract event via notification server', values);
	});
	socket.on('SubmissionAdded', values => {
		console.log('Received SubmissionAdded contract event via notification server', values);
	});
};

export { notificationServerIsActive, subscribeToContractEventsViaNotificationServer };
