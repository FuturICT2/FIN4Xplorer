import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { TextField } from '@material-ui/core';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ListIcon from '@material-ui/icons/List';
import SortableTokenList from '../../../components/SortableTokenList';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';

function StepToken(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [showTokenList, setShowTokenList] = useState(false);
	const [basics, setBasics] = useState({
		allTokens: []
	});

	const getValue = (draft, prop) => {
		return draft.basics.hasOwnProperty(prop) ? draft.basics[prop] : '';
	};

	useEffect(() => {
		if (draftId || !props.draft) {
			return;
		}
		let draft = props.draft;
		setBasics({
			allTokens: [],
			name: getValue(draft, 'name'),
			campaignStartTime: getValue(draft, 'campaignStartTime'),
			campaignEndTime: getValue(draft, 'campaignEndTime')
		});
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_CAMPAIGN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'basics',
			node: {
				name: basics.name,
				campaignStartTime: basics.campaignStartTime,
				campaignEndTime: basics.campaignEndTime,
				allTokens: basics.allTokens
			}
		});
		props.handleNext();
	};

	// Select token(s) that will be part of campaign

	const updateSelectedTokenList = event => {
		console.log(event.target.checked);
		console.log(event.target.name);

		if (event.target.checked) {
			basics.allTokens.push(event.target.name);
		} else {
			const i = basics.allTokens.indexOf(event.target.name);
			if (i >= 0) {
				basics.allTokens.splice(i, 1);
			}
		}
		console.log(basics.allTokens);
	};

	return (
		<>
			<Button startIcon={<AddIcon />} variant="contained">
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
								{String(props.fin4Tokens[token].symbol)}
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
