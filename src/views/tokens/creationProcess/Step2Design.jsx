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
	isMintable: true,
	isBurnable: false,
	isCapped: false,
	cap: 0,
	decimals: 0,
	initialSupply: 0,
	initialSupplyUserIsOwner: true,
	initialSupplyOtherOwner: '',
	Fin4ClaimingHasMinterRole: true,
	additionalMinterRoles: ''
};

const useStyles = makeStyles(theme => ({
	label: {
		fontSize: '0.9rem',
		color: 'gray'
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
			isMintable: getValue(draft, 'isMintable'),
			isBurnable: getValue(draft, 'isBurnable'),
			isCapped: getValue(draft, 'isCapped'),
			cap: getValue(draft, 'cap'),
			decimals: getValue(draft, 'decimals'),
			initialSupply: getValue(draft, 'initialSupply'),
			initialSupplyUserIsOwner: getValue(draft, 'initialSupplyUserIsOwner'),
			initialSupplyOtherOwner: getValue(draft, 'initialSupplyOtherOwner'),
			Fin4ClaimingHasMinterRole: getValue(draft, 'Fin4ClaimingHasMinterRole'),
			additionalMinterRoles: getValue(draft, 'additionalMinterRoles')
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
		if (!val && key === 'isMintable') {
			// a bit of a hack, a more elegant solution?
			setProperties({
				...properties,
				isMintable: false,
				Fin4ClaimingHasMinterRole: true,
				additionalMinterRoles: ''
			});
		} else {
			setProperties({
				...properties,
				[key]: val
			});
		}
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
				{properties.initialSupply > 0 && (
					<div style={{ margin: '0 0 10px 40px', color: 'gray' }}>
						<FormControlLabel
							checked={properties.initialSupplyUserIsOwner}
							control={<Radio />}
							label="You are owner"
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
									label="Owner address"
									value={properties.initialSupplyOtherOwner}
									onChange={e => updateVal('initialSupplyOtherOwner', e.target.value)}
								/>
							}
							onChange={e => {
								updateVal('initialSupplyUserIsOwner', false);
							}}
						/>
					</div>
				)}
				{buildCheckboxWithLabel('is mintable', 'isMintable')}
				{properties.isMintable && (
					<div style={{ marginLeft: '40px', color: 'gray' }}>
						{buildCheckboxWithLabel('Fin4 has minter role', 'Fin4ClaimingHasMinterRole', 'small')}
						<TextField
							label="Additional minter roles" // TODO add to info text on the right side
							style={{ margin: '10px 0 10px 0' }}
							inputProps={{
								style: { fontSize: 'small', color: 'gray' }
							}}
							multiline
							rows="2"
							fullWidth
							variant="outlined"
							value={properties.additionalMinterRoles}
							onChange={e => updateVal('additionalMinterRoles', e.target.value)}
						/>
					</div>
				)}
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

StepDesign.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(StepDesign);
