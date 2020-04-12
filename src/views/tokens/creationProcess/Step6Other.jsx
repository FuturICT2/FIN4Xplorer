import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import Dropdown from '../../../components/Dropdown';
import Button from '../../../components/Button';

const PROPERTY_DEFAULT = {
	constraints: {}
};

function StepOther(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [other, setOther] = useState(null);
	const [showDropdown, setShowDropdown] = useState(false);

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;

		setOther({
			constraints: draft.other.hasOwnProperty('constraints') ? draft.other.constraints : PROPERTY_DEFAULT.constraints
		});

		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'other',
			node: other
		});
		props.handleNext();
	};

	return (
		<>
			{showDropdown ? (
				<Dropdown
					onChange={e => {}}
					options={Object.keys(props.proofTypes)
						.filter(addr => props.proofTypes[addr].isConstraint)
						//.filter(addr => !proofs.current[props.proofTypes[addr].label]) TODO
						.map(addr => props.proofTypes[addr])}
					label="Add token constraint"
				/>
			) : (
				<Button onClick={() => setShowDropdown(true)} center="true" color="inherit">
					Add
				</Button>
			)}
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const mapStateToProps = state => {
	return {
		proofTypes: state.fin4Store.proofTypes
	};
};

export default drizzleConnect(StepOther, mapStateToProps);
