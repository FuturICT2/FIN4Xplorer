import React, { useEffect, useState } from 'react';
import Box from '../components/Box';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import Button from '../components/Button';
import Photo from '@material-ui/icons/Photo';
import { Typography, Divider, Paper, TextField } from '@material-ui/core';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import { fetchMessage, contractCall } from '../components/Contractor';
import history from '../components/history';
import Container from '../components/Container';
import ipfs from '../config/ipfs';

function Messages(props, context) {
	const { t } = useTranslation();

	const [attachedMessage, setAttachedMessage] = useState('');

	useEffect(() => {
		// missing messageType = indicator that this is only a message stub
		// TODO shield against too many calls?
		props.messages
			.filter(msg => !msg.messageType)
			.map(msg => {
				fetchMessage(
					context.drizzle.contracts.Fin4Messaging,
					props.store.getState().fin4Store.defaultAccount,
					msg.messageId
				).then(message => {
					props.dispatch({
						type: 'UPDATE_STUB_MESSAGE',
						message: message
					});
				});
			});
	});

	const approveRequest = (verifierContractName, pendingApprovalId) => {
		contractCall(
			context,
			props,
			props.defaultAccount,
			verifierContractName,
			'receiveApprovalFromSpecificAddress',
			[pendingApprovalId, attachedMessage],
			'Approve approval request'
		);
	};

	const rejectRequest = (verifierContractName, pendingApprovalId) => {
		contractCall(
			context,
			props,
			props.defaultAccount,
			verifierContractName,
			'receiveRejectionFromSpecificAddress',
			[pendingApprovalId, attachedMessage],
			'Reject approval request'
		);
	};

	const markAsRead = messageId => {
		contractCall(
			context,
			props,
			props.defaultAccount,
			'Fin4Messaging',
			'markMessageAsActedUpon',
			[props.defaultAccount, messageId],
			'Mark message as read'
		);
	};

	const getIntroText = messageType => {
		switch (messageType) {
			case '0':
				return t('messages.types.info');
			case '1':
				return t('messages.types.approval-request');
			case '2':
				return t('messages.types.from-user');
		}
	};

	const downloadImage = ipfsHash => {
		// make it work via ipfs.get() instead?
		fetch('https://gateway.ipfs.io/ipfs/' + ipfsHash).then(response =>
			response.text().then(base64 => {
				let beginning = base64.substring(0, 15); // data:image/jpeg;base64,...
				let extension = 'unknown';
				if (beginning.includes('jpeg')) {
					extension = 'jpeg';
				}
				if (beginning.includes('png')) {
					extension = 'png';
				}
				let a = document.createElement('a');
				a.href = base64;
				a.download = ipfsHash + '.' + extension;
				a.click();
			})
		);
	};

	return (
		<Container>
			<Box title={t('messages.box-title')}>
				{props.messages.filter(msg => !msg.hasBeenActedUpon && msg.messageType).length == 0 ? (
					<center style={{ fontFamily: 'arial' }}>{t('messages.no-messages')}</center>
				) : (
					<>
						{props.messages
							.filter(msg => !msg.hasBeenActedUpon && msg.messageType)
							.map((msg, index) => {
								return (
									<Message key={`${msg.verifierContractName}_${msg.pendingApprovalId}_${index}`}>
										<span style={{ color: 'gray' }}>
											<Typography color="inherit" variant="body2">
												<b>{getIntroText(msg.messageType).toUpperCase()}</b>
											</Typography>
										</span>
										<Typography color="textSecondary" variant="body2">
											{msg.message}
										</Typography>
										{/* Fin4Messaging.sol: enum MessageType { INFO, APPROVAL, USER2USER } */}
										{msg.messageType === '1' && (
											<>
												<Divider style={{ margin: '10px 0' }} variant="middle" />
												<Typography color="textSecondary" variant="body2">
													{t('messages.requested-by', { user: msg.sender })}
												</Typography>
												<br />
												{msg.attachment &&
												msg.attachment.length > 0 &&
												msg.verifierContractName !== 'Networking' && ( // TODO generic solution!
														<Button center="true" icon={Photo} onClick={() => downloadImage(msg.attachment)}>
															{t('messages.click-to-see-image')}
														</Button>
													)}
												<TextField
													key="approve-reject-message"
													type="text"
													label={t('messages.attach-message-optional')}
													value={attachedMessage}
													onChange={e => setAttachedMessage(e.target.value)}
													style={inputFieldStyle}
												/>
												<center>
													<span style={{ color: 'green' }}>
														<Button
															color="inherit"
															icon={ThumbUpIcon}
															onClick={() => approveRequest(msg.verifierContractName, msg.pendingApprovalId)}>
															{t('messages.approve-button')}
														</Button>
													</span>
													&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
													<span style={{ color: 'red' }}>
														<Button
															color="inherit"
															icon={ThumbDownIcon}
															onClick={() => rejectRequest(msg.verifierContractName, msg.pendingApprovalId)}>
															{t('messages.reject-button')}
														</Button>
													</span>
												</center>
												<br />
											</>
										)}
										<Divider style={{ margin: '10px 0' }} variant="middle" />
										<center>
											<MsgResponseLink onClick={() => markAsRead(msg.messageId)}>
												{t('messages.mark-as-read-button')}
											</MsgResponseLink>
											{msg.messageType !== '0' && (
												<>
													&nbsp;&nbsp;&nbsp;
													<MsgResponseLink
														onClick={() => {
															history.push('/user/message/' + msg.sender);
														}}>
														{t('messages.reply-button')}
													</MsgResponseLink>
												</>
											)}
										</center>
									</Message>
								);
							})}
					</>
				)}
			</Box>
		</Container>
	);
}

const MsgResponseLink = styled.a`
	font-family: arial;
	color: gray;
	font-size: small;
	text-decoration: underline;
`;

const Message = styled(Paper)`
	&& {
		box-sizing: border-box;
		margin: 15px 0;
		padding: 15px;
		background: rgba(0, 0, 0, 0.07);
	}
`;

const inputFieldStyle = {
	width: '100%',
	marginBottom: '25px'
};

Messages.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		defaultAccount: state.fin4Store.defaultAccount,
		messages: state.fin4Store.messages
	};
};

export default drizzleConnect(Messages, mapStateToProps);
