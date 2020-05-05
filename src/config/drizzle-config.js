import Fin4Main from '../build/contracts/Fin4Main.json';
import { Fin4MainAddress } from './deployment-info.js';

import Web3 from 'web3';
const web3 = new Web3(window.ethereum);

const drizzleConfig = {
	web3: {
		block: false,
		fallback: {
			type: 'ws',
			url: 'ws://127.0.0.1:7545'
		}
	},
	contracts: [
		{
			contractName: 'Fin4Main',
			web3Contract: new web3.eth.Contract(Fin4Main.abi, Fin4MainAddress)
		}
	],
	events: {},
	polls: {
		accounts: 1500
	}
};

export default drizzleConfig;
