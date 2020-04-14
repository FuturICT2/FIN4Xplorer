import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { TextField } from '@material-ui/core';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
const filter = createFilterOptions();

const PROPERTY_DEFAULT = {
	mechanisms: []
};

function StepUnderlying(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const [underlying, setUnderlying] = useState(null);

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}
		let draft = props.draft;

		setUnderlying({
			mechanisms: draft.underlying.hasOwnProperty('mechanisms')
				? draft.underlying.mechanisms
				: PROPERTY_DEFAULT.mechanisms
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

	const updateOptions = () => {
		// return only options that are in the redux list of all mechanisms and NOT in the already selected ones here
		return props.underlyingMechanisms.filter(
			reduxEl => underlying.mechanisms.filter(el => el.title === reduxEl.title).length === 0
		);
	};

	return (
		<>
			{underlying && (
				<>
					<Autocomplete // see https://material-ui.com/components/autocomplete/
						multiple
						options={updateOptions()}
						getOptionLabel={option => {
							if (option.inputValue && underlying.mechanisms.filter(el => el.title === option.inputValue).length > 0) {
								return option.inputValue; // don't show the "Add"
							}
							return option.title;
						}}
						onChange={(event, selectedOptions) => {
							setUnderlying({
								...underlying,
								mechanisms: selectedOptions.map(val => {
									return { title: val.inputValue ? val.inputValue : val.title };
								})
								// TODO add new-flag to apply CSS coloring differently
							});
						}}
						value={underlying.mechanisms}
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
								//placeholder="Add new mechanism by typing a new string"
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
		underlyingMechanisms: state.fin4Store.underlyingMechanisms
	};
};

export default drizzleConnect(StepUnderlying, mapStateToProps);
