import React from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import PictureUploadComponent from './PictureUploadComponent';

function PictureUploadProof(props, context) {
	const { t } = useTranslation();

	const onSubmit = (approverAddress, ipfsHash) => {
		context.drizzle.contracts[props.contractName].methods['submitProof_' + props.contractName](
			props.tokenAddr,
			props.claimId,
			approverAddress,
			ipfsHash
		)
			.send({ from: props.store.getState().fin4Store.defaultAccount })
			.then(result => {
				console.log('Results of submitting: ', result);
			});
	};

	return <PictureUploadComponent onSubmit={onSubmit} />;
}

PictureUploadProof.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(PictureUploadProof);
