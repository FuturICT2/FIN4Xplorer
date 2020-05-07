import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { TextField } from '@material-ui/core';

function StepUnderlying(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [underlyings, setUnderlyings] = useState([]);

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		setUnderlyings(draft.underlyings);
		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'underlyings',
			node: underlyings
		});
		// adding them here already to avoid having to reload for the
		// newly added ones to become available
		props.dispatch({
			type: 'ADD_UNDERLYINGS',
			underlyings: underlyings.filter(
				el => props.allUnderlyings.filter(reduxEl => reduxEl.name === el.name).length === 0
			)
		});
		props.handleNext();
	};

	const updateOptions = () => {
		// return only options that are in the redux list of all underlying and NOT in the already selected ones here
		return props.allUnderlyings.filter(reduxEl => underlyings.filter(el => el.name === reduxEl.name).length === 0);
	};

	return (
		<>
			{underlyings && <></>}
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const mapStateToProps = state => {
	return {
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(StepUnderlying, mapStateToProps);
