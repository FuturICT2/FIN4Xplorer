import React from 'react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from './Contractor';
import { drizzleConnect } from 'drizzle-react';
import { Fin4Colors } from './utils';
import Tooltip from '@material-ui/core/Tooltip';

function SourcererPairInfoComponent(props) {
	const { t } = useTranslation();

	const displayAddress = address => {
		return <span style={styles.address}>{address}</span>;
	};

	const getTokenAddressOrSymbol = address => {
		let token = props.fin4Tokens[address];
		if (token) {
			return (
				<a href={'/token/view/' + token.symbol}>
					<small>{token.symbol}</small>
				</a>
			);
		}
		return address;
	};

	const displayBeneficiary = address => {
		if (address === zeroAddress) {
			return 'the PAT supplier';
		}
		return displayAddress(address);
	};

	return (
		<>
			<div style={styles.pairDiv}>
				<div style={styles.pairHeadline}>{props.pair.sourcererName} pair</div>
				<br />

				<table>
					<tbody>
						<tr>
							<td>PAT:</td>
							<td>{getTokenAddressOrSymbol(props.pair.pat)}</td>
						</tr>
						<tr>
							<td>Collateral:</td>
							<td>{getTokenAddressOrSymbol(props.pair.collateral)}</td>
						</tr>
						<tr>
							<td>Collateral:</td>
							<td>{getTokenAddressOrSymbol(props.pair.collateral)}</td>
						</tr>
						<tr>
							<td>Beneficiary:</td>
							<td>{displayBeneficiary(props.pair.beneficiary)}</td>
						</tr>
						<tr>
							<td>Exchange ratio:</td>
							<td>{props.pair.exchangeRatio}</td>
						</tr>
						<tr>
							<td>
								<Tooltip title="Total collateral balance on this pair" arrow>
									<span>Collateral balance:</span>
								</Tooltip>
							</td>
							<td>{props.pair.totalCollateralBalance}</td>
						</tr>
						<tr>
							<td>
								<Tooltip title="Total amount of PAT that was exchanged on this pair" arrow>
									<span>PAT balance:</span>
								</Tooltip>
							</td>
							<td>{props.pair.totalExchangedPatAmount}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</>
	);
}

const styles = {
	address: {
		fontSize: 'x-small',
		color: Fin4Colors.darkGrey
	},
	pairHeadline: {
		fontSize: 'small',
		color: Fin4Colors.darkPink,
		fontWeight: 'bold',
		textTransform: 'uppercase'
	},
	pairDiv: {
		fontFamily: 'arial',
		borderRadius: '25px',
		border: '2px solid #cc1c6e',
		padding: '20px',
		position: 'relative',
		margin: '10px 0 10px 0'
	}
};

const mapStateToProps = state => {
	return {
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(SourcererPairInfoComponent, mapStateToProps);
