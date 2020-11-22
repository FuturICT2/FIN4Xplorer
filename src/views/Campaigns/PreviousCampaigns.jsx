import React from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import { getCampaignsByStatus } from '../../components/utils';
import ActiveCampaignList from './ActiveCampaignList';

function PreviousCampaigns(props) {
	const { t } = useTranslation();

	let sortedCampaigns = getCampaignsByStatus(props.fin4Campaigns);
	let previousCampaignKeys = sortedCampaigns[1];

	return (
		<>
			<Box title={t('campaigns-list.all-prev-campaigns')}>
				<ActiveCampaignList campaigns={previousCampaignKeys.map(addr => props.fin4Campaigns[addr])} />
			</Box>
		</>
	);
}

const mapStateToProps = state => {
	return {
		fin4Campaigns: state.fin4Store.fin4Campaigns
	};
};

export default drizzleConnect(PreviousCampaigns, mapStateToProps);
