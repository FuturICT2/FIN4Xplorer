import React, { useState, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { findCampaignByName } from '../../components/utils';
import Container from '../../components/Container';
import Box from '../../components/Box';
import Button from '../../components/Button';
import { TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import Dropdown from '../../components/Dropdown';
import { useTranslation } from 'react-i18next';
import { contractCall } from '../../components/Contractor.jsx';
import PropTypes from 'prop-types';
import { getFormattedSelectOptions, getTokensByCampaign } from '../../components/utils';

const CampaignClaimView = (props, context) => {
	const { t } = useTranslation();

	const [campaignViaURL, setCampaignViaURL] = useState(null);
	const [unit, setUnit] = useState(t('quantity'));
	const [selectedToken, setSelectedToken] = useState(null);

	const [values, setValues] = useState({
		tokenAddress: null,
		quantity: 1,
		comment: ''
	});

	// TO-DO: Check maximum number of claims each user can make

	const submitClaim = () => {
		if (values.tokenAddress === null) {
			alert('Token must be selected');
			return;
		}
		// TODO this doesn't support claims with an upfront fee yet, compare Claim.jsx
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
		let campaignName = props.match.params.campaignName;
		if (Object.keys(props.fin4Tokens).length > 0 && campaignName) {
			let campaign = findCampaignByName(props.fin4Campaigns, campaignName);
			if (campaign) {
				setCampaignViaURL(campaign);
			} else {
				console.log('Campaign not found');
			}
		}
	});

	const updateSelectedOption = tokenAddr => {
		updateVal('tokenAddress', tokenAddr);
		let unit = props.fin4Tokens[tokenAddr].unit;
		setUnit(unit.length > 0 ? unit : t('claims.default-unit'));
		setSelectedToken(props.fin4Tokens[tokenAddr]);
	};

	const updateVal = (key, val) => {
		setValues({
			...values,
			[key]: val
		});
	};

	if (campaignViaURL == null) {
		return <center><div style={{ fontFamily: 'arial' }}>Campaign not found</div></center>;
	} else {
		return (
			<Container>
				<div>
					<Box title={t('Claim tokens in a campaign')}>
						<Dropdown
							key="token-dropdown"
							onChange={e => updateSelectedOption(e.value)}
							options={getFormattedSelectOptions(getTokensByCampaign(props.fin4Tokens, campaignViaURL))}
							label={t('claims.tokens-dropdown')}
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
			</Container>
		);
	}
};

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

CampaignClaimView.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		fin4Campaigns: state.fin4Store.fin4Campaigns,
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(CampaignClaimView, mapStateToProps);
