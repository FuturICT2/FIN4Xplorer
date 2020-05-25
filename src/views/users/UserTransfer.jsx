import React, { useState, useEffect, useRef } from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import PropTypes from 'prop-types';
import {
	findTokenBySymbol,
	getFin4TokensFormattedForSelectOptions,
	addContract
} from '../../components/Contractor.jsx';
import AddressQRreader from '../../components/AddressQRreader';
import Dropdown from '../../components/Dropdown';
import { TextField } from '@material-ui/core';
import Button from '../../components/Button';
import { isValidPublicAddress, contractCall } from '../../components/Contractor';

function UserTransfer(props, context) {
	const { t } = useTranslation();

	const [dataViaURL, setDataViaURL] = useState({
		tokenTriple: null, // formatted for DropdownSelect
		userAddress: null,
		amount: null
	});

	const data = useRef({
		// via editing
		tokenAddress: null,
		userAddress: null,
		amount: null
	});

	const waitingForContract = useRef(null);

	useEffect(() => {
		let userAddress = props.match.params.userAddress;
		let tokenSymbol = props.match.params.tokenSymbol;
		let transferAmount = props.match.params.transferAmount;

		if (userAddress && !dataViaURL.userAddress) {
			setDataViaURL({
				...dataViaURL,
				userAddress: userAddress
			});
			data.current.userAddress = userAddress;
		}

		if (tokenSymbol && !dataViaURL.tokenTriple) {
			let token = findTokenBySymbol(props, tokenSymbol);
			if (token) {
				setDataViaURL({
					...dataViaURL,
					tokenTriple: {
						value: token.address,
						label: token.name,
						symbol: token.symbol
					}
				});
				data.current.tokenAddress = token.address;
			}
		}

		if (transferAmount && !dataViaURL.amount) {
			setDataViaURL({
				...dataViaURL,
				amount: transferAmount
			});
			data.current.amount = transferAmount;
		}

		if (waitingForContract.current && contractReady(waitingForContract.current)) {
			doSendTransfer(waitingForContract.current);
			waitingForContract.current = null;
		}
	});

	const contractReady = name => {
		return props.contracts[name] && props.contracts[name].initialized;
	};

	const sendTransfer = () => {
		let token = props.fin4Tokens[data.current.tokenAddress];
		let tokenNameSuffixed = 'ERC20Token_' + token.symbol;
		if (contractReady(tokenNameSuffixed)) {
			doSendTransfer(tokenNameSuffixed);
		} else {
			waitingForContract.current = tokenNameSuffixed;
			addContract(props, context.drizzle, 'ERC20', data.current.tokenAddress, [], tokenNameSuffixed);
		}
	};

	const doSendTransfer = tokenName => {
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			tokenName,
			'transfer',
			[data.current.userAddress, data.current.amount],
			'Transfer token to user'
		);
	};

	return (
		<Container>
			<Box title="Transfer tokens to user">
				<center>
					<AddressQRreader
						initialValue={dataViaURL.userAddress}
						onChange={val => (data.current.userAddress = val)}
						label="Public address of token-receiver"
					/>
					<Dropdown
						key="token-dropdown"
						onChange={e => (data.current.tokenAddress = e.value)}
						options={getFin4TokensFormattedForSelectOptions(props.fin4Tokens)}
						label={t('token-type')}
						defaultValue={dataViaURL.tokenTriple}
					/>
					<TextField
						key="amount-field"
						type="number"
						label="Amount"
						onChange={e => (data.current.amount = e.target.value)}
						style={inputFieldStyle}
						defaultValue={dataViaURL.amount}
					/>
					<br />
					<br />
					<Button
						onClick={() => {
							if (!isValidPublicAddress(data.current.userAddress)) {
								alert('Invalid Ethereum public address');
								return;
							}
							if (!props.fin4Tokens[data.current.tokenAddress]) {
								alert('No token selected');
								return;
							}
							if (data.current.amount <= 0) {
								alert('Amount to transfer must bigger than 0');
								return;
							}

							// TODO check if user has enough balance on that token

							sendTransfer();
						}}>
						Send
					</Button>
				</center>
			</Box>
		</Container>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

UserTransfer.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts,
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(UserTransfer, mapStateToProps);
