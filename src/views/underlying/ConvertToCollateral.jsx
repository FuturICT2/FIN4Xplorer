import React from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import CollateralInteractionComponent from './CollateralInteractionComponent';
import PropTypes from 'prop-types';

function ConvertToCollateral(props, context) {
	const { t } = useTranslation();

	const convert = (data, patContractDrizzleName) => {
		// data.sourcererType, data.patAddress, data.collateralAddress, data.amount
	};

	return (
		<Container>
			<CollateralInteractionComponent
				title="Convert to collateral"
				matchParams={props.match.params}
				buttonLabel="Convert"
				contractToGetReady="patAddress"
				buttonClickedAndContractReadyCallback={(data, patContractDrizzleName) => convert(data, patContractDrizzleName)}
			/>
		</Container>
	);
}

ConvertToCollateral.contextTypes = {
	drizzle: PropTypes.object
};

export default ConvertToCollateral;
