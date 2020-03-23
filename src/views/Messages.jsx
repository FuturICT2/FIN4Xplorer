import React, { useEffect } from 'react';
import Box from '../components/Box';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import Button from '../components/Button';
import Photo from '@material-ui/icons/Photo';
import { Typography, Divider, Paper } from '@material-ui/core';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import { fetchMessage, contractCall } from '../components/Contractor';
import history from '../components/history';
import Container from '../components/Container';

function Messages(props, context) {
	const { t } = useTranslation();

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

	const approveRequest = (proofTypeName, pendingApprovalId) => {
		contractCall(
			context,
			props,
			props.defaultAccount,
			proofTypeName,
			'receiveApprovalFromSpecificAddress',
			pendingApprovalId,
			'Approve approval request'
		);
	};

	const rejectRequest = (proofTypeName, pendingApprovalId) => {
		contractCall(
			context,
			props,
			props.defaultAccount,
			proofTypeName,
			'receiveRejectionFromSpecificAddress',
			pendingApprovalId,
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
				return 'Info';
			case '1':
				return 'Approval Request';
			case '2':
				return 'From User';
		}
	};

	return (
		<Container>
			<Box title="Messages">
				{props.messages.filter(msg => !msg.hasBeenActedUpon && msg.messageType).length == 0 ? (
					<center style={{ fontFamily: 'arial' }}>No messages</center>
				) : (
					<>
						{props.messages
							.filter(msg => !msg.hasBeenActedUpon && msg.messageType)
							.map((msg, index) => {
								return (
									<Message key={`${msg.proofTypeName}_${msg.pendingApprovalId}_${index}`}>
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
													Requested by {msg.sender}
												</Typography>
												<br />
												{msg.attachment &&
												msg.attachment.length > 0 &&
												msg.proofTypeName !== 'Networking' && ( // TODO generic solution!
														<>
															<Button
																center="true"
																icon={Photo}
																onClick={() => window.open('https://gateway.ipfs.io/ipfs/' + msg.attachment, '_blank')}>
																Click to see the image
															</Button>
															<br />
														</>
													)}
												<center>
													<span style={{ color: 'green' }}>
														<Button
															color="inherit"
															icon={ThumbUpIcon}
															onClick={() => approveRequest(msg.proofTypeName, msg.pendingApprovalId)}>
															Approve
														</Button>
													</span>
													&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
													<span style={{ color: 'red' }}>
														<Button
															color="inherit"
															icon={ThumbDownIcon}
															onClick={() => rejectRequest(msg.proofTypeName, msg.pendingApprovalId)}>
															Reject
														</Button>
													</span>
												</center>
												<br />
											</>
										)}
										<Divider style={{ margin: '10px 0' }} variant="middle" />
										<center>
											<MsgResponseLink onClick={() => markAsRead(msg.messageId)}>MARK AS READ</MsgResponseLink>
											{msg.messageType !== '0' && (
												<>
													&nbsp;&nbsp;&nbsp;
													<MsgResponseLink
														onClick={() => {
															history.push('/user/message/' + msg.sender);
														}}>
														REPLY
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
