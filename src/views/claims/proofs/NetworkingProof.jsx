import React, { useRef, useState } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AddressQRreader from '../../../components/AddressQRreader';
import { TextField } from '@material-ui/core';
import { isValidPublicAddress } from '../../../components/Contractor';
import Button from '../../../components/Button';
import CheckIcon from '@material-ui/icons/CheckCircle';
import { IconButton } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

function NetworkingProof(props, context) {
	const { t } = useTranslation();

	const submit = () => {
		let approver = addressValue.current;
		if (!isValidPublicAddress(approver)) {
			alert('Invalid Ethereum public address');
			return;
		}
		let content = contentValue.current;
		// TODO use new contractCall()
		context.drizzle.contracts.Networking.methods
			.submitProof(props.tokenAddr, props.claimId, approver, content)
			.send({ from: props.store.getState().fin4Store.defaultAccount })
			.then(result => {
				console.log('Results of submitting Networking.submitProof: ', result);
				setProofSubmitted(true);
			});
	};

	const addressValue = useRef(null);
	const contentValue = useRef('');
	const [proofSubmitted, setProofSubmitted] = useState(false);

	return (
		<>
			{proofSubmitted ? (
				<center>
					<Typography>Proof submitted</Typography>
					<br />
					<IconButton style={{ color: 'green', transform: 'scale(2.4)' }}>
						<CheckIcon />
					</IconButton>
					<br />
					<br />
				</center>
			) : (
				<>
					<AddressQRreader onChange={val => (addressValue.current = val)} label="Public address of approver" />
					<br />
					<div style={{ fontFamily: 'arial', color: 'gray' }}>Snippets from your interaction:</div>
					<br />
					<TextField
						multiline
						rows="2"
						fullWidth
						variant="outlined"
						onChange={e => (contentValue.current = e.target.value)}
					/>
					<br />
					<Button onClick={submit} center="true">
						Submit
					</Button>
				</>
			)}
		</>
	);
}

NetworkingProof.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(NetworkingProof);
