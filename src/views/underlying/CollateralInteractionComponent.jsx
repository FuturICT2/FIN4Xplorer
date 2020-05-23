import React, { useEffect, useState } from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { findTokenBySymbol } from '../../components/Contractor.jsx';

function CollateralInteractionComponent(props, context) {
	const { t } = useTranslation();

	const [data, setData] = useState({
		patToken: null, // formatted for Dropdown
		collateral: null, // formatted for Dropdown
		amount: null
	});

	const addTokenIfExists = (type, symbOrAddr) => {
		// try symbol first, then address - if still undefined it wasn't a valid URL param for a token
		// or the token is not a Fin4 token, but has to be supported nonetheless (e.g. a pTokens or tBTC token)
		let token = findTokenBySymbol(props, symbOrAddr) || props.fin4Tokens[symbOrAddr];
		if (token) {
			updateData(type, {
				value: token.address,
				label: token.name,
				symbol: token.symbol
			});
		}
	};

	useEffect(() => {
		let patToken = props.matchParams.patToken;
		let collateralToken = props.matchParams.collateralToken;
		let amount = props.matchParams.amount;

		if (patToken && !data.patToken) {
			addTokenIfExists('patToken', patToken);
		}

		if (collateralToken && !data.collateralToken) {
			addTokenIfExists('patToken', collateralToken);
		}

		if (amount && !data.amount) {
			updateData('amount', amount);
		}
	});

	const updateData = (name, value) => {
		setData({
			...data,
			[name]: value
		});
	};

	return <Box title={props.title}></Box>;
}

CollateralInteractionComponent.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts,
		fin4Tokens: state.fin4Store.fin4Tokens,
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(CollateralInteractionComponent, mapStateToProps);
