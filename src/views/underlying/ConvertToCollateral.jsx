import React, { useEffect } from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import PropTypes from 'prop-types';

function ConvertToCollateral(props, context) {
	const { t } = useTranslation();

	useEffect(() => {
		let patToken = props.match.params.patToken;
		let collateralToken = props.match.params.collateralToken;
		let amount = props.match.params.amount;
		// TODO
	});

	return (
		<Container>
			<Box title="Convert to collateral"></Box>
		</Container>
	);
}

UserTransfer.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts,
		fin4Tokens: state.fin4Store.fin4Tokens,
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(ConvertToCollateral, mapStateToProps);
