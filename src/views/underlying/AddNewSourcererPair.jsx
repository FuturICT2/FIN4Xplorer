import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { findTokenBySymbol, isValidPublicAddress } from '../../components/Contractor.jsx';

function AddNewSourcererPair(props, context) {
	const { t } = useTranslation();

	const [patAddress, setPatAddress] = useState(null);

	useEffect(() => {
		let patToken = props.match.params.patToken; // symbol or address
		if (patToken && !patAddress) {
			let token = findTokenBySymbol(props, patToken);
			if (token) {
				setPatAddress(token.address);
			}
			if (isValidPublicAddress(patToken, false)) {
				setPatAddress(patToken);
			}
		}
	});

	return <Container></Container>;
}

AddNewSourcererPair.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(AddNewSourcererPair, mapStateToProps);
