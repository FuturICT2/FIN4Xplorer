import React from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import PictureUploadComponent from './PictureUploadComponent';
import { contractCall } from '../../../components/Contractor';

function PictureUploadProof(props, context) {
	const { t } = useTranslation();

	const onSubmit = (approverAddress, ipfsHash) => {
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Verifying',
			'submitProof_' + props.contractName,
			[props.tokenAddr, props.claimId, props.contractName, approverAddress, ipfsHash],
			'Submit ' + props.contractName + ' proof',
			props.callbacks
		);
	};

	return <PictureUploadComponent onSubmit={onSubmit} />;
}

PictureUploadProof.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(PictureUploadProof);
