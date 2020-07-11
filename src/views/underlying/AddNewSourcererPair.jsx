import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { findTokenBySymbol, isValidPublicAddress, contractCall } from '../../components/Contractor.jsx';
import Box from '../../components/Box';
import Dropdown from '../../components/Dropdown';
import { TextField } from '@material-ui/core';
import Button from '../../components/Button';

function AddNewSourcererPair(props, context) {
	const { t } = useTranslation();

	const [data, setData] = useState({
		sourcererName: '',
		patAddress: '',
		collateralAddress: '',
		beneficiaryAddress: '',
		exchangeRatio: 1
	});

	useEffect(() => {
		let patToken = props.match.params.patToken; // symbol or address
		if (patToken && !data.patAddress) {
			let token = findTokenBySymbol(props, patToken);
			if (token) {
				updateData('patAddress', token.address);
			}
			if (isValidPublicAddress(patToken, false)) {
				updateData('patAddress', patToken);
			}
		}
	});

	const getSourcererNames = () => {
		return Object.keys(props.allUnderlyings)
			.filter(name => props.allUnderlyings[name].isSourcerer)
			.map(name => {
				return {
					value: name,
					label: name
				};
			});
	};

	const updateData = (name, value) => {
		setData({
			...data,
			[name]: value
		});
	};

	const submit = () => {
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			data.sourcererName,
			'setParameters',
			[data.patAddress, data.collateralAddress, data.beneficiaryAddress, data.exchangeRatio],
			'Adding new ' + data.sourcererName + '-sourcerer pair',
			{}
		);
	};

	return (
		<Container>
			<Box title={props.title}>
				<center>
					<Dropdown
						key="sourcerer-type-dropdown"
						onChange={e => updateData('sourcererName', e.value)}
						options={getSourcererNames()}
						label="Sourcerer type"
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
						key="beneficiary-field"
						type="text"
						label="Beneficiary"
						onChange={e => updateData('beneficiaryAddress', e.target.value)}
						style={inputFieldStyle}
						value={data.beneficiaryAddress}
					/>
					<TextField
						key="exchange-ratio-field"
						type="number"
						label="Exchange ratio"
						onChange={e => updateData('exchangeRatio', e.target.value)}
						style={inputFieldStyle}
						value={data.exchangeRatio}
					/>
					<br />
					<br />
					<Button onClick={submit}>Submit</Button>
					<br />
					<br />
				</center>
			</Box>
		</Container>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

AddNewSourcererPair.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		fin4Tokens: state.fin4Store.fin4Tokens,
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(AddNewSourcererPair, mapStateToProps);
