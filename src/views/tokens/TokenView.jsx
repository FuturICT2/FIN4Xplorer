import React, { useState, useEffect, useRef } from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import Currency from '../../components/Currency';
import {
	findTokenBySymbol,
	addContract,
	fetchTokenDetails,
	downloadClaimHistoryOnToken,
	getContractData
} from '../../components/Contractor';
import SourcererPairInfoComponent from '../../components/SourcererPairInfoComponent';
import UnderlyingInfoComponent from '../../components/UnderlyingInfoComponent';
import PropTypes from 'prop-types';
import { Divider } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { isCollateralFor, hasTheseCollaterals } from '../../components/utils';
import AddressDisplayWithCopy from '../../components/AddressDisplayWithCopy';
import Tooltip from '@material-ui/core/Tooltip';

function TokenView(props, context) {
	const { t } = useTranslation();

	const [tokenViaURL, setTokenViaURL] = useState(null);
	const [details, setDetails] = useState(null);
	const [verifierTypesLoaded, setVerifierTypesLoaded] = useState(false);

	const fetchDetailedTokenInfo = () => {
		fetchTokenDetails(context.drizzle.contracts['Fin4Token_' + tokenViaURL.symbol], props.defaultAccount).then(data => {
			getContractData(
				context.drizzle.contracts.Fin4Underlyings,
				props.defaultAccount,
				'getSourcererSettings',
				tokenViaURL.address
			).then(({ 0: allowAddPairsAfterCreation, 1: allowCollateralPairsCreatedByOthers }) => {
				data.allowAddPairsAfterCreation = allowAddPairsAfterCreation;
				data.allowCollateralPairsCreatedByOthers = allowCollateralPairsCreatedByOthers;
				setDetails(data);
			});
		});
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

	const buildTooltipInfoLine = (label, value, tooltipText) => {
		return <Tooltip title={tooltipText}>{buildInfoLine(label, value)}</Tooltip>;
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
				return t('token-view.collage.text');
			case 1:
				return t('token-view.collage.picture');
			case 2:
				return t('token-view.collage.vote');
		}
	};

	const getFormattedMinterRole = address => {
		switch (address) {
			case context.drizzle.contracts.Fin4Claiming.address:
				return <small>Fin4Claiming contract</small>;
			case context.drizzle.contracts.MintingSourcerer.address:
				return <small>MintingSourcerer contract</small>;
			default:
				return <AddressDisplayWithCopy address={address} fontSize={'x-small'} />;
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
								<span style={{ color: 'gray' }}>{t('token-view.submissions') + ': '}</span>
								<Link
									to={
										'/token/submissions/' +
										tokenViaURL.symbol + // weird to just look at [0]
										'/' +
										getSubmissionPageKeyword(getSubmissionsOnToken()[0].contentType)
									}>
									{t('token-view.collage.link-title', {
										collageType: getSubmissionPageKeyword(getSubmissionsOnToken()[0].contentType)
									})}
								</Link>
							</p>
						)}
						{buildInfoLine(
							t('token-creator.step1-identity.fields.short-description.label'),
							tokenViaURL.description.split('||')[0]
						)}
						{buildInfoLine(
							t('token-creator.step1-identity.fields.long-description.label'),
							tokenViaURL.description.split('||')[1]
						)}
						{!details ? (
							<span style={{ fontFamily: 'arial' }}>Loading details...</span>
						) : (
							<span style={{ fontFamily: 'arial' }}>
								<Divider style={{ margin: '10px 0' }} variant="middle" />

								{buildInfoLine(t('token-view.creation-time'), details.tokenCreationTime)}
								{buildInfoLine(
									t('token-view.token-creator'),
									<AddressDisplayWithCopy address={details.tokenCreator} fontSize={'x-small'} />
								)}
								{buildInfoLine(
									t('token-view.verifier-types'),
									verifierTypesLoaded ? getVerifierTypesStr() : 'Loading...'
								)}
								{buildInfoLine(t('token-view.total-numb-of-claims'), details.claimsCount)}
								{buildInfoLine(t('token-view.total-supply'), details.totalSupply)}

								<Divider style={{ margin: '10px 0' }} variant="middle" />

								{buildCheckboxWithLabel(
									t('token-creator.step2-design.fields.is-transferable.label'),
									details.isTransferable
								)}
								{buildCheckboxWithLabel(t('token-view.is-mintable'), details.isMintable)}
								{buildCheckboxWithLabel(t('token-creator.step2-design.fields.is-burnable.label'), details.isBurnable)}
								{buildCheckboxWithLabel(t('token-creator.step2-design.fields.is-capped.label'), details.isCapped)}

								<Divider style={{ margin: '10px 0' }} variant="middle" />

								{details.isCapped && buildInfoLine(t('token-creator.step2-design.fields.cap.label'), details.cap)}
								{buildInfoLine(t('token-creator.step2-design.fields.decimals.label'), details.decimals)}
								{buildInfoLine(t('token-creator.step2-design.fields.initial-supply.label'), details.initialSupply)}
								{Number(details.initialSupply) > 0 &&
									buildInfoLine(
										t('token-view.initial-supply-owner'),
										<>
											<br />
											&nbsp;&nbsp;&nbsp;&nbsp;
											{details.initialSupplyOwner === details.tokenCreator ? (
												<small>{t('token-view.token-creator')}</small>
											) : (
												<AddressDisplayWithCopy address={details.initialSupplyOwner} fontSize={'x-small'} />
											)}
										</>
									)}
								{details.addressesWithMinterRoles.length > 0 &&
									buildInfoLine(
										t('token-view.minter-role-owners'),
										details.addressesWithMinterRoles.map((addr, index) => (
											<span key={'minterRole_' + index}>
												<br />
												&nbsp;&nbsp;&nbsp;&nbsp;
												{getFormattedMinterRole(addr)}
											</span>
										))
									)}

								<Divider style={{ margin: '10px 0' }} variant="middle" />

								{Number(details.fixedAmount) === 0
									? buildInfoLine(t('token-view.variable-minting'))
									: buildInfoLine(t('token-view.fixed-minting'), details.fixedAmount)}
								{buildInfoLine(t('token-creator.step4-minting.fields.unit.label'), tokenViaURL.unit)}
								{buildInfoLine(t('token-view.claimable-actions'), details.actionsText)}
								{/* TODO source these from translation files */
									tokenViaURL.feeAmountPerClaimInETH && 
										<>
											{buildInfoLine('Action fee', tokenViaURL.feeAmountPerClaimInETH + ' ETH')}
											{buildInfoLine('Action fee beneficiary', 
												tokenViaURL.feeBeneficiary === details.tokenCreator ? 'token creator' :
												<AddressDisplayWithCopy address={tokenViaURL.feeBeneficiary} fontSize={'x-small'} />
											)}
										</>
								}

								<Divider style={{ margin: '10px 0' }} variant="middle" />

								{buildTooltipInfoLine(
									t('token-view.allow-add-pairs-after-creation.title'),
									details.allowAddPairsAfterCreation.toString(),
									t('token-view.allow-add-pairs-after-creation.tooltip')
								)}
								{buildTooltipInfoLine(
									t('token-view.allow-collateral-pairs-created-by-others.title'),
									details.allowCollateralPairsCreatedByOthers.toString(),
									t('token-view.allow-collateral-pairs-created-by-others.tooltip')
								)}
							</span>
						)}
					</span>
				)}
			</Box>
			<Box title={t('token-view.box-title')}>
				{!details ? (
					<span style={{ fontFamily: 'arial' }}>Loading your profile...</span>
				) : (
					<span style={{ fontFamily: 'arial' }}>
						{buildInfoLine(t('home.on-the-blockchain.users-balance'), details.usersBalance)}
						<Divider style={{ margin: '10px 0' }} variant="middle" />

						<table>
							<tbody>
								<tr>
									<td>
										<span style={{ color: 'gray', marginRight: '10px' }}>{t('token-view.token-actions') + ':'}</span>
									</td>
									<td>
										<Link to={'/claim/' + tokenViaURL.symbol}>{t('tokens-list.claim-button')}</Link>
										<br />
										<Link to={'/user/transfer/' + tokenViaURL.symbol}>{t('home.wallet.transfer-token')}</Link>
										<br />
										<Link to="#" onClick={() => downloadClaimHistoryOnToken(props, tokenViaURL.symbol, context)}>
											{t('token-view.download-claims')}
										</Link>
										{details && details.allowAddPairsAfterCreation && details.tokenCreator === props.defaultAccount && (
											<>
												<br />
												<Link to={'/sourcerer/new-pair/' + tokenViaURL.symbol}>
													{t('token-view.add-sourcerer-pair')}
												</Link>
											</>
										)}
									</td>
								</tr>
							</tbody>
						</table>
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
