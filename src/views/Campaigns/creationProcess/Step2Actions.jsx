import React, { useState, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { TextField } from '@material-ui/core';

function StepActions(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [actions, setActions] = useState({
		text: ''
	});

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		setActions({
			text: draft.actions.hasOwnProperty('text') ? draft.actions.text : ''
		});
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_CAMPAIGN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'actions',
			node: actions
		});
		props.handleNext();
	};

	const updateVal = (key, val) => {
		setActions({
			...actions,
			[key]: val
		});
	};

	return (
		<>
			<TextField
				multiline
				rows="4"
				fullWidth
				variant="outlined"
				value={actions.text}
				onChange={e => updateVal('text', e.target.value)}
			/>
			<br />
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

export default drizzleConnect(StepActions);
