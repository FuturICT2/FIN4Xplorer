import React, { useState, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { TextField } from '@material-ui/core';
import StepsBottomNav from './StepsBottomNav';
import DateTimePicker from 'react-datetime-picker';

function StepIdentity(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [basics, setBasics] = useState({
		name: '',
		campaignStartTime: 0,
		campaignEndTime: 0
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
				campaignEndTime: basics.campaignEndTime
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

	const updateStartTime = value => {
		if (value != null) {
			updateVal('campaignStartTime', value.getTime());
		}
	};

	const updateEndTime = value => {
		if (value != null) {
			updateVal('campaignEndTime', value.getTime());
		}
	};

	return (
		<>
			<TextField
				key="name-field"
				type="text"
				label={t('campaign-creator.step1-identity.fields.name.label')}
				value={basics.name}
				onChange={e => updateVal('name', e.target.value)}
				style={inputFieldStyle}
			/>
			<div style={{ marginTop: '18px' }} />
			<div style={inputFieldStyle}>{t('campaign-creator.step1-identity.fields.start-date.label')}</div>
			<DateTimePicker onChange={updateStartTime} />
			<div style={{ marginTop: '18px' }} />
			<div style={inputFieldStyle}>{t('campaign-creator.step1-identity.fields.end-date.label')}</div>
			<DateTimePicker onChange={updateEndTime} />
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

export default drizzleConnect(StepIdentity);
