import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { TextField } from '@material-ui/core';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
const filter = createFilterOptions();

function StepUnderlying(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [underlying, setUnderlying] = useState([]);

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;
		setUnderlying(draft.underlying);
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
		// adding them here already to avoid having to reload for the
		// newly added ones to become available
		props.dispatch({
			type: 'ADD_UNDERLYINGS',
			underlyings: underlying.filter(
				el => props.allUnderlying.filter(reduxEl => reduxEl.title === el.title).length === 0
			)
		});
		props.handleNext();
	};

	const updateOptions = () => {
		// return only options that are in the redux list of all underlying and NOT in the already selected ones here
		return props.allUnderlying.filter(reduxEl => underlying.filter(el => el.title === reduxEl.title).length === 0);
	};

	return (
		<>
			{underlying && (
				<>
					<Autocomplete // see https://material-ui.com/components/autocomplete/
						multiple
						options={updateOptions()}
						getOptionLabel={option => {
							if (option.inputValue && underlying.filter(el => el.title === option.inputValue).length > 0) {
								return option.inputValue; // don't show the "Add"
							}
							return option.title;
						}}
						onChange={(event, selectedOptions) => {
							setUnderlying(
								selectedOptions.map(val => {
									return { title: val.inputValue ? val.inputValue : val.title };
									// TODO add new-flag to apply CSS coloring differently
								})
							);
						}}
						value={underlying}
						filterOptions={(options, params) => {
							const filtered = filter(options, params);
							if (params.inputValue !== '') {
								filtered.push({
									inputValue: params.inputValue,
									title: `Add "${params.inputValue}"`
								});
							}
							return filtered;
						}}
						renderInput={params => (
							<TextField
								{...params}
								variant="outlined"
								label="Determine source of value"
								//placeholder="Add new underlying by typing a new string"
							/>
						)}
					/>
					<br />
				</>
			)}
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const mapStateToProps = state => {
	return {
		allUnderlying: state.fin4Store.allUnderlying
	};
};

export default drizzleConnect(StepUnderlying, mapStateToProps);
