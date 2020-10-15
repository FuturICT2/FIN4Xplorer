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

function StepToken(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [showTokenList, setShowTokenList] = useState(false);
	const [basics, setBasics] = useState({
		allTokens: []
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_CAMPAIGN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'basics',
			node: {
				allTokens: basics.allTokens
			}
		});
		props.handleNext();
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
				<SortableTokenList
					tokens={Object.keys(props.fin4Tokens).map(addr => props.fin4Tokens[addr])}
					showFilterAndSortOptions={false}
				/>
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
