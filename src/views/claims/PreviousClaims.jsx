import React, { useState, useEffect, useRef } from 'react';
import { drizzleConnect } from 'drizzle-react';
import Box from '../../components/Box';
import Currency from '../../components/Currency';
import Button from '../../components/Button';
import { Chip, Typography, Divider, Grid, Paper, createMuiTheme } from '@material-ui/core';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import colors from '../../config/colors-config';
// import DateIcon from '@material-ui/icons/AccessTime';
import ProofIcon from '@material-ui/icons/Fingerprint';
import moment from 'moment';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import history from '../../components/history';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import OutlinedDiv from '../../components/OutlinedDiv';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import Cookies from 'js-cookie';

function PreviousClaims(props) {
	const { t } = useTranslation();

	const [filterIconHovered, setFilterIconHovered] = useState(false);
	const [filterSettingsOpen, setFilterSettingsOpen] = useState(false);

	const toggleFilterSettings = () => {
		setFilterSettingsOpen(!filterSettingsOpen);
	};

	const [filterModes, setFilterModes] = useState({
		'show-pending': true,
		'show-approved': true,
		'show-rejected': true
	});

	const checkedCookie = useRef(false);

	useEffect(() => {
		let cookieEntry = Cookies.get('claims-filter-modes');
		if (cookieEntry && !checkedCookie.current) {
			checkedCookie.current = true;
			setFilterModes(JSON.parse(cookieEntry));
		}
	});

	const buildCheckbox = (attribute, label) => {
		return (
			<FormControlLabel
				control={
					<Checkbox
						checked={filterModes[attribute]}
						onChange={() => {
							let filterModesCopy = Object.assign({}, filterModes);
							setFilterModes({
								...filterModes,
								[attribute]: !filterModes[attribute]
							});
							// state is not immediately updated, need to do it manually in parallel
							filterModesCopy[attribute] = !filterModesCopy[attribute];
							Cookies.set('claims-filter-modes', JSON.stringify(filterModesCopy), { expires: 7 });
						}}
					/>
				}
				label={label}
			/>
		);
	};

	return (
		<>
			<Box title={t('claims.previous-claims.box-title')}>
				<TableIcons>
					{' '}
					{/* TODO share code with SortableTokenList by outsourcing a SortFilterMenu.jsx */}
					<FontAwesomeIcon
						icon={faFilter}
						style={filterIconHovered ? styles.iconHovered : filterSettingsOpen ? styles.iconActive : styles.iconDefault}
						onClick={toggleFilterSettings}
						onMouseEnter={() => setFilterIconHovered(true)}
						onMouseLeave={() => setFilterIconHovered(false)}
					/>
				</TableIcons>
				{filterSettingsOpen && (
					<OutlinedDiv label={t('claims.previous-claims.filter.menu-title')}>
						{buildCheckbox('show-pending', t('claims.previous-claims.filter.pending-checkbox'))}
						{buildCheckbox('show-approved', t('claims.previous-claims.filter.approved-checkbox'))}
						{buildCheckbox('show-rejected', t('claims.previous-claims.filter.rejected-checkbox'))}
					</OutlinedDiv>
				)}
				{Object.keys(props.fin4Tokens).length > 0 &&
					Object.keys(props.usersClaims).map(pseudoClaimId => {
						let claim = props.usersClaims[pseudoClaimId];
						let token = props.store.getState().fin4Store.fin4Tokens[claim.token];
						let date = moment.unix(claim.claimCreationTime).calendar();
						let symbol = props.fin4Tokens[claim.token].symbol; // of token that gets claimed
						let proofSite = '/claim/' + symbol + '/proof/' + claim.claimId;
						let status = claim.gotRejected ? 'gotRejected' : claim.isApproved ? 'isApproved' : 'pendingApproval';
						return (
							<Claim status={status} key={`${claim.token}${claim.claimId}`}>
								<div>
									<Grid container alignItems="center">
										<Grid item xs>
											<Typography gutterBottom variant="h5">
												{token.name}
											</Typography>
										</Grid>
										<Grid item>
											<Typography gutterBottom variant="h6">
												{claim.quantity} <Currency symbol={token.symbol} />
											</Typography>
										</Grid>
									</Grid>
									{claim.comment && (
										<Typography color="textSecondary" variant="body2">
											{claim.comment}
										</Typography>
									)}
								</div>
								<Divider style={{ margin: '10px 0' }} variant="middle" />
								<ThemeProvider theme={chipTheme}>
									<Chip key="0" color="primary" label={date} style={{ margin: '0 7px 7px 0' }} />
								</ThemeProvider>
								{status === 'gotRejected' && (
									<span
										style={{ fontFamily: 'arial', color: 'gray', fontSize: 'small', marginLeft: '20px' }}
										onClick={() => history.push(proofSite)}>
										{t('claims.previous-claims.rejected-label')}
									</span>
								)}
								{status !== 'gotRejected' && (
									<ThemeProvider theme={buttonTheme}>
										<Button
											icon={ProofIcon}
											onClick={() => history.push(proofSite)}
											color={claim.isApproved ? 'primary' : 'secondary'}
											style={{ margin: '0 7px 7px 0' }}>
											{claim.isApproved
												? t('claims.previous-claims.approved-label')
												: t('claims.previous-claims.submit-proof-button')}
										</Button>
									</ThemeProvider>
								)}
							</Claim>
						);
					})}
			</Box>
		</>
	);
}

const TableIcons = styled.div`
	text-align: right;
	margin-top: -10px;
`;

const styles = {
	iconDefault: {
		color: 'gray',
		width: '12px',
		height: '12px'
	},
	iconHovered: {
		color: 'silver',
		width: '12px',
		height: '12px'
	},
	iconActive: {
		color: 'blue',
		width: '12px',
		height: '12px'
	}
};

const chipTheme = createMuiTheme({
	palette: {
		primary: {
			main: colors.light,
			contrastText: colors.main
		}
	}
});

const buttonTheme = createMuiTheme({
	palette: {
		primary: {
			main: 'rgba(61, 219, 81, 0.7)',
			contrastText: colors.light
		},
		secondary: {
			main: 'rgba(248, 57, 48, 0.7)',
			contrastText: colors.light
		}
	}
});

const Claim = styled(Paper)`
	&& {
		box-sizing: border-box;
		margin: 15px 0;
		padding: 15px;
		background: ${props => {
			switch (props.status) {
				case 'isApproved':
					return colors.true;
				case 'pendingApproval':
					return colors.wrong;
				case 'gotRejected':
					return colors.gotRejected;
			}
		}};
	}
`;

const mapStateToProps = state => {
	return {
		usersClaims: state.fin4Store.usersClaims,
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(PreviousClaims, mapStateToProps);
