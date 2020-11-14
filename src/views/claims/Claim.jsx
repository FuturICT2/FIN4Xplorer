import React, { useState, useRef, useEffect } from 'react';
import Container from '../../components/Container';
import Box from '../../components/Box';
import Button from '../../components/Button';
import { TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import Dropdown from '../../components/Dropdown';
import PreviousClaims from './PreviousClaims';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import { findTokenBySymbol, contractCall } from '../../components/Contractor.jsx';
import PropTypes from 'prop-types';
import { getFormattedSelectOptions } from '../../components/utils';

function Claim(props, context) {
	const { t } = useTranslation();

	const [selectedToken, setSelectedToken] = useState(null);
	const [unit, setUnit] = useState(t('quantity'));

	const [values, setValues] = useState({
		quantity: 1,
		comment: ''
	});

	const submitClaim = () => {
		if (values.tokenAddress === null) {
			alert('Token must be selected');
			return;
		}
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Claiming',
			'submitClaim',
			[values.tokenAddress, values.quantity, values.comment],
			'Claim token: ' + props.fin4Tokens[values.tokenAddress].symbol,
			{}
		);
	};

	useEffect(() => {
		let symbol = props.match.params.tokenSymbol;
		if (!selectedToken && Object.keys(props.fin4Tokens).length > 0 && symbol) {
			let token = findTokenBySymbol(props, symbol);
			if (token) {
				setSelectedToken(token);
				updateSelectedOption(token.address);
			} else {
				console.log(symbol + ' was passed as token-symbol via URL but does not match a known token');
			}
		}
	});

	const updateSelectedOption = tokenAddr => {
		let token = props.fin4Tokens[tokenAddr];
		setSelectedToken(token);
		setUnit(token.unit.length > 0 ? token.unit : t('claims.default-unit'));
	};

	const updateVal = (key, val) => {
		setValues({
			...values,
			[key]: val
		});
	};

	return (
		<Container>
			<div>
				<Box title={t('claims.claim-tokens-box-title')}>
					<Dropdown
						key="token-dropdown"
						onChange={e => updateSelectedOption(e.value)}
						options={getFormattedSelectOptions(props.fin4Tokens)}
						label={t('claims.tokens-dropdown')}
						defaultValue={
							selectedToken
								? {
										value: selectedToken.address,
										label: selectedToken.name,
										symbol: selectedToken.symbol
								  }
								: null
						}
					/>
					{selectedToken && !selectedToken.hasFixedMintingQuantity && (
						<TextField
							key="quantity-field"
							type="number"
							label={unit}
							value={values.quantity}
							onChange={e => updateVal('quantity', Number(e.target.value))}
							style={inputFieldStyle}
						/>
					)}
					<TextField
						key="comment-field"
						type="text"
						label={t('claims.comment')}
						value={values.comment}
						onChange={e => updateVal('comment', e.target.value)}
						style={inputFieldStyle}
					/>
					<Button icon={AddIcon} onClick={submitClaim} center="true">
						{t('claims.submit-button')}
					</Button>
				</Box>
			</div>
			<PreviousClaims />
		</Container>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

Claim.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(Claim, mapStateToProps);
