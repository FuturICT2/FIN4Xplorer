import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { TextField } from '@material-ui/core';
import StepsBottomNav from './StepsBottomNav';

function StepDesign(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [basics, setBasics] = useState({
		successThreshold: 0,
		claimPerCampaignContributor: 0
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
			name: getValue(draft, 'name'),
			campaignStartTime: getValue(draft, 'campaignStartTime'),
			campaignEndTime: getValue(draft, 'campaignEndTime'),
			allTokens: getValue(draft, 'allTokens'),
			successThreshold: getValue(draft, 'successThreshold'),
			claimPerCampaignContributor: getValue(draft, 'claimPerCampaignContributor')
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
				campaignEndTime: basics.campaignStartTime,
				allTokens: basics.allTokens,
				successThreshold: basics.successThreshold,
				claimPerCampaignContributor: basics.claimPerCampaignContributor
			}
		});
		props.handleNext();
	};

	const updateVal = (key, val) => {
		setBasics({
			...basics,
			[key]: val
		});
	};

	return (
		<>
			<TextField
				key="name-field"
				type="number"
				label={t('campaign-creator.step4-design.fields.success-threshold.label')}
				value={basics.successThreshold}
				onChange={e => updateVal('successThreshold', e.target.value)}
				style={inputFieldStyle}
				InputProps={{ inputProps: { min: 0 } }}
			/>
			<div style={{ marginTop: '18px' }} />
			<TextField
				label={t('campaign-creator.step4-design.fields.claim-per-user.label')}
				type="number"
				value={basics.claimPerCampaignContributor}
				onChange={e => updateVal('claimPerCampaignContributor', e.target.value)}
				style={inputFieldStyle}
				InputProps={{ inputProps: { min: 1 } }}
			/>
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

export default drizzleConnect(StepDesign);
