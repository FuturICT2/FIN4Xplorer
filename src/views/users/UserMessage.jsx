import React, { useState, useEffect, useRef } from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import Button from '../../components/Button';
import TextField from '@material-ui/core/TextField';
import MessageIcon from '@material-ui/icons/Message';
import AddressQRreader from '../../components/AddressQRreader';
import { isValidPublicAddress, contractCall } from '../../components/Contractor';
import PropTypes from 'prop-types';

function UserMessage(props, context) {
	const { t } = useTranslation();

	const [userAddressViaURL, setUserAddressViaURL] = useState(null);
	const msgText = useRef('');
	const addressValue = useRef('');

	useEffect(() => {
		let userAddress = props.match.params.userAddress;
		if (userAddress && !userAddressViaURL) {
			setUserAddressViaURL(userAddress);
		}
	});

	const sendMessage = () => {
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Messaging',
			'addUserMessage',
			[addressValue.current, msgText.current],
			'Send message to user'
		);
	};

	return (
		<Container>
			<Box title="Send message to user">
				<center>
					<AddressQRreader
						initialValue={userAddressViaURL}
						onChange={val => (addressValue.current = val)}
						label="Public address of message-receiver"
					/>
					<br />
					<TextField
						label="Message text"
						multiline
						rows="4"
						fullWidth
						variant="outlined"
						onChange={e => (msgText.current = e.target.value)}
					/>
					<br />
					<small style={{ color: 'gray', fontFamily: 'arial' }}>
						Note that messages are <i>not</i> encrypted. With some effort they can be retrieved in plain text from the
						blockchain.
					</small>
					<br />
					<br />
					<Button
						icon={MessageIcon}
						onClick={() => {
							if (!isValidPublicAddress(addressValue.current)) {
								alert('Invalid Ethereum public address');
								return;
							}
							sendMessage();
						}}>
						Send
					</Button>
					<br />
					<br />
				</center>
			</Box>
		</Container>
	);
}

UserMessage.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(UserMessage);
