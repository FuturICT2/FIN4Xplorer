import React from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation, composeInitialProps } from 'react-i18next';
import PropTypes from 'prop-types';
import FileUploadComponent from './FileUploadComponent';
import { contractCall } from '../../../components/Contractor';

function FileUploadProof(props, context) {
	const { t } = useTranslation();
	const onSubmit = ipfsHash => {
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			props.contractName,
			'submitProof_' + props.contractName,
			[props.tokenAddr, props.claimId, ipfsHash],
			'Submit ' + props.contractName + ' proof',
			props.callbacks
		);
	};

	return <FileUploadComponent onSubmit={onSubmit} accept={props.accept} />;
}

FileUploadProof.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(FileUploadProof);
