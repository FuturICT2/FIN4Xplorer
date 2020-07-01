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
		address: '0x8a5C1b08381D83afdb1F1E05077d9D90457888c3'
	},
	Picture: {
		type: 'Interactive',
		claimerInput: { inputType: 'User generated data', sensorData: 'None', userData: 'Picture' },
		description: 'The claimer has to supply a picture, based on which the approver will decide to approve.',
		address: '0x6e3a19eA2b193e1Cae1883197950Db1044f9849d'
	},
	Blacklisting: {
		type: 'Non-Interactive',
		claimerInput: { inputType: 'System/Sensor generated data', sensorData: 'Address', userData: 'None' },
		description: 'The token creator defines group(s) and/or individual accounts that can not claim a token.',
		address: '0xE3e77B0cD23cD5dE1E4b9Db4BCdD64CC8a1230D7'
	},
	Whitelisting: {
		type: 'Non-Interactive',
		claimerInput: { inputType: 'System/Sensor generated data', sensorData: 'Address', userData: 'None' },
		description:
			'The token creator defines group(s) and/or individual accounts that can claim a token while everyone else can not',
		address: '0x7008897a3aCC35E8042ddbfa63b083344FCc7F4F'
	},
	Location: {
		type: 'Non-Interactive',
		claimerInput: { inputType: 'User generated data', sensorData: 'None', userData: 'Location' },
		description: 'A location, which is within a radius of a location the token creator defines, needs to be provided.',
		address: '0x9A253A7E68A0AE74cea8499A480516eD758F2E06'
	},
	SelfApprove: {
		type: 'Non-Interactive',
		claimerInput: { inputType: 'None', sensorData: 'None', userData: 'None' },
		description: 'Claimers approve their own claim.',
		address: '0xFbF8ee5b4f2244197dD2671392aF04E3D4A178fe'
	},
	SelfieTogether: {
		type: 'Interactive',
		claimerInput: { inputType: 'User generated data', sensorData: 'None', userData: 'Picture' },
		description:
			'The claimer supplies a picture, based on which a self-chosen approver and a member of a group of users appointed by the token creator decide to approve.',
		address: '0x629750011DD25dC3818B423dccFbaaaD0057E3a8'
	},
	ApprovalByGroupMember: {
		type: 'Inveractive',
		claimerInput: { inputType: 'None', sensorData: 'None', userData: 'None' },
		description: 'The token creator specifies one or more user groups, of which one member has to approve.',
		address: '0xC7676Aba14d324bA104E230a5f3BE3c0043Fe998'
	},
	SpecificAddress: {
		type: 'Inveractive',
		claimerInput: { inputType: 'None', sensorData: 'None', userData: 'None' },
		description: 'The claimer specifies an address, which has to approve.',
		address: '0x855Be613F47FD9fFf92d77b8bF746ef3b5940609'
	},
	LimitedVoting: {
		type: 'Inveractive',
		claimerInput: { inputType: 'None', sensorData: 'None', userData: 'None' },
		description: 'The proof is sent to the users due to a random mechanism',
		address: ''
	},
	PictureVoting: {
		type: 'Inveractive',
		claimerInput: { inputType: 'User generated data', sensorData: 'None', userData: 'Picture' },
		description: 'The claimer has to supply a picture, based on which the approver will decide to approve.',
		address: ''
	},
	TokenCreatorApproval: {
		type: 'Inveractive',
		claimerInput: { inputType: 'None', sensorData: 'None', userData: 'None' },
		description: 'The token creator has to approve.',
		address: '0xF48278879b0E28961d8828f0764E070140052125'
	},
	VideoVoting: {
		type: 'Inveractive',
		claimerInput: { inputType: 'User generated data', sensorData: 'None', userData: 'Video' },
		description: 'The claimer has to supply a video, based on which the approver will decide to approve.',
		address: ''
	},
	ClaimableOnlyNTimesPerUser: {
		type: 'Non-Interactive',
		claimerInput: { inputType: 'None', sensorData: 'None', userData: 'None' },
		description: 'The token creator sets a cap how many times a token can be successfully claimed',
		address: '0x268D7e011BC986a071EfD44C107A637bDE3cC329'
	}
};
