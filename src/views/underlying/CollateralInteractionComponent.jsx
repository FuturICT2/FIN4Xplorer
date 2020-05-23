import React, { useEffect, useState } from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function CollateralInteractionComponent(props, context) {
	const { t } = useTranslation();

	const [data, setData] = useState({
		patToken: null, // formatted for Dropdown
		collateral: null, // formatted for Dropdown
		amount: null
	});

	useEffect(() => {
		// let patToken = props.match.params.patToken;
		// let collateralToken = props.match.params.collateralToken;
		// let amount = props.match.params.amount;
	});

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
