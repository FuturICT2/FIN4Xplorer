import React, { useState, useRef } from 'react';
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
const fileDownload = require('js-file-download');
const slugify = require('slugify');

function Token(props) {
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

	const importTokenAsDraft = () => {
		toggleTokenChooserVisible();
		if (chosenTokenAddress.current === null || !props.fin4Tokens[chosenTokenAddress.current]) {
			alert('Invalid or no token selected');
			return;
		}
		let templateToken = props.fin4Tokens[chosenTokenAddress.current];
		let nowTimestamp = moment().valueOf();
		props.dispatch({
			type: 'ADD_TOKEN_CREATION_DRAFT',
			draft: {
				id: getRandomTokenCreationDraftID(),
				created: nowTimestamp,
				lastModified: nowTimestamp,
				basics: {
					name: 'Copy of ' + templateToken.name,
					symbol: (templateToken.symbol.length < 5 ? templateToken.symbol : templateToken.symbol.substring(0, 4)) + '2',
					description: templateToken.description
				},
				properties: {},
				actions: {},
				value: {},
				proofs: {}
				// TODO copy more (all) the fields...
			},
			addToCookies: true
		});
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
				proofs: {},
				other: {},
				underlying: {}
			},
			addToCookies: true
		});
		history.push('/token/create/' + newDraftId);
	};

	return (
		<Container>
			<Box title={t('create-new-token')}>
				{buildIconLabelCallback(createNewTokenDraft, <AddIcon />, 'Start token creation wizard')}
				{buildIconLabelCallback(toggleUploadFileVisible, <ImportIcon />, 'Upload token draft (JSON)')}
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
				{buildIconLabelCallback(toggleTokenChooserVisible, <CopyIcon />, 'Copy an existing token')}
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
											label={t('token-type')}
										/>
									</td>
									<td>
										<Button style={{ paddingLeft: '20px' }} onClick={importTokenAsDraft}>
											Import
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
							<b>Your token creation drafts</b>
							{Object.keys(props.tokenCreationDrafts).length > 1 && (
								<>
									<small style={{ color: 'green', paddingLeft: '110px' }} onClick={() => deleteAllDrafts()}>
										Delete all
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
												{'Last modified: '}
												{date}
											</small>
											<br />
											<small style={{ color: 'green' }}>
												<span onClick={() => continueEditing(draftId)}>
													<b>Continue editing</b>
												</span>
												<span style={{ color: 'silver' }}> | </span>
												<span onClick={() => exportDraft(draftId)}>Download</span>
												<span style={{ color: 'silver' }}> | </span>
												<span onClick={() => deleteDraft(draftId)}>Delete</span>
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
					title="Token creation draft"
					width="400px">
					<SyntaxHighlighter language="json">{previewDraftStr.current}</SyntaxHighlighter>
				</Modal>
			</Box>
			<TokenOverview />
		</Container>
	);
}

const mapStateToProps = state => {
	return {
		fin4Tokens: state.fin4Store.fin4Tokens,
		tokenCreationDrafts: state.fin4Store.tokenCreationDrafts
	};
};

export default drizzleConnect(Token, mapStateToProps);
