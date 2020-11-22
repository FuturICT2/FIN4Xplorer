import React, { useState, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { TextField } from '@material-ui/core';
import StepsBottomNav from './StepsBottomNav';

function StepDesign(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [design, setDesign] = useState({
		successThreshold: 0,
		claimPerCampaignContributor: 0
	});

	useEffect(() => {
		if (draftId || !props.draft) {
			return;
		}
		let draft = props.draft;
		setDesign({
			successThreshold: draft.design.hasOwnProperty('successThreshold') ? draft.design['successThreshold'] : 0,
			claimPerCampaignContributor: draft.design.hasOwnProperty('claimPerCampaignContributor') ? draft.design['claimPerCampaignContributor'] : 0,
		});
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_CAMPAIGN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'design',
			node: {
				successThreshold: design.successThreshold,
				claimPerCampaignContributor: design.claimPerCampaignContributor
			}
		});
		props.handleNext();
	};

	const updateVal = (key, val) => {
		setDesign({
			...design,
			[key]: val
		});
	};

	return (
		<>
			<TextField
				key="name-field"
				type="number"
				label={t('campaign-creator.step4-design.fields.success-threshold.label')}
				value={design.successThreshold}
				onChange={e => updateVal('successThreshold', e.target.value)}
				style={inputFieldStyle}
				InputProps={{ inputProps: { min: 0 } }}
			/>
			<div style={{ marginTop: '18px' }} />
			<TextField
				label={t('campaign-creator.step4-design.fields.claim-per-user.label')}
				type="number"
				value={design.claimPerCampaignContributor}
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
