import React, { useEffect } from 'react';
import Box from '../components/Box';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Container from '../components/Container';

function TransactionLog(props, context) {
	const { t } = useTranslation();

	return (
		<Container>
			<Box title="Transaction log">TODO</Box>
		</Container>
	);
}

TransactionLog.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		defaultAccount: state.fin4Store.defaultAccount,
		transactions: state.fin4Store.transactions
	};
};

export default drizzleConnect(TransactionLog, mapStateToProps);
