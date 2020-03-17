import React, { useEffect } from 'react';
import Box from '../components/Box';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Container from '../components/Container';
import { Divider } from '@material-ui/core';
import moment from 'moment';

function TransactionLog(props, context) {
	const { t } = useTranslation();

	return (
		<Container>
			<Box title="Transaction log">
				<div style={{ fontFamily: 'arial' }}>
					{props.transactions.map((tx, index) => {
						return (
							<span key={'tx_' + index}>
								{tx.displayStr && (
									<>
										<b>{tx.displayStr}</b>:{' ' + tx.methodStr}
										<br />
									</>
								)}
								<small>
									<span style={{ color: 'green' }}>{tx.status}</span>
									<span style={{ color: 'gray', marginLeft: '5px' }}>
										{moment.unix(tx.timestamp / 1000).calendar()}
									</span>
								</small>
								{tx.txHash && (
									<>
										<br />
										<a
											style={{ fontSize: 'xx-small' }}
											href={'https://rinkeby.etherscan.io/tx/' + tx.txHash}
											target="_blank">
											{tx.txHash}
										</a>
									</>
								)}
								<br />
								{index < props.transactions.length - 1 && <Divider style={{ margin: '10px 0' }} variant="middle" />}
							</span>
						);
					})}
				</div>
			</Box>
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
