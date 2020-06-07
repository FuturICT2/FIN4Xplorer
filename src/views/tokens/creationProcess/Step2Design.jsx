import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import StepsBottomNav from './StepsBottomNav';
import { Checkbox, FormControlLabel, TextField, Radio } from '@material-ui/core';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

// put these somewhere central? #ConceptualDecision
const PROPERTY_DEFAULT = {
	isTransferable: true,
	// 25.5.2020, changed isBurnable from false to true to enable sourcerers by default, makes sense? #ConceptualDecision
	isBurnable: true,
	isCapped: false,
	cap: 0,
	decimals: 0,
	initialSupply: 0,
	initialSupplyUserIsOwner: true,
	initialSupplyOtherOwner: ''
};

const useStyles = makeStyles(theme => ({
	label: {
		fontSize: '0.9rem'
	}
}));

function StepDesign(props, context) {
	const { t } = useTranslation();
	const classes = useStyles();

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
			isBurnable: getValue(draft, 'isBurnable'),
			isCapped: getValue(draft, 'isCapped'),
			cap: getValue(draft, 'cap'),
			decimals: getValue(draft, 'decimals'),
			initialSupply: getValue(draft, 'initialSupply'),
			initialSupplyUserIsOwner: getValue(draft, 'initialSupplyUserIsOwner'),
			initialSupplyOtherOwner: getValue(draft, 'initialSupplyOtherOwner')
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

	const buildCheckboxWithLabel = (label, fieldName, size = 'medium') => {
		return (
			<>
				<FormControlLabel
					control={
						<Checkbox
							size={size}
							checked={properties[fieldName]}
							onChange={() => {
								updateVal(fieldName, !properties[fieldName]);
							}}
						/>
					}
					label={<span style={{ fontSize: size === 'medium' ? '1rem' : '0.9rem' }}>{label}</span>}
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
				{buildCheckboxWithLabel(t('token-creator.step2-design.fields.is-capped.label'), 'isCapped')}
				<TextField
					disabled={!properties['isCapped']}
					type="number"
					label={t('token-creator.step2-design.fields.cap.label')}
					style={styles.numberField}
					value={properties.cap}
					onChange={e => updateVal('cap', Number(e.target.value))}
					title="Not supported yet"
				/>
				<div style={properties.initialSupply > 0 ? styles.divOutline : null}>
					<TextField
						type="number"
						label={t('token-creator.step2-design.fields.initial-supply.label')}
						style={styles.numberField}
						value={properties.initialSupply}
						onChange={e => updateVal('initialSupply', Number(e.target.value))}
					/>
					{properties.initialSupply > 0 && (
						<>
							<FormControlLabel
								checked={properties.initialSupplyUserIsOwner}
								control={<Radio />}
								label={t('token-creator.step2-design.fields.token-creator-owns-initial-supply.label')}
								classes={{
									label: classes.label
								}}
								onChange={e => {
									setProperties({
										...properties,
										initialSupplyUserIsOwner: true,
										initialSupplyOtherOwner: ''
									});
								}}
							/>
							<FormControlLabel
								checked={!properties.initialSupplyUserIsOwner}
								control={<Radio />}
								label={
									<TextField
										disabled={properties.initialSupplyUserIsOwner}
										type="text"
										label={t('token-creator.step2-design.fields.other-initial-supply-owner.label')}
										inputProps={{
											style: { fontSize: 'small' }
										}}
										value={properties.initialSupplyOtherOwner}
										onChange={e => updateVal('initialSupplyOtherOwner', e.target.value)}
									/>
								}
								onChange={e => {
									updateVal('initialSupplyUserIsOwner', false);
								}}
							/>
						</>
					)}
				</div>
				{buildCheckboxWithLabel(t('token-creator.step2-design.fields.is-transferable.label'), 'isTransferable')}
				{buildCheckboxWithLabel(t('token-creator.step2-design.fields.is-burnable.label'), 'isBurnable')}
				<br />
				<TextField
					type="number"
					label={t('token-creator.step2-design.fields.decimals.label')}
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
	},
	divOutline: {
		borderRadius: '25px',
		border: '2px solid #cc1c6e',
		padding: '20px',
		position: 'relative',
		left: '-20px',
		margin: '10px 0 10px 0'
	}
};

StepDesign.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(StepDesign);
