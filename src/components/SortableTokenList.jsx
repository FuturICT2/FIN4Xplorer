import React, { useState, useEffect, useRef } from 'react';
import Table from './Table';
import TableRow from './TableRow';
import { drizzleConnect } from 'drizzle-react';
import Currency from './Currency';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSortAmountDownAlt, faStar } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import OutlinedDiv from './OutlinedDiv';
import { Checkbox, FormControlLabel, Radio, RadioGroup, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import ComparisonSigns from './ComparisonSigns';

function SortableTokenList(props, context) {
	const { t } = useTranslation();

	const [tokens, setTokens] = useState([]);

	const [filterIconHovered, setFilterIconHovered] = useState(false);
	const [sortIconHovered, setSortIconHovered] = useState(false);
	const [filterSettingsOpen, setFilterSettingsOpen] = useState(false);
	const [sortSettingsOpen, setSortSettingsOpen] = useState(false);
	const [sortingMode, setSortingMode] = useState('by-name');
	const [sortingModeReversed, setSortingModeReversed] = useState(false);
	const toggleFilterSettings = () => {
		if (!filterSettingsOpen && sortSettingsOpen) {
			toggleSortSettings();
		}
		setFilterSettingsOpen(!filterSettingsOpen);
	};
	const toggleSortSettings = () => {
		if (!sortSettingsOpen && filterSettingsOpen) {
			toggleFilterSettings();
		}
		setSortSettingsOpen(!sortSettingsOpen);
	};

	const [filterModes, setFilterModes] = useState({
		'user-is-creator': true,
		'user-is-admin': true,
		'claimed-by-user': true,
		'is-curated': true,
		'name-search': true,
		'total-supply-comparison': true,
		'number-of-claims-comparison': true,
		'is-OPAT': true
	});

	const comparisonModes = useRef({
		'total-supply-comparison': 'equal',
		'number-of-claims-comparison': 'equal'
	});

	useEffect(() => {
		if (tokens.length != props.tokens.length) {
			setTokens(props.tokens);
		}
	});

	const buildPlusMinusCheckbox = (attribute, label) => {
		return (
			<FormControlLabel
				control={
					<Checkbox
						icon={<RemoveIcon />}
						checkedIcon={<AddIcon />}
						checked={filterModes[attribute]}
						onChange={() => {
							setFilterModes({
								...filterModes,
								[attribute]: !filterModes[attribute]
							});
						}}
					/>
				}
				label={label}
			/>
		);
	};

	const buildNameSearchComponent = (attribute, label) => {
		return (
			<>
				{buildPlusMinusCheckbox(attribute, label)}
				<TextField title="* is wildcard" type="text" onChange={() => {}} style={{ width: '140px' }} />
				<br />
			</>
		);
	};

	const buildComparisonComponent = (attribute, label) => {
		return (
			<>
				{buildPlusMinusCheckbox(attribute, label)}
				<ComparisonSigns setComparisonMode={mode => (comparisonModes.current[attribute] = mode)} />
				&nbsp;&nbsp;&nbsp;&nbsp;
				<TextField type="number" onChange={() => {}} style={{ width: '60px' }} />
				<br />
			</>
		);
	};

	return (
		<>
			{props.showFilterAndSortOptions && (
				<>
					<TableIcons>
						<FontAwesomeIcon
							icon={faFilter}
							style={
								filterIconHovered ? styles.iconHovered : filterSettingsOpen ? styles.iconActive : styles.iconDefault
							}
							onClick={toggleFilterSettings}
							onMouseEnter={() => setFilterIconHovered(true)}
							onMouseLeave={() => setFilterIconHovered(false)}
						/>
						<FontAwesomeIcon
							icon={faSortAmountDownAlt}
							style={sortIconHovered ? styles.iconHovered : sortSettingsOpen ? styles.iconActive : styles.iconDefault}
							onClick={toggleSortSettings}
							onMouseEnter={() => setSortIconHovered(true)}
							onMouseLeave={() => setSortIconHovered(false)}
						/>
					</TableIcons>
					{filterSettingsOpen && (
						<OutlinedDiv label="Filter options [mockup]">
							{buildPlusMinusCheckbox('user-is-creator', 'You are creator')}
							{buildPlusMinusCheckbox('user-is-admin', 'You are admin')}
							{buildPlusMinusCheckbox('claimed-by-user', 'You claimed it')}
							{buildPlusMinusCheckbox('is-curated', 'Is curated token')}
							{buildPlusMinusCheckbox('is-OPAT', 'Is OPAT')}
							<br />
							{buildNameSearchComponent('name-search', 'Name contains')}
							{buildComparisonComponent('total-supply-comparison', 'Total supply')}
							{buildComparisonComponent('number-of-claims-comparison', 'Number of claims')}
							{/* 
								TODO
								ComparisonSigns modes:
								equals, not-equal, greater-than, less-than, greater-than-equal, less-than-equal
								* wildcard explanation
								has these proof types: multiselect dropdown
								Reset option
							*/}
						</OutlinedDiv>
					)}
					{sortSettingsOpen && (
						<OutlinedDiv label="Sort by... [mockup]">
							<RadioGroup row={true} onChange={e => setSortingMode(e.target.value)} value={sortingMode}>
								<FormControlLabel value="by-name" control={<Radio />} label="Name" />
								<FormControlLabel value="by-symbol" control={<Radio />} label="Symbol" />
								<FormControlLabel value="by-date" control={<Radio />} label="Creation date" />
								<FormControlLabel value="by-supply" control={<Radio />} label="Total supply" />
								<FormControlLabel value="by-claims" control={<Radio />} label="Claims" />
							</RadioGroup>
							<div style={{ textAlign: 'right' }}>
								<FormControlLabel
									control={<Checkbox onChange={() => setSortingModeReversed(!sortingModeReversed)} />}
									label="Reverse"
								/>
							</div>
						</OutlinedDiv>
					)}
				</>
			)}
			<Table headers={[t('token-name'), 'Supply', 'Actions']} colWidths={[74, 12, 14]}>
				{tokens.map((token, index) => {
					return (
						<TableRow
							key={'token_' + index}
							data={{
								name: (
									<>
										<span title={'Description: ' + token.description + '\nUnit: ' + token.unit}>
											<Currency symbol={token.symbol} name={token.name} />
										</span>
										{token.isOPAT && (
											<Link to="/governance/listing">
												<FontAwesomeIcon
													title="This token is on the list of curated tokens"
													icon={faStar}
													style={styles.iconOPAT}
												/>
											</Link>
										)}
									</>
								),
								totalSupply: token.totalSupply,
								actions: (
									<small style={{ color: 'blue', textDecoration: 'underline' }}>
										<Link to={'/token/view/' + token.symbol}>View</Link>
										<br />
										<Link to={'/claim/' + token.symbol}>Claim</Link>
									</small>
								)
							}}
						/>
					);
				})}
			</Table>
		</>
	);
}

const TableIcons = styled.div`
	text-align: right;
	padding-right: 20px;
`;

const styles = {
	// TODO make a shared default and use multiple classes in the FontAwesomeIcon?
	iconDefault: {
		color: 'gray',
		width: '14px',
		height: '14px',
		paddingLeft: '10px' // padding: top right bottom left
	},
	iconHovered: {
		color: 'silver',
		width: '14px',
		height: '14px',
		paddingLeft: '10px'
	},
	iconActive: {
		color: 'blue',
		width: '14px',
		height: '14px',
		paddingLeft: '10px'
	},
	iconOPAT: {
		color: 'lightgreen',
		width: '16px',
		height: '16px',
		paddingLeft: '5px'
	}
};

const mapStateToProps = state => {
	return {};
};

export default drizzleConnect(SortableTokenList, mapStateToProps);
