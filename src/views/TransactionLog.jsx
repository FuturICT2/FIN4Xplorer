import React, { useEffect } from 'react';
import Box from '../components/Box';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Container from '../components/Container';
import { Divider } from '@material-ui/core';
import moment from 'moment';
import { getEtherscanTxURL } from '../components/utils';

function TransactionLog(props, context) {
	const { t } = useTranslation();

	return (
		<Container>
			<Box title={t('transaction-log.box-title')}>
				<div style={{ fontFamily: 'arial' }}>
					<center style={{ color: 'gray' }}>{t('transaction-log.reload-hint')}</center>
					<br />
					<br />
					{props.transactions.reverse().map((tx, index) => {
						return (
							<span key={'tx_' + index} style={{ wordWrap: 'break-word' }}>
								{tx.displayStr && (
									<>
										<b>{tx.displayStr}</b>
										<br />
										<small>{tx.methodStr}</small>
										<br />
									</>
								)}
								<small>
									<span style={{ color: 'orange' }}>{tx.status}</span>
									<span style={{ color: 'gray', marginLeft: '5px' }}>
										{moment.unix(tx.timestamp / 1000).calendar()}
									</span>
								</small>
								{tx.err && (
									<>
										<br />
										<span style={{ color: 'red' }}>{tx.err}</span>
									</>
								)}
								{tx.txHash && (
									<>
										<br />
										<a style={{ fontSize: 'xx-small' }} href={getEtherscanTxURL(tx.txHash)} target="_blank">
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
