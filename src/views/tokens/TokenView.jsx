import React, { useState, useEffect, useRef } from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import Currency from '../../components/Currency';
import { getContractData, findTokenBySymbol, addContract, fetchTokenDetails } from '../../components/Contractor';
import SourcererPairInfoComponent from '../../components/SourcererPairInfoComponent';
import UnderlyingInfoComponent from '../../components/UnderlyingInfoComponent';
import PropTypes from 'prop-types';
import { Divider } from '@material-ui/core';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { isCollateralFor, hasTheseCollaterals } from '../../components/utils';
import AddressDisplayWithCopy from '../../components/AddressDisplayWithCopy';

function TokenView(props, context) {
	const { t } = useTranslation();

	const [tokenViaURL, setTokenViaURL] = useState(null);
	const [details, setDetails] = useState(null);
	const [verifierTypesLoaded, setVerifierTypesLoaded] = useState(false);

	const fetchDetailedTokenInfo = () => {
		fetchTokenDetails(context.drizzle.contracts['Fin4Token_' + tokenViaURL.symbol], props.defaultAccount).then(obj =>
			setDetails(obj)
		);
	};

	const getVerifierTypesStr = () => {
		let str = '';
		for (let i = 0; i < details.requiredVerifierTypes.length; i++) {
			str += props.verifierTypes[details.requiredVerifierTypes[i]].label + ', ';
		}
		return str.substring(0, str.length - 2);
	};

	const contractReady = name => {
		return props.contracts[name] && props.contracts[name].initialized;
	};

	const detailsFetchingInitiated = useRef(false);

	useEffect(() => {
		let symbol = props.match.params.tokenSymbol;
		if (!tokenViaURL && Object.keys(props.fin4Tokens).length > 0 && symbol) {
			// best approach to avoid duplicate and get timing right?
			let token = findTokenBySymbol(props, symbol);
			if (token) {
				setTokenViaURL(token);
				let tokenNameSuffixed = 'Fin4Token_' + token.symbol;
				if (!contractReady(tokenNameSuffixed)) {
					addContract(props, context.drizzle, 'Fin4Token', token.address, [], tokenNameSuffixed);
				}
			}
		}

		if (!detailsFetchingInitiated.current && tokenViaURL && contractReady('Fin4Token_' + tokenViaURL.symbol)) {
			detailsFetchingInitiated.current = true;
			fetchDetailedTokenInfo();
		}

		// TODO is there no other way? seems awkward
		if (!verifierTypesLoaded && Object.keys(props.verifierTypes).length > 0) {
			setVerifierTypesLoaded(true);
		}
	});

	const buildInfoLine = (label, value) => {
		return (
			<p>
				<span style={{ color: 'gray' }}>
					{label}:{value ? '' : ' -'}
				</span>{' '}
				{value}
			</p>
		);
	};

	const buildCheckboxWithLabel = (label, checked) => {
		return (
			<>
				<FormControlLabel control={<Checkbox checked={checked} disabled={true} />} label={label} />
				<br />
			</>
		);
	};

	// TODO move to utils and use that here and in TokenSubmission
	const getSubmissionsOnToken = () => {
		if (!tokenViaURL) {
			return [];
		}
		return Object.keys(props.submissions)
			.map(subId => props.submissions[subId])
			.filter(sub => sub.token === tokenViaURL.address);
	};

	const buildSourcererInfos = () => {
		let isCollateralForArr = isCollateralFor(tokenViaURL.address, props.sourcererPairs);
		let hasTheseCollateralsArr = hasTheseCollaterals(tokenViaURL.address, props.sourcererPairs);
		if (isCollateralForArr.length === 0 && hasTheseCollateralsArr === 0) {
			return '';
		}

		return (
			<>
				{isCollateralForArr.length > 0 && (
					<>
						<Divider style={{ margin: '10px 0' }} variant="middle" />
						<span style={{ color: 'gray' }}>Is collateral for:</span>
						{isCollateralForArr.map((pair, index) => {
							return <SourcererPairInfoComponent key={'is-collateral-for_' + index} pair={pair} />;
						})}
					</>
				)}
				{hasTheseCollateralsArr.length > 0 && (
					<>
						<Divider style={{ margin: '10px 0' }} variant="middle" />
						<span style={{ color: 'gray' }}>Has these collaterals:</span>
						{hasTheseCollateralsArr.map((pair, index) => {
							return <SourcererPairInfoComponent key={'has-these-collaterals_' + index} pair={pair} />;
						})}
					</>
				)}
			</>
		);
	};

	const buildExternalUnderlyingsInfos = () => {
		// map from objects to array and filter out sourcerer underlyings
		let underlyings = Object.keys(props.allUnderlyings)
			.filter(name => !props.allUnderlyings[name].isSourcerer)
			.filter(name => tokenViaURL.underlyings.includes(name))
			.map(name => props.allUnderlyings[name]);
		return (
			<>
				{underlyings.length > 0 && (
					<>
						<Divider style={{ margin: '10px 0' }} variant="middle" />
						<span style={{ color: 'gray' }}>Has these external sources of values:</span>
						{underlyings.map((underlying, index) => {
							return <UnderlyingInfoComponent key={'external-underlying_' + index} underlying={underlying} />;
						})}
					</>
				)}
			</>
		);
	};

	const getSubmissionPageKeyword = contentType => {
		switch (Number(contentType)) {
			case 0:
				return 'text';
			case 1:
				return 'picture';
			case 2:
				return 'vote';
		}
	};

	return (
		<Container>
			<Box>
				{!tokenViaURL ? (
					props.match.params.tokenSymbol ? (
						<span style={{ fontFamily: 'arial' }}>
							No token with symbol <b>{props.match.params.tokenSymbol}</b> found
						</span>
					) : (
						<span style={{ fontFamily: 'arial' }}>No token-symbol passed via URL</span>
					)
				) : (
					<span style={{ fontFamily: 'arial' }}>
						<center>
							<Currency symbol={tokenViaURL.symbol} name={<b>{tokenViaURL.name}</b>} />
							<br />
							<AddressDisplayWithCopy address={tokenViaURL.address} />
						</center>
						<br />
						{getSubmissionsOnToken().length > 0 && (
							// TODO make visible with 0 submissions too?
							// Requires passing that info through back/frontend differently though
							<p>
								<span style={{ color: 'gray' }}>Submissions: </span>
								<Link
									to={
										'/token/submissions/' +
										tokenViaURL.symbol + // weird to just look at [0]
										'/' +
										getSubmissionPageKeyword(getSubmissionsOnToken()[0].contentType)
									}>
									open {getSubmissionPageKeyword(getSubmissionsOnToken()[0].contentType)} collage
								</Link>
							</p>
						)}
						{buildInfoLine('Short description', tokenViaURL.description.split('||')[0])}
						{buildInfoLine('Long description', tokenViaURL.description.split('||')[1])}
						{!details ? (
							<span style={{ fontFamily: 'arial' }}>Loading details...</span>
						) : (
							<span style={{ fontFamily: 'arial' }}>
								<Divider style={{ margin: '10px 0' }} variant="middle" />

								{buildInfoLine('Created', details.tokenCreationTime)}
								{buildInfoLine('Verifier types', verifierTypesLoaded ? getVerifierTypesStr() : 'Loading...')}
								{buildInfoLine('Total number of claims', details.claimsCount)}
								{buildInfoLine('Total supply', details.totalSupply)}

								<Divider style={{ margin: '10px 0' }} variant="middle" />

								{buildCheckboxWithLabel('is transferable', details.isTransferable)}
								{buildCheckboxWithLabel('is mintable', details.isMintable)}
								{buildCheckboxWithLabel('is burnable', details.isBurnable)}
								{buildCheckboxWithLabel('is capped', details.isCapped)}

								<Divider style={{ margin: '10px 0' }} variant="middle" />

								{details.isCapped && buildInfoLine('Cap', details.cap)}
								{buildInfoLine('Decimals', details.decimals)}
								{buildInfoLine('Initial supply', details.initialSupply)}

								<Divider style={{ margin: '10px 0' }} variant="middle" />

								{Number(details.fixedAmount) === 0
									? buildInfoLine('Variable minting amount set by user')
									: buildInfoLine('Fixed minting quantity per claim', details.fixedAmount)}
								{buildInfoLine('Unit of measurement', tokenViaURL.unit)}
								{buildInfoLine('Claimable actions', details.actionsText)}
							</span>
						)}
					</span>
				)}
			</Box>
			<Box title="Token Profile">
				{!details ? (
					<span style={{ fontFamily: 'arial' }}>Loading your profile...</span>
				) : (
					<span style={{ fontFamily: 'arial' }}>
						{buildInfoLine('Your balance', details.usersBalance)}
						<Divider style={{ margin: '10px 0' }} variant="middle" />
						<span style={{ color: 'gray' }}>Token actions: </span>
						<Link to={'/claim/' + tokenViaURL.symbol}>Claim</Link>
						{', '}
						<Link to={'/user/transfer/' + tokenViaURL.symbol}>Transfer</Link>
						{buildSourcererInfos()}
						{buildExternalUnderlyingsInfos()}
					</span>
				)}
			</Box>
		</Container>
	);
}

TokenView.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts,
		defaultAccount: state.fin4Store.defaultAccount,
		fin4Tokens: state.fin4Store.fin4Tokens,
		submissions: state.fin4Store.submissions,
		verifierTypes: state.fin4Store.verifierTypes,
		sourcererPairs: state.fin4Store.sourcererPairs,
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(TokenView, mapStateToProps);
