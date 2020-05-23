import React, { useEffect, useState, useRef } from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { findTokenBySymbol, isValidPublicAddress, addContract } from '../../components/Contractor.jsx';
import Button from '../../components/Button';
import { TextField } from '@material-ui/core';

function CollateralInteractionComponent(props, context) {
	const { t } = useTranslation();

	const [data, setData] = useState({
		sourcererType: '',
		patAddress: '',
		collateralAddress: '',
		amount: ''
	});

	const waitingForContract = useRef(null);

	const addTokenAddress = (type, symbOrAddr) => {
		// try symbol first to see if it exists, then convert to address
		let token = findTokenBySymbol(props, symbOrAddr);
		if (token) {
			updateData(type, token.address);
		}
		if (isValidPublicAddress(symbOrAddr, false)) {
			updateData(type, symbOrAddr);
		}
	};

	useEffect(() => {
		let sourcererType = props.matchParams.sourcererType; // must be the exact contract name
		let patToken = props.matchParams.patToken; // Fin4-token-symbol or address
		let collateralToken = props.matchParams.collateralToken; // Fin4-token-symbol or address
		let amount = props.matchParams.amount;

		if (sourcererType && !data.sourcererType) {
			updateData('sourcererType', sourcererType);
		}

		if (patToken && !data.patAddress) {
			addTokenAddress('patAddress', patToken);
		}

		if (collateralToken && !data.collateralAddress) {
			addTokenAddress('collateralAddress', collateralToken);
		}

		if (amount && !data.amount) {
			updateData('amount', amount);
		}

		if (waitingForContract.current && contractReady(waitingForContract.current)) {
			props.buttonClickedAndContractReadyCallback(data, waitingForContract.current);
			waitingForContract.current = null;
		}
	});

	const contractReady = name => {
		return props.contracts[name] && props.contracts[name].initialized;
	};

	const buttonClicked = () => {
		let contractAddressToGetReady = data[props.contractToGetReady];
		let token = props.fin4Tokens[contractAddressToGetReady]; // if this exists, its a Fin4 token, otherwise its external
		let tokenNameSuffixed = 'ERC20Token_' + (token ? token.symbol : contractAddressToGetReady);
		if (contractReady(tokenNameSuffixed)) {
			props.buttonClickedAndContractReadyCallback(data, waitingForContract.current);
		} else {
			waitingForContract.current = tokenNameSuffixed;
			addContract(props, context.drizzle, 'ERC20', contractAddressToGetReady, [], tokenNameSuffixed);
		}
	};

	const updateData = (name, value) => {
		setData({
			...data,
			[name]: value
		});
	};

	// TODO use https://sanusart.github.io/react-dropdown-select/ for making a dropdown with the possibility to add new options?
	return (
		<Box title={props.title}>
			<center>
				<TextField
					key="sourcerer-type-field"
					type="text"
					label="Sourcerer Type"
					onChange={e => updateData('sourcererType', e.target.value)}
					style={inputFieldStyle}
					value={data.sourcererType}
				/>
				<TextField
					key="pat-address-field"
					type="text"
					label="PAT address"
					onChange={e => updateData('patAddress', e.target.value)}
					style={inputFieldStyle}
					value={data.patAddress}
				/>
				<TextField
					key="collateral-address-field"
					type="text"
					label="Collateral address"
					onChange={e => updateData('collateralAddress', e.target.value)}
					style={inputFieldStyle}
					value={data.collateralAddress}
				/>
				<TextField
					key="amount-field"
					type="number"
					label="Amount"
					onChange={e => updateData('amount', e.target.value)}
					style={inputFieldStyle}
					value={data.amount}
				/>
				<br />
				<br />
				<Button onClick={buttonClicked}>{props.buttonLabel}</Button>
				<br />
				<br />
			</center>
		</Box>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

CollateralInteractionComponent.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts,
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(CollateralInteractionComponent, mapStateToProps);
