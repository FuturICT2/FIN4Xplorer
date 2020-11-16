import React, { useState, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { Link } from 'react-router-dom';
import Box from '../../components/Box';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import Currency from '../../components/Currency';
import { findCampaignByName } from '../../components/utils';
import { contractCall, getContractData } from '../../components/Contractor.jsx';
import PropTypes from 'prop-types';

import { Container, ListItemText, Button } from '@material-ui/core';

const DetailedCampaignView = (props, context) => {
	const [campaignViaURL, setCampaignViaURL] = useState(null);
	const [claimsPerToken, setClaimsPerToken] = useState([]);
	const [claimsTotal, setClaimsTotal] = useState(null);

	const getClaimsFromCampaign = () => {
		if (campaignViaURL) {
			let contract = context.drizzle.contracts['CampaignManagement'];
			getContractData(
				contract,
				props.store.getState().fin4Store.defaultAccount,
				'getCampaignTokensClaimed',
				campaignViaURL.address
			).then(({ 0: amounts, 1: sum }) => {
				setClaimsPerToken(amounts);
				setClaimsTotal(sum);
			});
		}
	};

	useEffect(() => {
		const campaignName = props.match.params.campaignName;
		let campaignObject = findCampaignByName(props.fin4Campaigns, campaignName);
		setCampaignViaURL(campaignObject);

		getClaimsFromCampaign();
	});

	if (campaignViaURL == null || Object.keys(props.fin4Tokens).length === 0) {
		return <CircularProgress />;
	} else {
		const startDate = new Date(parseInt(campaignViaURL.campaignStartTime, 10)).toLocaleString();
		const endDate = new Date(parseInt(campaignViaURL.campaignEndTime, 10)).toLocaleString();
		const currentDate = new Date();
		const currentDateAndTime = currentDate.getTime();

		return (
			<Container>
				<Box title="Campaign Details" width="100%">
					<Table aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>Name:</TableCell>
								<TableCell align="right">{campaignViaURL.name}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Address:</TableCell>
								<TableCell align="right">{campaignViaURL.address}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Action Policy:</TableCell>
								<TableCell>{campaignViaURL.text}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Campaign starts from:</TableCell>
								<TableCell align="right">{startDate}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Campaign ends on:</TableCell>
								<TableCell align="right">{endDate}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Token(s) included:</TableCell>
								<TableCell align="right">
									{campaignViaURL.allTokens.map((token, index) => {
										return (
											<>
												<ListItemText>
													{props.fin4Tokens[token].name} <Currency symbol={props.fin4Tokens[token].symbol} />
												</ListItemText>
												<ListItemText>Tokens Claimed: {claimsPerToken[index]}</ListItemText>
											</>
										);
									})}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>Success Threshold:</TableCell>
								<TableCell align="right">{campaignViaURL.successThreshold}</TableCell>
							</TableRow>
							{campaignViaURL.campaignEndTime > currentDateAndTime ? (
								<TableRow>
									<TableCell>Is campaign sucessful yet?:</TableCell>
									{claimsTotal >= campaignViaURL.successThreshold ? (
										<TableCell align="right">
											<Alert variant="outlined" severity="success">
												Campaign succesful
											</Alert>
										</TableCell>
									) : (
										<TableCell align="right">
											<Alert variant="outlined" severity="error">
												Campaign unsuccesful
											</Alert>
										</TableCell>
									)}
								</TableRow>
							) : (
								<TableRow>
									<TableCell>Result of campaign:</TableCell>
									{claimsTotal >= campaignViaURL.successThreshold ? (
										<TableCell align="right">
											<Alert severity="success">Campaign succesful</Alert>
										</TableCell>
									) : (
										<TableCell align="right">
											<Alert severity="success">Campaign unsuccesful</Alert>
										</TableCell>
									)}
								</TableRow>
							)}
							<TableRow>
								<TableCell>Maximum claim each contributor can make:</TableCell>
								<TableCell align="right">{campaignViaURL.claimPerCampaignContributor}</TableCell>
							</TableRow>
						</TableHead>
					</Table>
					{campaignViaURL.campaignEndTime > currentDateAndTime ? (
						<Button variant="contained">
							<Link to={'/campaign/claim/' + campaignViaURL.name}>Make a claim</Link>
						</Button>
					) : (
						<Alert severity="warning">This campaign has already ended!</Alert>
					)}
				</Box>
			</Container>
		);
	}
};

DetailedCampaignView.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		fin4Campaigns: state.fin4Store.fin4Campaigns,
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(DetailedCampaignView, mapStateToProps);
