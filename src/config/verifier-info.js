export const verifierOptions = {
	type: {
		values: ['Non-Interactive', 'Interactive', 'Both'],
		description: 'Determines whether the input is verified by other users, the system or both.'
	},
	claimerInput: {
		inputType: ['System/Sensor generated data', 'User generated data', 'Both', 'None'],
		sensorData: {
			values: ['None', 'Location', 'Time'],
			description: 'Determines if and which sensor data must be provided by the claimer.'
		},
		userData: {
			values: ['None', 'Picture', 'Video', 'Password', 'Address'],
			description: 'Determines if and which content must be uploaded by the claimer.'
		}
	}
};
export const verifiers = {
	Password: {
		type: 'Non-Interactive',
		claimerInput: { inputType: 'User generated data', sensorData: 'None', userData: 'Password' },
		description: 'Approval if the user provides the password matching the one the token creator set.',
		address: '0xcB63EE41483e3d01a9295FBf12b7A791e385a7BB'
	},
	Picture: {
		type: 'Interactive',
		claimerInput: { inputType: 'User generated data', sensorData: 'None', userData: 'Picture' },
		description: 'The claimer has to supply a picture, based on which the approver will decide to approve.',
		address: '0xBAC31E7cC86bDE2312f87E5766071dB84FF8779c'
	},
	Blacklisting: {
		type: 'Non-Interactive',
		claimerInput: { inputType: 'System/Sensor generated data', sensorData: 'Address', userData: 'None' },
		description: 'The token creator defines group(s) and/or individual accounts that can not claim a token.',
		address: '0xFb01a6eF7d2F44aCcBcFB3432499ea7D7F1Dd1FB'
	},
	Location: {
		type: 'Non-Interactive',
		claimerInput: { inputType: 'User generated data', sensorData: 'None', userData: 'Location' },
		description: 'A location, which is within a radius of a location the token creator defines, needs to be provided.',
		address: '0xfEb13abbCD558d359B882Cdfe9a066300C112f6A'
	}
};
