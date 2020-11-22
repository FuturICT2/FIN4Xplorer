import React, { useState, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { TextField } from '@material-ui/core';
import StepsBottomNav from './StepsBottomNav';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/moment';

const dateFormat = 'YYYY-MM-DD HH:mm';

function StepIdentity(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	// split it into three state variables instead of one basics = {...} because I didn't get it to work otherwise
	// compare 1st example here: https://material-ui-pickers.dev/demo/datetime-picker
	const [name, setName] = useState('');
	const [campaignStartTime, setCampaignStartTime] = useState(Date.now()); // now
	const [campaignEndTime, setCampaignEndTime] = useState(Date.now() + (1000 * 60 * 60 * 24 * 7)); // 7 days from now 

	useEffect(() => {
		if (draftId || !props.draft) {
			return;
		}
		let draft = props.draft;
		setName(draft.basics.hasOwnProperty('name') ? draft.basics['name'] : name);
		setCampaignStartTime(draft.basics.hasOwnProperty('campaignStartTime') ? draft.basics['campaignStartTime'] : campaignStartTime);
		setCampaignEndTime(draft.basics.hasOwnProperty('campaignEndTime') ? draft.basics['campaignEndTime'] : campaignEndTime);
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_CAMPAIGN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'basics',
			node: {
				name: name,
				campaignStartTime: campaignStartTime,
				campaignEndTime: campaignEndTime
			}
		});
		props.handleNext();
	};

	return (
		<>
			<TextField
				key="name-field"
				type="text"
				label={t('campaign-creator.step1-identity.fields.name.label')}
				value={name}
				onChange={e => setName(e.target.value)}
				style={inputFieldStyle}
			/>
			<div style={{ marginTop: '18px' }} />
				<MuiPickersUtilsProvider key='start-date-wrapper' utils={DateFnsUtils}>
				<DateTimePicker
					ampm={false}
					// disableFuture
					showTodayButton
					key='start-date'
					label={t('campaign-creator.step1-identity.fields.start-date.label')}
					format={dateFormat}
					value={campaignStartTime}
					onChange={moment => setCampaignStartTime(moment.unix() * 1000)}
					style={inputFieldStyle}
				/>
			</MuiPickersUtilsProvider>
			<div style={{ marginTop: '18px' }} />
			<MuiPickersUtilsProvider key='end-date-wrapper' utils={DateFnsUtils}>
				<DateTimePicker
					ampm={false}
					showTodayButton
					key='end-date'
					label={t('campaign-creator.step1-identity.fields.end-date.label')}
					format={dateFormat}
					value={campaignEndTime}
					onChange={moment => setCampaignEndTime(moment.unix() * 1000)}
					style={inputFieldStyle}
				/>
			</MuiPickersUtilsProvider>
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

export default drizzleConnect(StepIdentity);
