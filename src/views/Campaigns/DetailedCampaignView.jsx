import React, { useState, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import Box from '../../components/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Container, ListItemText } from '@material-ui/core';
import moment from 'moment';

const DetailedCampaignView = props => {
	const [campaignViaURL, setCampaignViaURL] = useState(null);

	useEffect(() => {
		const campaignName = props.match.params.campaignName;

		let campaignObject = null;

		const keys = Object.keys(props.fin4Campaigns);

		for (let i = 0; i < keys.length; i++) {
			if (props.fin4Campaigns[keys[i]].name == campaignName) {
				campaignObject = props.fin4Campaigns[keys[i]];
				break;
			}
		}
		setCampaignViaURL(campaignObject);
	});

	if (campaignViaURL == null) {
		return <div>Error</div>;
	} else {
		const startDate = new Date(parseInt(campaignViaURL.campaignStartTime, 10)).toLocaleString();
		const endDate = new Date(parseInt(campaignViaURL.campaignEndTime, 10)).toLocaleString();

		return (
			<Container>
				<Box title="Campaign Details">
					<List>
						<ListItemText>Name: {campaignViaURL.name}</ListItemText>
						<ListItemText>Address: {campaignViaURL.address}</ListItemText>
						<ListItemText>Action Policy: {campaignViaURL.text}</ListItemText>
						<ListItemText>Campaign starts from: {startDate}</ListItemText>
						<ListItemText>Campaign ends on: {endDate}</ListItemText>
						<ListItemText>Token(s) included: {campaignViaURL.allTokens}</ListItemText>
						<ListItemText>Success Threshold: {campaignViaURL.successThreshold}</ListItemText>
						<ListItemText>
							Maximum claim each contributor can make: {campaignViaURL.claimPerCampaignContributor}
						</ListItemText>
					</List>
				</Box>
			</Container>
		);
	}
};

const mapStateToProps = state => {
	return {
		fin4Campaigns: state.fin4Store.fin4Campaigns
	};
};

export default drizzleConnect(DetailedCampaignView, mapStateToProps);
