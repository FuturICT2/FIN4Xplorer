import React, { useState } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Currency from './Currency';
import Box from './Box';
import Table from './Table';
import TableRow from './TableRow';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';
import SendIcon from '@material-ui/icons/Send'; // or Forward
import { Link } from 'react-router-dom';

function TokenBalances(props, context) {
	const { t } = useTranslation();

	const [isModalOpen, setModalOpen] = useState(false);

	const toggleModal = () => {
		setModalOpen(!isModalOpen);
	};

	const noBalanceYet = balances => {
		for (var addr in balances) {
			if (balances.hasOwnProperty(addr)) {
				if (balances[addr] > 0) {
					return false;
				}
			}
		}
		return true;
	};

	const buildGovernanceTokenBalance = (contract, name, symbol, tdStyle = null) => {
		let balance = props.usersFin4GovernanceTokenBalances[contract.address];
		if (balance === 0) {
			return;
		}
		return (
			<TableRow
				key={'balance_' + name}
				data={{
					name: (
						<>
							<span>
								<Currency symbol={symbol} name={name} />
							</span>
							<FontAwesomeIcon icon={faInfoCircle} style={styles.infoIcon} onClick={toggleModal} />
						</>
					),
					balance: balance,
					transfer: null
				}}
				tdStyle={tdStyle}
			/>
		);
	};

	const getTokenAddressesSortedByBalance = () => {
		return Object.keys(props.usersFin4TokenBalances).sort((a, b) => {
			return props.usersFin4TokenBalances[b] - props.usersFin4TokenBalances[a];
		});
	};

	return (
		<Box title="Wallet">
			{' '}
			{/*t('your-token-balances')}*/}
			{noBalanceYet(props.usersFin4TokenBalances) && noBalanceYet(props.usersFin4GovernanceTokenBalances) ? (
				<NoTokens>{t('no-tokens-yet')}</NoTokens>
			) : (
				<Table headers={[t('token-name'), t('token-balance'), 'Transfer']} colWidths={[70, 15, 15]}>
					{props.contracts.GOV &&
						props.contracts.GOV.initialized &&
						buildGovernanceTokenBalance(context.drizzle.contracts.GOV, 'Fin4 Governance Token', 'GOV')}
					{props.contracts.REP &&
						props.contracts.REP.initialized &&
						buildGovernanceTokenBalance(context.drizzle.contracts.REP, 'Fin4 Reputation Token', 'REP', {
							borderBottom: '2px dotted silver'
						})}
					{getTokenAddressesSortedByBalance().map((tokenAddr, index) => {
						let token = props.fin4Tokens[tokenAddr];
						return (
							<TableRow
								key={'balance_' + index}
								data={{
									name: (
										<span title={'Description: ' + token.description + '\nUnit:' + token.unit}>
											<Currency symbol={token.symbol} name={token.name} linkTo={'/token/view/' + token.symbol} />
										</span>
									),
									balance: props.usersFin4TokenBalances[tokenAddr],
									transfer: (
										<Link to={'/user/transfer/' + token.symbol}>
											<SendIcon style={{ width: '17px' }} />
										</Link>
									)
								}}
							/>
						);
					})}
				</Table>
			)}
			<Modal isOpen={isModalOpen} handleClose={toggleModal} title="Governance tokens" width="350px">
				<div style={{ fontFamily: 'arial' }}>
					You can earn <b>Reputation Tokens (REP)</b> by being active here on the plattform:
					<br />
					<small>
						- Creating a token yields {props.systemParameters['REPforTokenCreation']} REP
						<br />- Succesfully claiming a token yields {props.systemParameters['REPforTokenClaim']} REP
						<br />- <i>More rewards for constructive activity will follow...</i>
					</small>
					<br />
					<br />
					As soon as you have{' '}
					{props.parameterizerParams['pminReputation'] ? props.parameterizerParams['pminReputation'].value : '?'} or
					more REP, you can claim the same amount of <b>Governance Tokens (GOV)</b> and participate in governance. If
					your GOV falls below your REP amount, you can claim GOV again - always up to the level of REP.
					<br />
					<small>
						To propose a token to be added to the list of curated tokens you need at least{' '}
						{props.parameterizerParams['minDeposit'] && props.parameterizerParams['reviewTax']
							? props.parameterizerParams['minDeposit'].value + props.parameterizerParams['reviewTax'].value
							: '?'}{' '}
						GOV tokens.
					</small>
				</div>
			</Modal>
		</Box>
	);
}

const styles = {
	infoIcon: {
		color: 'silver',
		width: '16px',
		height: '16px',
		paddingLeft: '5px'
	}
};

const NoTokens = styled.div`
	font-family: arial;
	text-align: center;
	color: silver;
`;

TokenBalances.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		usersFin4TokenBalances: state.fin4Store.usersFin4TokenBalances,
		usersFin4GovernanceTokenBalances: state.fin4Store.usersFin4GovernanceTokenBalances,
		fin4Tokens: state.fin4Store.fin4Tokens,
		contracts: state.contracts,
		systemParameters: state.fin4Store.systemParameters,
		parameterizerParams: state.fin4Store.parameterizerParams
	};
};

export default drizzleConnect(TokenBalances, mapStateToProps);
