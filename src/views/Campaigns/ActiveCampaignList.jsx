import React, { useState, useEffect } from 'react';
import history from '../../components/history';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { createUseStyles } from 'react-jss';
import { red } from '@material-ui/core/colors';

const ActiveCampaignList = props => {
	const classes = useStyles(props);

	const [campaigns, setCampaigns] = useState([]);

	useEffect(() => {
		if (campaigns.length != props.campaigns.length) {
			setCampaigns(props.campaigns);
		}
	});

	return (
		<div>
			<list>
				{props.campaigns.map(campaign => {
					return (
						<List>
							<ListItem
								key={campaign.address}
								onClick={() => history.push('/campaigns/DetailedCampaignView/' + campaign.name)}
								style={{ maxHeight: '100%', overflow: 'auto' }}
								className={classes.listItem}>
								{campaign.name}
							</ListItem>
						</List>
					);
				})}
			</list>
		</div>
	);
};

const useStyles = createUseStyles({
	listItem: {
		fontFamily: 'arial',
		'&:hover': {
			backgroundColor: '#E8E8E8',
			cursor: 'pointer'
		}
	}
});

export default ActiveCampaignList;
