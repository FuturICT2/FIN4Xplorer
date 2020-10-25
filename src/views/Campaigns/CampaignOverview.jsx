import React from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import SortableTokenList from '../../components/SortableTokenList';
import ActiveCampaignList from './ActiveCampaignList';

function CampaignOverview(props) {
	const { t } = useTranslation();

	return (
		<>
			<Box title={t('campaigns-list.all-campaigns-box-title')}>
				<ActiveCampaignList campaigns={Object.keys(props.fin4Campaigns).map(addr => props.fin4Campaigns[addr])} />
			</Box>
		</>
	);
}

const mapStateToProps = state => {
	return {
		fin4Campaigns: state.fin4Store.fin4Campaigns
	};
};

export default drizzleConnect(CampaignOverview, mapStateToProps);
