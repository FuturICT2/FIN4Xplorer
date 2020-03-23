import React from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import PictureUploadComponent from './PictureUploadComponent';
import { contractCall } from '../../../components/Contractor';

function PictureProof(props, context) {
	const { t } = useTranslation();

	const onSubmit = (approverAddress, ipfsHash) => {
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Picture',
			'submitProof_Picture',
			[props.tokenAddr, props.claimId, approverAddress, ipfsHash],
			'Submit picture proof'
		);
	};

	return <PictureUploadComponent onSubmit={onSubmit} />;
}

PictureProof.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(PictureProof);
