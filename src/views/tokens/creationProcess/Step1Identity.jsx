import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { TextField } from '@material-ui/core';
import StepsBottomNav from './StepsBottomNav';

function StepIdentity(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const basics = useRef({});

	const getValue = (draft, prop) => {
		return draft.basics.hasOwnProperty(prop) ? draft.basics[prop] : '';
	};

	useEffect(() => {
		if (draftId || !props.draft) {
			return;
		}
		let draft = props.draft;
		basics.current = {
			name: getValue(draft, 'name'),
			symbol: getValue(draft, 'symbol'),
			description: getValue(draft, 'description')
		};
		setDraftId(draft.id);
	});

	const submit = () => {
		basics.current.symbol = basics.current.symbol.toUpperCase();
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(), // TODO only set that if actual changes took place: compare
			nodeName: 'basics',
			node: basics.current
		});
		props.handleNext();
	};

	return (
		<>
			<TextField
				key="name-field"
				type="text"
				label="Name"
				defaultValue={basics.current.name}
				onChange={e => (basics.current.name = e.target.value)}
				style={inputFieldStyle}
			/>
			<TextField
				key="symbol-field"
				type="text"
				label="Symbol"
				defaultValue={basics.current.symbol}
				onChange={e => (basics.current.symbol = e.target.value)}
				style={inputFieldStyle}
			/>
			<TextField
				key="description-field"
				type="text"
				label="Description"
				defaultValue={basics.current.description}
				onChange={e => (basics.current.description = e.target.value)}
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

const mapStateToProps = state => {
	return {};
};

export default drizzleConnect(StepIdentity, mapStateToProps);
