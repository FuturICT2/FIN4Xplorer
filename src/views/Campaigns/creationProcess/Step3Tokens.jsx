import React, { useState, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ListIcon from '@material-ui/icons/List';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import Currency from '../../../components/Currency';

function StepToken(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [showTokenList, setShowTokenList] = useState(false);
	const [tokens, setTokens] = useState({
		allTokens: []
	});

	useEffect(() => {
		if (draftId || !props.draft) {
			return;
		}
		let draft = props.draft;
		setTokens({
			allTokens: draft.tokens.hasOwnProperty('allTokens') ? draft.tokens['allTokens'] : []
		});
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_CAMPAIGN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'tokens',
			node: {
				allTokens: tokens.allTokens
			}
		});
		props.handleNext();
	};

	// Select token(s) that will be part of campaign

	const updateSelectedTokenList = event => {
		if (event.target.checked) {
			tokens.allTokens.push(event.target.name);
		} else {
			let i = tokens.allTokens.indexOf(event.target.name);
			if (i >= 0) {
				tokens.allTokens.splice(i, 1);
			}
		}
	};

	return (
		<>
			<Button startIcon={<AddIcon />} variant="contained" onClick={() => window.open('/tokens', '_blank')}>
				{t('campaign-creator.step3-tokens.fields.create-token.label')}
			</Button>
			<div style={{ marginTop: '18px' }} />
			<Button startIcon={<ListIcon />} variant="contained" onClick={() => setShowTokenList(!showTokenList)}>
				{t('campaign-creator.step3-tokens.fields.select-tokens.label')}
			</Button>
			{showTokenList && (
				<List>
					{Object.keys(props.fin4Tokens).map(token => {
						return (
							<ListItem key={token}>
								<Checkbox edge="start" onChange={updateSelectedTokenList} name={token} />
								{String(props.fin4Tokens[token].name)}
								&nbsp;
								<Currency symbol={String(props.fin4Tokens[token].symbol)} />
							</ListItem>
						);
					})}
				</List>
			)}
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const mapStateToProps = state => {
	return {
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(StepToken, mapStateToProps);
