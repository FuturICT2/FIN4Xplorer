import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import CollateralInteractionComponent from './CollateralInteractionComponent';

function ConvertToCollateral(props) {
	const { t } = useTranslation();

	return (
		<Container>
			<CollateralInteractionComponent title="Convert to collateral" />
		</Container>
	);
}

export default ConvertToCollateral;
