import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';

// put these somewhere central? #ConceptualDecision
const PROPERTY_DEFAULT = {
	isTransferable: true,
	isMintable: true,
	isBurnable: false,
	isCapped: false,
	cap: 0,
	decimals: 0,
	initialSupply: 0
};

function StepDesign(props) {
	const { t } = useTranslation();

	const [draftId, setDraftId] = useState(null);
	const properties = useRef({});

	const getValue = (draft, prop) => {
		return draft.properties.hasOwnProperty(prop) ? draft.properties[prop] : PROPERTY_DEFAULT[prop];
	};

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}

		let draft = props.draft;

		properties.current = {
			cap: getValue(draft, 'cap'),
			decimals: getValue(draft, 'decimals'),
			initialSupply: getValue(draft, 'initialSupply')
		};

		setCheckboxes({
			isTransferable: getValue(draft, 'isTransferable'),
			isMintable: getValue(draft, 'isMintable'),
			isBurnable: getValue(draft, 'isBurnable'),
			isCapped: getValue(draft, 'isCapped')
		});

		setDraftId(draft.id);
	});

	const submit = () => {
		for (var fieldName in checkboxes) {
			if (checkboxes.hasOwnProperty(fieldName)) {
				properties.current[fieldName] = checkboxes[fieldName];
			}
		}
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'properties',
			node: properties.current
		});
		props.handleNext();
	};

	const [checkboxes, setCheckboxes] = useState({});

	const buildCheckboxWithLabel = (label, fieldName, onChange = null, enabled = true, tooltip = null) => {
		return (
			<>
				<FormControlLabel
					control={
						<Checkbox
							checked={checkboxes[fieldName]}
							onChange={() => {
								if (onChange) {
									onChange();
								}
								setCheckboxes({
									...checkboxes,
									[fieldName]: !checkboxes[fieldName]
								});
							}}
							disabled={!enabled}
						/>
					}
					label={label}
					title={tooltip}
				/>
				<br />
			</>
		);
	};

	return (
		<>
			{draftId && (
				<>
					<div style={{ padding: '10px 0 0 85px' }}>
						{buildCheckboxWithLabel('is transferable', 'isTransferable')}
						{buildCheckboxWithLabel('is mintable', 'isMintable')}
						{buildCheckboxWithLabel('is burnable', 'isBurnable')}
						{buildCheckboxWithLabel('is capped', 'isCapped', () => {
							if (checkboxes['isCapped']) {
								properties.current.cap = null;
							}
						})}
						<TextField
							disabled={!checkboxes['isCapped']}
							type="number"
							label="Cap"
							style={styles.numberField}
							defaultValue={properties.current.cap}
							onChange={e => (properties.current.cap = e.target.value)}
							title="Not supported yet"
						/>
						<TextField
							type="number"
							label="Decimals"
							style={styles.numberField}
							defaultValue={properties.current.decimals}
							onChange={e => (properties.current.decimals = e.target.value)}
						/>
						<TextField
							type="number"
							label="Initial supply"
							style={styles.numberField}
							defaultValue={properties.current.initialSupply}
							onChange={e => (properties.current.initialSupply = e.target.value)}
						/>
					</div>
					<StepsBottomNav nav={props.nav} handleNext={submit} />
				</>
			)}
		</>
	);
}

const styles = {
	numberField: {
		marginBottom: '15px'
	}
};

const mapStateToProps = state => {
	return {};
};

export default drizzleConnect(StepDesign, mapStateToProps);
