import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import CollateralInteractionComponent from './CollateralInteractionComponent';

function DepositCollateral(props) {
	const { t } = useTranslation();

	return (
		<Container>
			<CollateralInteractionComponent
				title="Deposit collateral"
				matchParams={props.match.params}
				buttonLabel="Deposit"
				submitCallback={() => {}}
			/>
		</Container>
	);
}

export default DepositCollateral;
