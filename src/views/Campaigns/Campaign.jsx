import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import TokenOverview from '../tokens/TokenOverview';
import CampaignOverview from './CampaignOverview';
import PreviousCampaigns from './PreviousCampaigns';
import Box from '../../components/Box';
import {
	buildIconLabelCallback,
	getFormattedSelectOptions,
	getRandomTokenCreationDraftID,
	getRandomCampaignCreationDraftID
} from '../../components/utils';
import AddIcon from '@material-ui/icons/AddBox';
import ImportIcon from '@material-ui/icons/ImportExport';
import CopyIcon from '@material-ui/icons/FileCopy';
import moment from 'moment';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import SyntaxHighlighter from 'react-syntax-highlighter';
import history from '../../components/history';
import Currency from '../../components/Currency';
import { addContract, fetchTokenDetails } from '../../components/Contractor';
import PropTypes from 'prop-types';
const fileDownload = require('js-file-download');
const slugify = require('slugify');

function Campaign(props, context) {
	const { t } = useTranslation();

	/* {
		"name": "Test Token",
		"symbol": "TTO",
		"created": "1573390378626",
		"lastModified": "1573390378626"
	} */
	const [uploadFileVisible, setUploadFileVisible] = useState(false);
	const toggleUploadFileVisible = () => {
		setUploadFileVisible(!uploadFileVisible);
	};

	const onSelectFile = file => {
		toggleUploadFileVisible();
		let reader = new window.FileReader();
		reader.readAsText(file);
		reader.onloadend = () => {
			let importedDraft = JSON.parse(reader.result);
			// TODO sanity checks before adding?
			importedDraft.importedId = importedDraft.id;
			importedDraft.id = getRandomCampaignCreationDraftID(); // assign new ID to avoid duplicate IDs in store
			props.dispatch({
				type: 'ADD_CAMPAIGN_CREATION_DRAFT',
				draft: importedDraft,
				addToCookies: true
			});
		};
	};

	const [tokenChooserVisible, setTokenChooserVisible] = useState(false);
	const toggleTokenChooserVisible = () => {
		setTokenChooserVisible(!tokenChooserVisible);
	};
	const chosenTokenAddress = useRef(null);

	const contractReady = name => {
		return props.contracts[name] && props.contracts[name].initialized;
	};

	const initiateWhenContractReady = useRef(null); // tokenNameSuffixed if not null

	useEffect(() => {
		if (initiateWhenContractReady.current && contractReady(initiateWhenContractReady.current)) {
			initiateWhenContractReady.current = null;
			fetchTokenDetailsAndDispatchNewDraft();
		}
	});

	const fetchTokenDetailsAndDispatchNewDraft = () => {
		let templateToken = props.fin4Tokens[chosenTokenAddress.current];
		let tokenNameSuffixed = 'Fin4Token_' + templateToken.symbol;

		fetchTokenDetails(context.drizzle.contracts[tokenNameSuffixed], props.defaultAccount).then(details => {
			let nowTimestamp = moment().valueOf();

			// expects Fin4Claiming to be the last in this array if it is included, order determined in TokenCreationProcess.createToken()
			let minterRoles = details.addressesWithMinterRoles;
			let Fin4ClaimingHasMinterRole =
				minterRoles[minterRoles.length - 1] === context.drizzle.contracts.Fin4Claiming.address;
			if (Fin4ClaimingHasMinterRole) {
				minterRoles.pop();
			}

			let verifiers = details.requiredVerifierTypes.map(addr => props.verifierTypes[addr]);
			let emptyVerifierBody = { parameters: {} };
			let verifiers1 = {};
			verifiers.filter(v => v.isNoninteractive).map(v => (verifiers1[v.contractName] = emptyVerifierBody));
			let verifiers2 = {};
			verifiers.filter(v => !v.isNoninteractive).map(v => (verifiers2[v.contractName] = emptyVerifierBody));

			let draft = {
				id: getRandomTokenCreationDraftID(),
				created: nowTimestamp,
				lastModified: nowTimestamp,
				basics: {
					name: 'Copy of ' + templateToken.name,
					symbol:
						(templateToken.symbol.length === 5 ? templateToken.symbol.substring(0, 4) : templateToken.symbol) + '2',
					description: templateToken.description
				},
				properties: {
					isTransferable: details.isTransferable,
					isBurnable: details.isBurnable,
					isCapped: details.isCapped,
					cap: Number(details.cap),
					decimals: Number(details.decimals),
					initialSupply: Number(details.initialSupply),
					initialSupplyOwner:
						details.initialSupplyOwner === details.tokenCreator ? 'token-creator' : details.initialSupplyOwner
				},
				actions: {
					text: details.actionsText
				},
				minting: {
					isMintable: details.isMintable,
					Fin4ClaimingHasMinterRole: Fin4ClaimingHasMinterRole,
					additionalMinterRoles: minterRoles,
					fixedAmount: Number(details.fixedAmount),
					unit: templateToken.unit
				},
				noninteractiveVerifiers: verifiers1,
				interactiveVerifiers: verifiers2,
				sourcererPairs: [], // TODO
				externalUnderlyings: [] // TODO
			};

			props.dispatch({
				type: 'ADD_CAMPAIGN_CREATION_DRAFT',
				draft: draft,
				addToCookies: true
			});
		});
	};

	const importTokenAsDraft = () => {
		toggleTokenChooserVisible();
		if (chosenTokenAddress.current === null || !props.fin4Tokens[chosenTokenAddress.current]) {
			alert('Invalid or no token selected');
			return;
		}
		let templateToken = props.fin4Tokens[chosenTokenAddress.current];
		let tokenNameSuffixed = 'Fin4Token_' + templateToken.symbol;
		if (contractReady(tokenNameSuffixed)) {
			fetchTokenDetailsAndDispatchNewDraft();
		} else {
			addContract(props, context.drizzle, 'Fin4Token', templateToken.address, [], tokenNameSuffixed);
			initiateWhenContractReady.current = tokenNameSuffixed;
		}
	};

	const exportDraft = draftId => {
		let draft = props.tokenCreationDrafts[draftId];
		let name = 'TokenCreationDraft_';
		if (draft.name && draft.name.length > 0) {
			name += slugify(draft.name);
		} else if (draft.symbol && draft.symbol.length > 0) {
			name += slugify(draft.symbol);
		} else {
			name += draftId;
		}
		fileDownload(JSON.stringify(draft, null, 4), name + '.json');
	};

	const [isPreviewDraftModalOpen, setPreviewDraftModalOpen] = useState(false);
	const togglePreviewDraftModalOpen = () => {
		setPreviewDraftModalOpen(!isPreviewDraftModalOpen);
	};
	const previewDraftStr = useRef('');

	const previewDraft = draftId => {
		let draft = props.tokenCreationDrafts[draftId];
		previewDraftStr.current = JSON.stringify(draft, null, 2);
		togglePreviewDraftModalOpen();
	};

	const deleteAllDrafts = () => {
		for (var draftId in props.tokenCreationDrafts) {
			if (props.tokenCreationDrafts.hasOwnProperty(draftId)) {
				deleteDraft(draftId);
			}
		}
	};

	const deleteDraft = draftId => {
		props.dispatch({
			type: 'DELETE_CAMPAIGN_CREATION_DRAFT',
			draftId: draftId
		});
	};

	const continueEditing = draftId => {
		history.push('/token/create/' + draftId);
	};

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
				<Modal
					isOpen={isPreviewDraftModalOpen}
					handleClose={togglePreviewDraftModalOpen}
					title={t('tokens-site.drafts.modal-title')}
					width="400px">
					<SyntaxHighlighter language="json">{previewDraftStr.current}</SyntaxHighlighter>
				</Modal>
			</Box>
			{/* <TokenOverview /> */}
			<CampaignOverview />
			<PreviousCampaigns />
		</Container>
	);
}

Campaign.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts,
		defaultAccount: state.fin4Store.defaultAccount,
		fin4Tokens: state.fin4Store.fin4Tokens,
		campaignCreationDrafts: state.fin4Store.campaignCreationDrafts,
		verifierTypes: state.fin4Store.verifierTypes
	};
};

export default drizzleConnect(Campaign, mapStateToProps);
