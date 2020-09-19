import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { TextField } from '@material-ui/core';
import StepsBottomNav from './StepsBottomNav';

function StepIdentity(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [basics, setBasics] = useState({
		name: '',
		symbol: '',
		shortDescription: '',
		longDescription: ''
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
			shortDescription: draft.basics.hasOwnProperty('description') ? draft.basics['description'].split('||')[0] : '',
			longDescription: draft.basics.hasOwnProperty('description') ? draft.basics['description'].split('||')[1] : ''
		});
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(), // TODO only set that if actual changes took place: compare
			nodeName: 'basics',
			node: {
				name: basics.name,
				symbol: basics.symbol,
				description: basics.shortDescription + '||' + basics.longDescription
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
				type="text"
				label={t('token-creator.step1-identity.fields.name.label')}
				value={basics.name}
				onChange={e => updateVal('name', e.target.value)}
				style={inputFieldStyle}
			/>
			<TextField
				key="symbol-field"
				type="text"
				label={t('token-creator.step1-identity.fields.symbol.label')}
				value={basics.symbol}
				onChange={e => updateVal('symbol', e.target.value)}
				style={inputFieldStyle}
			/>
			<TextField
				key="short-description-field"
				type="text"
				label={t('token-creator.step1-identity.fields.short-description.label')}
				value={basics.shortDescription}
				onChange={e => updateVal('shortDescription', e.target.value)}
				style={inputFieldStyle}
			/>
			<div style={{ marginTop: '18px' }} />
			<TextField
				key="long-description-field"
				multiline
				rows="3"
				variant="outlined"
				type="text"
				label={t('token-creator.step1-identity.fields.long-description.label')}
				value={basics.longDescription}
				onChange={e => updateVal('longDescription', e.target.value)}
				style={inputFieldStyle}
			/>
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

export default drizzleConnect(StepIdentity);
