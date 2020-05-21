import React from 'react';
import { Link } from 'react-router-dom';
import web3 from 'web3';
import { networkName } from '../config/deployment-info.js';
const nanoid = require('nanoid');

const TCRactive = true; // the other necessary switch is in migrations/3_deploy_tcr.js

const BNstr = numb => {
	return web3.utils.toBN(numb).toString();
};

const stringToBytes32 = str => {
	return web3.utils.fromAscii(str);
};

const bytes32ToString = bytes32 => {
	return web3.utils.hexToUtf8(bytes32);
};

const buildIconLabelLink = (link, icon, label, enabled = true, newLineAfterwards = true) => {
	let style = { textDecoration: 'none' };
	let tooltip = null;
	if (!enabled) {
		style = { textDecoration: 'none', color: 'silver' };
		tooltip = 'Available soon';
	}
	return (
		<Link to={enabled ? link : '#'} style={style} title={tooltip}>
			<div style={{ display: 'flex', alignItems: 'center', paddingLeft: '15px', fontFamily: 'arial' }}>
				{icon}
				&nbsp;&nbsp;{label}
			</div>
			{newLineAfterwards && <br />}
		</Link>
	);
};

const buildIconLabelCallback = (callback, icon, label, newLineAfterwards = true) => {
	return (
		<>
			<Link to="#" onClick={callback} style={{ textDecoration: 'none' }}>
				<div style={{ display: 'flex', alignItems: 'center', paddingLeft: '15px', fontFamily: 'arial' }}>
					{icon}
					&nbsp;&nbsp;{label}
				</div>
				{newLineAfterwards && <br />}
			</Link>
		</>
	);
};

const getFormattedSelectOptions = tokens => {
	return Object.keys(tokens).map(addr => {
		let token = tokens[addr];
		return {
			value: token.address,
			label: token.name,
			symbol: token.symbol
		};
	});
};

const getRandomTokenCreationDraftID = () => {
	// let allCookies = Cookies.get();
	// let nextIndex = Object.keys(allCookies).filter(key => key.startsWith('TokenCreationDraft')).length;
	return getRandomStringOfLength(5);
};

const getRandomStringOfLength = len => {
	return nanoid(len);
};

const findVerifierTypeAddressByName = (verifierTypes, name) => {
	for (var addr in verifierTypes) {
		if (verifierTypes.hasOwnProperty(addr)) {
			if (verifierTypes[addr].label === name) {
				return addr;
			}
		}
	}
	return null;
};

const doCallback = (callbackCollection, name, args) => {
	if (callbackCollection && callbackCollection[name]) {
		callbackCollection[name](args);
	}
};

const abiTypeToTextfieldType = abiType => {
	switch (abiType) {
		case 'uint256':
			return 'number';
		case 'string':
			return 'text';
		default:
			return abiType;
	}
};

const capitalizeFirstLetter = str => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

const ProofAndVerifierStatusEnum = {
	// corresponds with the Status enum in the Fin4TokenBase contract
	UNSUBMITTED: 0,
	PENDING: 1,
	APPROVED: 2,
	REJECTED: 3
};

const getNetworkName = () => {
	return capitalizeFirstLetter(networkName);
};

const getEtherscanTxURL = txHash => {
	return 'https://' + networkName + '.etherscan.io/tx/' + txHash;
};

const getEtherscanAddressURL = contractAddress => {
	return 'https://' + networkName + '.etherscan.io/address/' + contractAddress;
};

const isCollateralFor = (collateralAddress, allUnderlyings) => {
	return allUnderlyings.SwapSourcerer.pairs.filter(pair => pair.collateral === collateralAddress);
};

const hasTheseCollaterals = (patAddress, allUnderlyings) => {
	return allUnderlyings.SwapSourcerer.pairs.filter(pair => pair.pat === patAddress);
};

export {
	buildIconLabelLink,
	buildIconLabelCallback,
	getFormattedSelectOptions,
	getRandomStringOfLength,
	getRandomTokenCreationDraftID,
	findVerifierTypeAddressByName,
	TCRactive,
	BNstr,
	doCallback,
	abiTypeToTextfieldType,
	capitalizeFirstLetter,
	stringToBytes32,
	bytes32ToString,
	ProofAndVerifierStatusEnum,
	getNetworkName,
	getEtherscanTxURL,
	getEtherscanAddressURL,
	isCollateralFor,
	hasTheseCollaterals
};
