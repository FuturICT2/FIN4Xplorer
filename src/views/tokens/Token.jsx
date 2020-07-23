import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import TokenOverview from './TokenOverview';
import Box from '../../components/Box';
import {
	buildIconLabelCallback,
	getFormattedSelectOptions,
	getRandomTokenCreationDraftID
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

function Token(props, context) {
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
			importedDraft.id = getRandomTokenCreationDraftID(); // assign new ID to avoid duplicate IDs in store
			props.dispatch({
				type: 'ADD_TOKEN_CREATION_DRAFT',
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

			// TODO post-merge no more split into 1 and 2
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
				type: 'ADD_TOKEN_CREATION_DRAFT',
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
			type: 'DELETE_TOKEN_CREATION_DRAFT',
			draftId: draftId
		});
	};

	const continueEditing = draftId => {
		history.push('/token/create/' + draftId);
	};

	const createNewTokenDraft = () => {
		let nowTimestamp = moment().valueOf();
		let newDraftId = getRandomTokenCreationDraftID();
		props.dispatch({
			type: 'ADD_TOKEN_CREATION_DRAFT',
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
		history.push('/token/create/' + newDraftId);
	};

	return (
		<Container>
			<Box title={t('tokens-site.create-new-token')}>
				{buildIconLabelCallback(createNewTokenDraft, <AddIcon />, t('tokens-site.start-token-creation'))}
				{buildIconLabelCallback(toggleUploadFileVisible, <ImportIcon />, t('tokens-site.upload-token-draft'))}
				{uploadFileVisible && (
					<>
						<input
							style={{ paddingLeft: '45px' }}
							type="file"
							onChange={e => onSelectFile(e.target.files[0])}
							accept="application/json"
						/>
						<br />
						<br />
					</>
				)}
				{buildIconLabelCallback(toggleTokenChooserVisible, <CopyIcon />, t('tokens-site.copy-existing-token'))}
				{tokenChooserVisible && (
					<>
						{' '}
						{/*TODO something nicer more react/material-ui ish then <table>?*/}
						<table>
							<tbody>
								<tr>
									<td width="250px">
										<Dropdown
											key="token-chooser"
											onChange={e => (chosenTokenAddress.current = e.value)}
											options={getFormattedSelectOptions(props.fin4Tokens)}
										/>
									</td>
									<td>
										<Button style={{ paddingLeft: '20px' }} onClick={importTokenAsDraft}>
											{t('tokens-site.import-button')}
										</Button>
									</td>
								</tr>
							</tbody>
						</table>
						<br />
					</>
				)}
				{Object.keys(props.tokenCreationDrafts).length > 0 && (
					<>
						<br />
						<div style={{ fontFamily: 'arial' }}>
							<b>{t('tokens-site.drafts.title')}</b>
							{Object.keys(props.tokenCreationDrafts).length > 1 && (
								<>
									<small style={{ color: 'green', paddingLeft: '110px' }} onClick={() => deleteAllDrafts()}>
										{t('tokens-site.drafts.delete-all-button')}
									</small>
								</>
							)}
							<ul>
								{Object.keys(props.tokenCreationDrafts).map(draftId => {
									let draft = props.tokenCreationDrafts[draftId];
									let date = moment.unix(Number(draft.lastModified) / 1000).calendar();
									let name = draft.basics.name && draft.basics.name.length > 0 ? draft.basics.name : 'no-name-yet';
									let symbol = draft.basics.symbol && draft.basics.symbol.length > 0 ? draft.basics.symbol : null;
									return (
										<li key={draftId} style={{ paddingBottom: '10px' }}>
											<span onClick={() => previewDraft(draftId)} title="Click to see draft as JSON object">
												<Currency name={name} symbol={symbol} />
											</span>
											<br />
											<small style={{ color: 'gray' }}>
												{t('tokens-site.drafts.last-modified') + ': '}
												{date}
											</small>
											<br />
											<small style={{ color: 'green' }}>
												<span onClick={() => continueEditing(draftId)}>
													<b>{t('tokens-site.drafts.continue-editing-button')}</b>
												</span>
												<span style={{ color: 'silver' }}> | </span>
												<span onClick={() => exportDraft(draftId)}>{t('tokens-site.drafts.download-button')}</span>
												<span style={{ color: 'silver' }}> | </span>
												<span onClick={() => deleteDraft(draftId)}>{t('tokens-site.drafts.delete-button')}</span>
											</small>
											<br />
										</li>
									);
								})}
							</ul>
						</div>
					</>
				)}
				<Modal
					isOpen={isPreviewDraftModalOpen}
					handleClose={togglePreviewDraftModalOpen}
					title={t('tokens-site.drafts.modal-title')}
					width="400px">
					<SyntaxHighlighter language="json">{previewDraftStr.current}</SyntaxHighlighter>
				</Modal>
			</Box>
			<TokenOverview />
		</Container>
	);
}

Token.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts,
		defaultAccount: state.fin4Store.defaultAccount,
		fin4Tokens: state.fin4Store.fin4Tokens,
		tokenCreationDrafts: state.fin4Store.tokenCreationDrafts,
		verifierTypes: state.fin4Store.verifierTypes
	};
};

export default drizzleConnect(Token, mapStateToProps);
