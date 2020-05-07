import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import Dropdown from '../../../components/Dropdown';
import Button from '../../../components/Button';

function StepUnderlying(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [underlyings, setUnderlyings] = useState([]);

	const [mode, setMode] = useState('allCollapsed'); // addExisting, addNew

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
			{underlyings && (
				<>
					{mode === 'allCollapsed' && (
						<>
							<Button onClick={() => setMode('addExisting')} center="true" color="inherit">
								Add existing underlying
							</Button>
							<div style={{ marginBottom: '30px' }}> </div>
							<Button onClick={() => setMode('addNew')} center="true" color="inherit">
								Add new underlying
							</Button>
						</>
					)}
					{mode === 'addExisting' && <Dropdown onChange={e => {}} options={[]} label="Choose existing underlying" />}
					{mode === 'addNew' && (
						<>
							<TextField
								key="name-field"
								type="text"
								label="Name"
								//value={}
								//onChange={e => {}}
								style={inputFieldStyle}
							/>
							<TextField
								key="contract-address-field"
								type="text"
								label="Contract address (optional)"
								//value={}
								//onChange={e => {}}
								style={inputFieldStyle}
							/>
							<FormControlLabel
								control={<Checkbox checked={true} onChange={() => {}} />}
								label="Other token creators can add this too"
							/>
							<Button onClick={() => {}} center="true" color="inherit">
								Add
							</Button>
						</>
					)}
				</>
			)}

			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

const mapStateToProps = state => {
	return {
		allUnderlyings: state.fin4Store.allUnderlyings
	};
};

export default drizzleConnect(StepUnderlying, mapStateToProps);
