import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import CollateralInteractionComponent from './CollateralInteractionComponent';
import PropTypes from 'prop-types';

function DepositCollateral(props, context) {
	const { t } = useTranslation();

	const deposit = (data, collateralContractDrizzleName) => {
		// data.sourcererType, data.patAddress, data.collateralAddress, data.amount
	};

	return (
		<Container>
			<CollateralInteractionComponent
				title="Deposit collateral"
				matchParams={props.match.params}
				buttonLabel="Deposit"
				contractToGetReady="collateralAddress"
				buttonClickedAndContractReadyCallback={(data, collateralContractDrizzleName) =>
					deposit(data, collateralContractDrizzleName)
				}
			/>
		</Container>
	);
}

DepositCollateral.contextTypes = {
	drizzle: PropTypes.object
};

export default DepositCollateral;
