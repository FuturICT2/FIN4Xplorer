import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import StepsBottomNav from './StepsBottomNav';

function StepExternalUnderlyings(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		setDraftId(draft.id);
	});

	const submit = () => {};

	return (
		<>
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const mapStateToProps = state => {
	return {
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(StepExternalUnderlyings, mapStateToProps);
