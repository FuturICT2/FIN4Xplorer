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
	const [tokens, setTokens] = useState([]);

	useEffect(() => {
		if (draftId || !props.draft) {
			return;
		}
		let draft = props.draft;
		let tokensFromDraft = draft.tokens.hasOwnProperty('allTokens') ? draft.tokens['allTokens'] : [];
		setTokens(tokensFromDraft);
		if (tokensFromDraft.length > 0) {
			setShowTokenList(true);
		}
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_CAMPAIGN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'tokens',
			node: {
				allTokens: tokens
			}
		});
		props.handleNext();
	};

	// Select token(s) that will be part of campaign

	const updateSelectedTokenList = event => {
		if (event.target.checked) {
			setTokens(tokens.concat(event.target.name));
		} else {
			setTokens(tokens.filter(addr => addr !== event.target.name));
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
					{Object.keys(props.fin4Tokens).map(tokenAddr => {
						return (
							<ListItem key={tokenAddr}>
								<Checkbox 
									edge="start" 
									onChange={updateSelectedTokenList} 
									name={tokenAddr}
									checked={tokens.includes(tokenAddr)}
								/>
								<div style={{ fontFamily: 'arial'}}>
									{props.fin4Tokens[tokenAddr].name}
									&nbsp;
									<Currency symbol={props.fin4Tokens[tokenAddr].symbol} />
								</div>
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
