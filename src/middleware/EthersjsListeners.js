import { getNetworkName } from '../components/utils';
import { Fin4MainAddress } from '../config/deployment-info.js';
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

	// TODO
};

export { subscribeToContractEventsViaEthersjsListeners };
