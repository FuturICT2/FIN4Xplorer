import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';

const PROPERTY_DEFAULT = {
	mechanisms: []
};

function StepUnderlying(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [underlying, setUnderlying] = useState(PROPERTY_DEFAULT);

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;

		setUnderlying({
			mechanisms: draft.underlying.hasOwnProperty('mechanisms')
				? draft.underlying['mechanisms']
				: PROPERTY_DEFAULT['mechanisms']
		});

		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'underlying',
			node: underlying
		});
		props.handleNext();
	};

	return (
		<>
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const mapStateToProps = state => {
	return {};
};

export default drizzleConnect(StepUnderlying, mapStateToProps);
