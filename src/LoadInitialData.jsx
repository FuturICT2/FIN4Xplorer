import React, { useEffect, useRef } from 'react';
import { drizzleConnect } from 'drizzle-react';
import {
	addSatelliteContracts,
	addTCRcontracts,
	fetchMessages,
	fetchAllTokens,
	fetchAllCampaigns,
	fetchUsersNonzeroTokenBalances,
	fetchCurrentUsersClaims,
	fetchAndAddAllVerifierTypes,
	fetchAllSubmissions,
	fetchCollectionsInfo,
	fetchOPATs,
	fetchSystemParameters,
	fetchUsersGOVbalance,
	fetchUsersREPbalance,
	fetchParameterizerParams,
	fetchAndAddAllUnderlyings
} from './components/Contractor';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import { TCRactive, UnderlyingsActive } from './components/utils';
import { useTranslation } from 'react-i18next';
import { subscribeToContractEvents } from './middleware/ContractEventHandler';

function LoadInitialData(props, context) {
	const { t } = useTranslation();

	const isInit = useRef({
		// "once" flags
		subscribedToContractEvents: false,
		Fin4Main: false,
		Fin4TokenManagement: false,
		CampaignManagement: false,
		Fin4Messaging: false,
		Fin4Claiming: false,
		Fin4Collections: false,
		Fin4Verifying: false,
		Registry: false,
		Parameterizer: false,
		Fin4SystemParameters: false,
		Fin4Underlyings: false,
		REP: false,
		GOV: false,
		tokenCreationDraftsLoaded: false // from cookies to store
	});

	useEffect(() => {
		if (!props.drizzleInitialized || !window.web3) {
			return; // we don't move a muscle until that is done
		}

		if (!isInit.current.subscribedToContractEvents) {
			isInit.current.subscribedToContractEvents = true;
			subscribeToContractEvents(props.store);
		}

		if (!isInit.current.Fin4Main && props.contracts.Fin4Main.initialized) {
			isInit.current.Fin4Main = true;
			// can happen in parallel once Fin4Main is ready:
			addSatelliteContracts(props, context.drizzle.contracts.Fin4Main, context.drizzle);
			if (TCRactive) {
				addTCRcontracts(props, context.drizzle.contracts.Fin4Main, context.drizzle);
			}
		}

		if (!isInit.current.Registry && props.contracts.Registry && props.contracts.Registry.initialized) {
			isInit.current.Registry = true;
		}

		if (
			TCRactive &&
			!isInit.current.Parameterizer &&
			props.contracts.Parameterizer &&
			props.contracts.Parameterizer.initialized
		) {
			isInit.current.Parameterizer = true;
			fetchParameterizerParams(props, context.drizzle.contracts.Parameterizer);
		}

		if (!isInit.current.GOV && props.contracts.GOV && props.contracts.GOV.initialized) {
			isInit.current.GOV = true;
			fetchUsersGOVbalance(props, context.drizzle.contracts.GOV);
		}

		if (!isInit.current.REP && props.contracts.REP && props.contracts.REP.initialized) {
			isInit.current.REP = true;
			fetchUsersREPbalance(props, context.drizzle.contracts.REP);
		}

		if (
			!isInit.current.Fin4SystemParameters &&
			props.contracts.Fin4SystemParameters &&
			props.contracts.Fin4SystemParameters.initialized
		) {
			isInit.current.Fin4SystemParameters = true;
			fetchSystemParameters(props, context.drizzle.contracts.Fin4SystemParameters);
		}

		if (
			!isInit.current.Fin4TokenManagement &&
			props.contracts.Fin4TokenManagement &&
			props.contracts.Fin4TokenManagement.initialized &&
			(isInit.current.Registry || !TCRactive) &&
			(isInit.current.Fin4Underlyings || !UnderlyingsActive) &&
			isInit.current.Fin4Claiming
		) {
			isInit.current.Fin4TokenManagement = true;
			let Fin4TokenManagementContract = context.drizzle.contracts.Fin4TokenManagement;
			let Fin4UnderlyingsContract = UnderlyingsActive ? context.drizzle.contracts.Fin4Underlyings : null;
			let Fin4ClaimingContract = context.drizzle.contracts.Fin4Claiming;
			fetchAllTokens(props, Fin4TokenManagementContract, Fin4UnderlyingsContract, Fin4ClaimingContract, () => {
				// TODO also do these in fetchAllTokens or in parallel to it? Like Fin4Underlyings was added in via promises
				if (TCRactive) {
					fetchOPATs(props, context.drizzle.contracts.Registry);
				}
				fetchUsersNonzeroTokenBalances(props, Fin4TokenManagementContract);
			});
		}

		if (
			!isInit.current.CampaignManagement &&
			props.contracts.CampaignManagement &&
			props.contracts.CampaignManagement.initialized
		) {
			isInit.current.CampaignManagement = true;
			fetchAllCampaigns(props, context.drizzle.contracts.CampaignManagement);
		}

		if (!isInit.current.Fin4Messaging && props.contracts.Fin4Messaging && props.contracts.Fin4Messaging.initialized) {
			isInit.current.Fin4Messaging = true;
			fetchMessages(props, context.drizzle.contracts.Fin4Messaging);
		}

		if (
			!isInit.current.Fin4Collections &&
			props.contracts.Fin4Collections &&
			props.contracts.Fin4Collections.initialized
		) {
			isInit.current.Fin4Collections = true;
			fetchCollectionsInfo(props, context.drizzle.contracts.Fin4Collections);
		}

		if (!isInit.current.Fin4Claiming && props.contracts.Fin4Claiming && props.contracts.Fin4Claiming.initialized) {
			isInit.current.Fin4Claiming = true;
			fetchCurrentUsersClaims(props, context.drizzle.contracts.Fin4Claiming);
		}

		if (!isInit.current.Fin4Verifying && props.contracts.Fin4Verifying && props.contracts.Fin4Verifying.initialized) {
			isInit.current.Fin4Verifying = true;
			fetchAndAddAllVerifierTypes(props, context.drizzle.contracts.Fin4Verifying, context.drizzle, t);
			fetchAllSubmissions(props, context.drizzle.contracts.Fin4Verifying);
		}

		if (
			UnderlyingsActive &&
			!isInit.current.Fin4Underlyings &&
			props.contracts.Fin4Underlyings &&
			props.contracts.Fin4Underlyings.initialized
		) {
			isInit.current.Fin4Underlyings = true;
			fetchAndAddAllUnderlyings(props, context.drizzle.contracts.Fin4Underlyings, context.drizzle);
		}

		if (!isInit.current.tokenCreationDraftsLoaded) {
			isInit.current.tokenCreationDraftsLoaded = true;
			loadTokenCreationDraftsFromCookieToStore();
		}
	});

	const loadTokenCreationDraftsFromCookieToStore = () => {
		let allCookies = Cookies.get();
		Object.keys(allCookies)
			.filter(key => key.startsWith('TokenCreationDraft'))
			.map(key => {
				props.dispatch({
					type: 'ADD_TOKEN_CREATION_DRAFT',
					draft: JSON.parse(allCookies[key]),
					addToCookies: false
				});
			});
	};

	return null;
}

LoadInitialData.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts,
		drizzleInitialized: state.fin4Store.drizzleInitialized
	};
};

export default drizzleConnect(LoadInitialData, mapStateToProps);
