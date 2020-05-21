import React, { useState, useEffect, useRef } from 'react';
import Box from '../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../components/Container';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Cookies from 'js-cookie';
import { Divider } from '@material-ui/core';
import AddressDisplayWithCopy from '../components/AddressDisplayWithCopy';

const useStyles = makeStyles(theme => ({
	font: {
		'font-family': 'arial'
	},
	lngLink: {
		'text-decoration': 'none'
	},
	activeLng: {
		'font-weight': 'bold'
	}
}));

function Settings(props, context) {
	const { t, i18n } = useTranslation();

	const classes = useStyles();

	const langIsEN = () => {
		return i18n.language === 'en';
	};

	return (
		<Container>
			<Box title="Settings">
				<div className={classes.font}>
					Language:{' '}
					<a
						className={`${classes.lngLink} ${langIsEN() ? classes.activeLng : ''}`}
						href="#"
						onClick={() => {
							let lng = i18n.language;
							i18n.changeLanguage('en', () => {
								console.log('Language changed: from ' + lng + ' to en');
								Cookies.set('language', 'en', { expires: 7 });
								// TODO is 7 a good expiry date for cookies? #ConceptualDecision
							});
						}}>
						EN
					</a>
					{' / '}
					<a
						className={`${classes.lngLink} ${!langIsEN() ? classes.activeLng : ''}`}
						href="#"
						onClick={() => {
							let lng = i18n.language;
							i18n.changeLanguage('de', () => {
								console.log('Language changed: from ' + lng + ' to de');
								Cookies.set('language', 'de', { expires: 7 });
							});
						}}>
						DE
					</a>
					<br />
					<br />
					<small>We use cookies to store language preferences and token creation drafts.</small>
				</div>
			</Box>
			<Box title="System parameters">
				<div className={classes.font}>
					Address of the Fin4Main smart contract:
					<br />
					{props.contracts.Fin4Main && props.contracts.Fin4Main.initialized && context.drizzle.contracts.Fin4Main ? (
						<AddressDisplayWithCopy address={context.drizzle.contracts.Fin4Main.address} />
					) : (
						'Loading...'
					)}
				</div>
			</Box>
			<Box title="Verifier type addresses">
				<div style={{ fontFamily: 'arial' }}>
					{Object.keys(props.verifierTypes).map((addr, index) => {
						let verifierType = props.verifierTypes[addr];
						let name = verifierType.label;
						let address = verifierType.value;
						return (
							<span key={'verifier_' + index}>
								{name}
								<br />
								<AddressDisplayWithCopy address={address} />
								<br />
								{verifierType.paramsEncoded && (
									<small style={{ color: 'gray' }}>
										<b>Parameters</b>: {verifierType.paramsEncoded}
									</small>
								)}
								{verifierType.isNoninteractive && (
									<small style={{ color: 'orange' }}>
										<br />
										<b>is constraint</b>
									</small>
								)}
								{index < Object.keys(props.verifierTypes).length - 1 && (
									<Divider style={{ margin: '10px 0' }} variant="middle" />
								)}
							</span>
						);
					})}
				</div>
			</Box>
			<Box title="Fin4 Sourcerer">
				<div style={{ fontFamily: 'arial' }}>
					{Object.keys(props.allUnderlyings)
						.filter(name => props.allUnderlyings[name].isSourcerer)
						.map((name, index) => {
							let underlyingObj = props.allUnderlyings[name];
							return (
								<span key={'underlying_' + index}>
									{underlyingObj.name}
									<br />
									{underlyingObj.contractAddress && (
										<>
											<AddressDisplayWithCopy address={underlyingObj.contractAddress} />
											<br />
										</>
									)}
									{underlyingObj.paramsEncoded && (
										<small style={{ color: 'gray' }}>
											<b>Parameters</b>: {underlyingObj.paramsEncoded}
										</small>
									)}
									{index < Object.keys(props.allUnderlyings).length - 1 && (
										<Divider style={{ margin: '10px 0' }} variant="middle" />
									)}
								</span>
							);
						})}
				</div>
			</Box>
		</Container>
	);
}

Settings.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts,
		verifierTypes: state.fin4Store.verifierTypes,
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(Settings, mapStateToProps);
