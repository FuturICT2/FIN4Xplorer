import React, { useState, useRef, useEffect } from 'react';
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
		symbol: '',
		campaignEnd: 0,
		successPercentage: 0,
		Description: ''
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
			symbol: getValue(draft, 'symbol'),
			campaignEnd: getValue(draft, 'campaignEnd'),
			successPercentage: getValue(draft, 'successPercentage'),
			Description: draft.basics.hasOwnProperty('description') ? draft.basics['description'].split('||')[0] : ''
		});
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_CAMPAIGN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(), // TODO only set that if actual changes took place: compare
			nodeName: 'basics',
			node: {
				name: basics.name,
				symbol: basics.symbol,
				campaignEnd: basics.campaignEnd,
				successPercentage: basics.successPercentage,
				description: basics.Description
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

	const updateDateTime = value => {
		if (value != null) {
			updateVal('campaignEnd', value.getTime());
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
			<TextField
				key="symbol-field"
				type="text"
				label={t('campaign-creator.step1-identity.fields.symbol.label')}
				value={basics.symbol}
				onChange={e => updateVal('symbol', e.target.value)}
				style={inputFieldStyle}
			/>
			<div style={{ marginTop: '18px' }} />
			<TextField
				key="description-field"
				multiline
				rows="3"
				variant="outlined"
				type="text"
				label={t('campaign-creator.step1-identity.fields.description.label')}
				value={basics.longDescription}
				onChange={e => updateVal('longDescription', e.target.value)}
				style={inputFieldStyle}
			/>
			<TextField label="Campaign ends on" />
			<DateTimePicker onChange={updateDateTime} />
			<TextField onChange={e => updateVal('successPercentage', e.target.value)} />
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

export default drizzleConnect(StepIdentity);
