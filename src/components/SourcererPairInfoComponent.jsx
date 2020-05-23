import React from 'react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from './Contractor';
import { drizzleConnect } from 'drizzle-react';
import { Fin4Colors } from './utils';
import Tooltip from '@material-ui/core/Tooltip';
import AddressDisplayWithCopy from './AddressDisplayWithCopy';
import { Link } from 'react-router-dom';

function SourcererPairInfoComponent(props) {
	const { t } = useTranslation();

	const displayAddress = address => {
		return <AddressDisplayWithCopy address={address} fontSize="xx-small" />;
	};

	const getTokenAddressOrSymbolElement = address => {
		let token = props.fin4Tokens[address];
		if (token) {
			return (
				<a href={'/token/view/' + token.symbol}>
					<small>{token.symbol}</small>
				</a>
			);
		}
		return displayAddress(address);
	};

	const displayBeneficiary = address => {
		if (address === zeroAddress) {
			return 'the PAT supplier';
		}
		return displayAddress(address);
	};

	const getTokenAddressOrSymbol = address => {
		let token = props.fin4Tokens[address];
		if (token) {
			return token.symbol;
		}
		return address;
	};

	return (
		<>
			<div style={styles.pairDiv}>
				<div style={styles.pairHeadline}>{props.pair.sourcererName} pair</div>
				<br />
				<table>
					<tbody>
						<tr>
							<td>
								<Tooltip title="Positive Action Token that can be used to convert the collateral" arrow>
									<span style={styles.leftColumn}>PAT</span>
								</Tooltip>
							</td>
							<td>{getTokenAddressOrSymbolElement(props.pair.pat)}</td>
						</tr>
						<tr>
							<td>
								<Tooltip title="Collateral token" arrow>
									<span style={styles.leftColumn}>Collateral</span>
								</Tooltip>
							</td>
							<td>{getTokenAddressOrSymbolElement(props.pair.collateral)}</td>
						</tr>
						<tr>
							<td>
								<Tooltip title="The beneficiary of the collateral upon converting it via PAT" arrow>
									<span style={styles.leftColumn}>Beneficiary</span>
								</Tooltip>
							</td>
							<td>{displayBeneficiary(props.pair.beneficiary)}</td>
						</tr>
						<tr>
							<td>
								<Tooltip
									title="The ratio by which conversion happens: transfer x PAT and x * n COLL get converted"
									arrow>
									<span style={styles.leftColumn}>Ratio</span>
								</Tooltip>
							</td>
							<td>{props.pair.exchangeRatio}</td>
						</tr>
						<tr>
							<td>
								<Tooltip title="Total collateral balance on this pair that is available for conversion" arrow>
									<span style={styles.leftColumn}>Coll. balance</span>
								</Tooltip>
							</td>
							<td>{props.pair.totalCollateralBalance}</td>
						</tr>
						<tr>
							<td>
								<Tooltip title="Total amount of PAT that was exchanged on this pair via conversion" arrow>
									<span style={styles.leftColumn}>PAT balance</span>
								</Tooltip>
							</td>
							<td>{props.pair.totalExchangedPatAmount}</td>
						</tr>
					</tbody>
				</table>
				<br />
				{props.pair.sourcererName !== 'MintingSourcerer' && (
					<>
						<Link
							to={
								'/underlying/deposit/' +
								props.pair.sourcererName +
								'/' +
								getTokenAddressOrSymbol(props.pair.pat) +
								'/' +
								getTokenAddressOrSymbol(props.pair.collateral)
							}>
							Deposit
						</Link>
						,&nbsp;
					</>
				)}
				<Link
					to={
						'/underlying/convert/' +
						props.pair.sourcererName +
						'/' +
						getTokenAddressOrSymbol(props.pair.pat) +
						'/' +
						getTokenAddressOrSymbol(props.pair.collateral)
					}>
					Convert
				</Link>
			</div>
		</>
	);
}

const styles = {
	leftColumn: {
		fontSize: 'small',
		color: 'gray',
		marginRight: '8px'
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
		border: '2px solid silver',
		padding: '15px',
		position: 'relative',
		margin: '15px 0 15px 0'
	}
};

const mapStateToProps = state => {
	return {
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(SourcererPairInfoComponent, mapStateToProps);
