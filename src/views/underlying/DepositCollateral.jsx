import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import CollateralInteractionComponent from './CollateralInteractionComponent';
import PropTypes from 'prop-types';
import { drizzleConnect } from 'drizzle-react';
import { contractCall } from '../../components/Contractor';
import CheckIcon from '@material-ui/icons/CheckCircle';
import { IconButton } from '@material-ui/core';

function DepositCollateral(props, context) {
	const { t } = useTranslation();

	const [done, setDone] = useState(false);

	// Even these methods could be done in CollateralInteractionComponent with some more props to pass in.
	// I like the logic to be done here though, will see if merging makes more sense at some point.
	const deposit = (data, collateralContractDrizzleName) => {
		let defaultAccount = props.store.getState().fin4Store.defaultAccount;
		let sourcererContract = context.drizzle.contracts[data.sourcererName];
		contractCall(
			context,
			props,
			defaultAccount,
			collateralContractDrizzleName,
			'approve',
			[sourcererContract.address, data.amount],
			'Approve collateral spending',
			{
				transactionCompleted: () => {
					contractCall(
						context,
						props,
						defaultAccount,
						data.sourcererName,
						'depositCollateral',
						[data.patAddress, data.collateralAddress, data.amount],
						'Deposit collateral on ' + data.sourcererName,
						{
							transactionCompleted: () => {
								// TODO causes Error: You may not unsubscribe from a store listener while the reducer is executing
								// setDone(true);
							}
						}
					);
				}
			}
		);
	};

	return (
		<Container>
			{done ? (
				<center>
					<IconButton style={{ color: 'green', transform: 'scale(2.4)' }}>
						<CheckIcon />
					</IconButton>
				</center>
			) : (
				<CollateralInteractionComponent
					title="Deposit collateral"
					matchParams={props.match.params}
					buttonLabel="Deposit"
					contractToGetReady="collateralAddress"
					buttonClickedAndContractReadyCallback={(data, collateralContractDrizzleName) =>
						deposit(data, collateralContractDrizzleName)
					}
				/>
			)}
		</Container>
	);
}

DepositCollateral.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {};
};

export default drizzleConnect(DepositCollateral, mapStateToProps);
