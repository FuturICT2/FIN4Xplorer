import { getNetworkName } from '../components/utils';
import { Fin4MainAddress } from '../config/deployment-info.js';
import { contractEventList, handleContractEvent } from './ContractEventHandler';
const { ethers } = require('ethers');
const config = require('../config/config.json');

const subscribeToContractEventsViaEthersjsListeners = defaultAccount => {
	let provider;
	if (config.INFURA_API_KEY && getNetworkName() === 'Rinkeby') {
		provider = new ethers.providers.InfuraProvider('rinkeby', config.INFURA_API_KEY);
	} else {
		provider = new ethers.providers.JsonRpcProvider('http://localhost:7545');
	}

	let contracts = {
		Fin4MainContract: new ethers.Contract(Fin4MainAddress, require('../build/contracts/Fin4Main.json').abi, provider)
	};

	contracts.Fin4MainContract.getSatelliteAddresses().then(addresses => {
		// 2 Fin4TokenManagement
		contracts.Fin4TokenManagement = new ethers.Contract(
			addresses[2],
			require('../build/contracts/Fin4TokenManagement.json').abi,
			provider
		);
		// 3 Fin4Claiming
		contracts.Fin4Claiming = new ethers.Contract(
			addresses[3],
			require('../build/contracts/Fin4Claiming.json').abi,
			provider
		);
		// 5 Fin4Messaging
		contracts.Fin4Messaging = new ethers.Contract(
			addresses[5],
			require('../build/contracts/Fin4Messaging.json').abi,
			provider
		);
		// 6 Fin4Verifying
		contracts.Fin4Verifying = new ethers.Contract(
			addresses[6],
			require('../build/contracts/Fin4Verifying.json').abi,
			provider
		);

		contractEventList.map(entry => {
			let contractName = entry[0];
			let eventName = entry[1];
			contracts[contractName].on(eventName, (...args) => {
				let values = extractValues(contractName, args);
				console.log('Received ' + eventName + ' Event from ' + contractName + ' contract', values);
				handleContractEvent(eventName, values);
			});
		});
	});
};

const extractValues = (contractName, args) => {
	/*
	Rearranging the contract event data like this seems necessary
	because it arrives as a mix of array and object:

	0: 0x...
	1: 1
	tokenAddr: 0x...
	claimId: 1

	When I sent this to the frontend or use JSON.stringify(), it keeps
	only the array-part and the keys are lost. I want to pass them though.
	*/
	let raw = args.pop().args;
	let values = {};
	Object.keys(raw).map(key => {
		if (isNaN(key)) {
			// keep it only if the key is not a number
			let value = raw[key];
			if (value._isBigNumber) {
				value = value.toString();
			}
			values[key] = value;
		}
	});
	values['contractName'] = contractName;
	return values;
};

export { subscribeToContractEventsViaEthersjsListeners };
