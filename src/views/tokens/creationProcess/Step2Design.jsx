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
	const [properties, setProperties] = useState(PROPERTY_DEFAULT);

	const getValue = (draft, prop) => {
		return draft.properties.hasOwnProperty(prop) ? draft.properties[prop] : PROPERTY_DEFAULT[prop];
	};

	useEffect(() => {
		if (!props.draft || draftId) {
			return;
		}

		let draft = props.draft;

		setProperties({
			isTransferable: getValue(draft, 'isTransferable'),
			isMintable: getValue(draft, 'isMintable'),
			isBurnable: getValue(draft, 'isBurnable'),
			isCapped: getValue(draft, 'isCapped'),
			cap: getValue(draft, 'cap'),
			decimals: getValue(draft, 'decimals'),
			initialSupply: getValue(draft, 'initialSupply')
		});

		setDraftId(draft.id);
	});

	const submit = () => {
		props.dispatch({
			type: 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS',
			draftId: draftId,
			lastModified: moment().valueOf(),
			nodeName: 'properties',
			node: properties
		});
		props.handleNext();
	};

	const buildCheckboxWithLabel = (label, fieldName, enabled = true, tooltip = null) => {
		return (
			<>
				<FormControlLabel
					control={
						<Checkbox
							checked={properties[fieldName]}
							onChange={() => {
								updateVal(fieldName, !properties[fieldName]);
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

	const updateVal = (key, val) => {
		setProperties({
			...properties,
			[key]: val
		});
	};

	return (
		<>
			<div style={{ padding: '10px 0 0 85px' }}>
				{buildCheckboxWithLabel('is capped', 'isCapped')}
				<TextField
					disabled={!properties['isCapped']}
					type="number"
					label="Cap"
					style={styles.numberField}
					value={properties.cap}
					onChange={e => updateVal('cap', Number(e.target.value))}
					title="Not supported yet"
				/>
				<TextField
					type="number"
					label="Initial supply"
					style={styles.numberField}
					value={properties.initialSupply}
					onChange={e => updateVal('initialSupply', Number(e.target.value))}
				/>
				{buildCheckboxWithLabel('is mintable', 'isMintable')}
				{buildCheckboxWithLabel('is transferable', 'isTransferable')}
				{buildCheckboxWithLabel('is burnable', 'isBurnable')}
				<TextField
					type="number"
					label="Decimals"
					style={styles.numberField}
					value={properties.decimals}
					onChange={e => updateVal('decimals', Number(e.target.value))}
				/>
			</div>
			<StepsBottomNav nav={props.nav} handleNext={submit} />
		</>
	);
}

const styles = {
	numberField: {
		marginBottom: '15px'
	}
};

export default drizzleConnect(StepDesign);
