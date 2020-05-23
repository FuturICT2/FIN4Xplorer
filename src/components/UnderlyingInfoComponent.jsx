import React from 'react';
import { useTranslation } from 'react-i18next';
import { drizzleConnect } from 'drizzle-react';

function UnderlyingInfoComponent(props) {
	const { t } = useTranslation();

	return <></>;
}

const mapStateToProps = state => {
	return {
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(UnderlyingInfoComponent, mapStateToProps);
