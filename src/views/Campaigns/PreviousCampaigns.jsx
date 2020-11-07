import React from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import SortableTokenList from '../../components/SortableTokenList';
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
				{/* <SortableTokenList
					tokens={Object.keys(props.fin4Tokens).map(addr => props.fin4Tokens[addr])}
					showFilterAndSortOptions={false}
				/> */}
			</Box>
		</>
	);
}

const mapStateToProps = state => {
	return {
		fin4Campaigns: state.fin4Store.fin4Campaigns,
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(PreviousCampaigns, mapStateToProps);
