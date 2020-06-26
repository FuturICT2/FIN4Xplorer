import io from 'socket.io-client';

let serverConfig = null;
try {
	serverConfig = require('../config/server-urls.json');
} catch (err) {
	console.log('server-urls.json not found');
}

const subscribeToContractEvents = defaultAccount => {
	if (!(serverConfig && serverConfig.NOTIFICATION_SERVER_URL)) {
		return;
	}

	const socket = io(serverConfig.NOTIFICATION_SERVER_URL);
	socket.on('connect', () => {
		console.log(
			'Connected to notification server at ' +
				serverConfig.NOTIFICATION_SERVER_URL +
				' with public address ' +
				defaultAccount
		);
		socket.emit('register', defaultAccount);
	});

	socket.on('ClaimSubmitted', values => {
		console.log('Frontend received ClaimSubmitted event', values);
	});
};

export { subscribeToContractEvents };
