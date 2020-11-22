import React from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import CampaignOverview from './CampaignOverview';
import PreviousCampaigns from './PreviousCampaigns';
import Box from '../../components/Box';
import {
	buildIconLabelCallback,
	getRandomCampaignCreationDraftID
} from '../../components/utils';
import AddIcon from '@material-ui/icons/AddBox';
import moment from 'moment';
import history from '../../components/history';

function Campaign(props) {
	const { t } = useTranslation();

	const createNewCampaignDraft = () => {
		let nowTimestamp = moment().valueOf();
		let newDraftId = getRandomCampaignCreationDraftID();
		props.dispatch({
			type: 'ADD_CAMPAIGN_CREATION_DRAFT',
			draft: {
				id: newDraftId,
				created: nowTimestamp,
				lastModified: nowTimestamp,
				basics: {},
				properties: {},
				actions: {},
				minting: {},
				noninteractiveVerifiers: {},
				interactiveVerifiers: {},
				sourcererPairs: [],
				externalUnderlyings: []
			},
			addToCookies: true
		});
		history.push('/campaigns/create/' + newDraftId);
	};

	return (
		<Container>
			<Box title={t('campaigns.create-new-campaign')}>
				{buildIconLabelCallback(createNewCampaignDraft, <AddIcon />, t('campaigns.start-campaign-creation'))}
			</Box>
			<CampaignOverview />
			<PreviousCampaigns />
		</Container>
	);
}

const mapStateToProps = state => {
	return {};
};

export default drizzleConnect(Campaign, mapStateToProps);
