import React from 'react';
import { Link } from 'react-router-dom';
import web3 from 'web3';
import { networkName } from '../config/deployment-info.js';
import { isMobile } from 'react-device-detect';
const nanoid = require('nanoid');

const TCRactive = true; // the other necessary switch is in migrations/3_deploy_tcr.js
const UnderlyingsActive = true; // the other necessary switch is in migrations/2_deploy_contracts.js

const Fin4Colors = {
	blue: '#00a3ef',
	darkViolet: '#695ead',
	darkPink: '#cc1c6e',
	darkGrey: '#3d363f'
};

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

const getRandomCampaignCreationDraftID = () => {
	return getRandomStringOfLength(5);
};

const getRandomStringOfLength = len => {
	return nanoid(len);
};

const findVerifierTypeAddressByContractName = (verifierTypes, contractName) => {
	for (var addr in verifierTypes) {
		if (verifierTypes.hasOwnProperty(addr)) {
			if (verifierTypes[addr].contractName === contractName) {
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

const isCollateralFor = (collateralAddress, sourcererPairs) => {
	return sourcererPairs.filter(pair => pair.collateral === collateralAddress);
};

const hasTheseCollaterals = (patAddress, sourcererPairs) => {
	return sourcererPairs.filter(pair => pair.pat === patAddress);
};

// This can be improved: a regex that handles both markdown-links as well as <br>s
//						 it currently breaks if the exact [label](key) occurs twice
//						 support also <Link>
const translationMarkdown = (i18nextReturnValue, replacingObjects) => {
	// via https://stackoverflow.com/q/32381742/2474159
	const regexToExtractMarkdownLinks = /(\[.*?\]\()(.+?)(\))/g;
	// we rely on them being extracted in order, that seems to be the case
	const mdLinksOrdered = i18nextReturnValue.match(regexToExtractMarkdownLinks); // format: [label](key)
	if (!mdLinksOrdered) {
		return '';
	}
	let items = [];
	let remaining = i18nextReturnValue;

	for (let i = 0; i < mdLinksOrdered.length + 1; i++) {
		let mdLink = mdLinksOrdered[i];
		let before = remaining.split(mdLink)[0];
		let after = remaining.split(mdLink)[1];
		remaining = after;
		let beforeParts = before.split('<br>');
		for (let j = 0; j < beforeParts.length; j++) {
			let part = beforeParts[j];
			items.push(part);
			if (j < beforeParts.length - 1) {
				items.push(<br key={'br_' + i + '_' + j} />);
			}
		}
		if (i == mdLinksOrdered.length) {
			continue;
		}
		let label = mdLink.match(/\[(.*?)\]/)[1]; // via https://stackoverflow.com/a/2403159/2474159
		let key = mdLink.match(/\(([^)]+)\)/)[1]; // via https://stackoverflow.com/a/12059321/2474159
		if (replacingObjects[key]) {
			items.push(replacingObjects[key](label));
		}
	}

	return <>{items}</>;
};

const isMobileDevice = () => {
	return isMobile; // window.innerWidth < 400;
};

const getImageDimensions = (fileObject, callback) => {
	// via https://stackoverflow.com/a/17272914/2474159
	let url = URL.createObjectURL(fileObject);
	let img = new Image();
	img.onload = () => {
		callback(img.width, img.height);
		URL.revokeObjectURL(img.src);
	};
	img.src = url;
};

const fileToBase64 = file =>
	new Promise((resolve, reject) => {
		// from https://stackoverflow.com/a/57272491/2474159
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
	});

const sizeOfBase64 = base64Img => {
	// via https://stackoverflow.com/a/52903460/2474159
	let buffer = Buffer.from(base64Img.substring(base64Img.indexOf(',') + 1));
	let inKB = buffer.length / 1000;
	let inMB = buffer.length / 1e6;
	if (inMB > 1) {
		return Math.round(inMB * 100) / 100 + ' MB';
	}
	return inKB + ' KB';
};

// adds info to the error if known workarounds/fixes exist
const txErrorAugmentation = reason => {
	if (reason && reason.includes('No keyring found for the requested account')) {
		reason += ' (try removing and reinstalling MetaMask)';
	}
	// TODO more?
	return reason;
};

const findCampaignByName = (campaigns, name) => {
	let campaignObject = null;

	const keys = Object.keys(campaigns);

	for (let i = 0; i < keys.length; i++) {
		if (campaigns[keys[i]].name == name) {
			campaignObject = campaigns[keys[i]];
			break;
		}
	}
	return campaignObject;
};

const getTokensByCampaign = (tokens, campaign) => {
	const campaignTokens = campaign.allTokens;

	let result = {};

	for (let i = 0; i < campaignTokens.length; i++) {
		let thisToken = campaignTokens[i];
		result[thisToken] = tokens[thisToken];
	}
	return result;
};

const getCampaignsByStatus = campaigns => {
	const currentDate = new Date();
	const currentDateAndTime = currentDate.getTime();

	let keys = Object.keys(campaigns);
	let activeCampaignList = [];
	let previousCampaignList = [];

	for (let i = 0; i < keys.length; i++) {
		if (campaigns[keys[i]].campaignEndTime > currentDateAndTime) activeCampaignList.push(keys[i]);
		else previousCampaignList.push(keys[i]);
	}
	return [activeCampaignList, previousCampaignList];
};

export {
	buildIconLabelLink,
	buildIconLabelCallback,
	getFormattedSelectOptions,
	getRandomStringOfLength,
	getRandomTokenCreationDraftID,
	getRandomCampaignCreationDraftID,
	findVerifierTypeAddressByContractName,
	TCRactive,
	UnderlyingsActive,
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
	hasTheseCollaterals,
	Fin4Colors,
	translationMarkdown,
	isMobileDevice,
	getImageDimensions,
	fileToBase64,
	sizeOfBase64,
	txErrorAugmentation,
	findCampaignByName,
	getTokensByCampaign,
	getCampaignsByStatus
};
