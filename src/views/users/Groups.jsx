import React, { useState, useRef, useEffect } from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import PropTypes from 'prop-types';
import { TextField, Checkbox, FormControlLabel } from '@material-ui/core';
import Button from '../../components/Button';
import { getContractData, contractCall } from '../../components/Contractor';
import Table from '../../components/Table';
import TableRow from '../../components/TableRow';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';

function Groups(props, context) {
	const { t } = useTranslation();
	const groupsContractReady = useRef(false);
	const [showHint, setShowHint] = useState(false);
	const [groups, setGroups] = useState([]);
	const values = useRef({
		name: null,
		addCreator: false
	});
	// leave group checkbox about notifying group owner
	const [isLeaveGroupModalOpen, setIsLeaveGroupModalOpen] = useState(false);
	const leaveGroupValues = useRef({
		groupId: null,
		notifyOwner: false
	});
	const toggleLeaveGroupModal = () => {
		setIsLeaveGroupModalOpen(!isLeaveGroupModalOpen);
	};

	useEffect(() => {
		if (!groupsContractReady.current && props.contracts.Fin4Groups && props.contracts.Fin4Groups.initialized) {
			groupsContractReady.current = true;
			fetchGroups();
		}
	});

	const fetchGroups = () => {
		let defaultAccount = props.store.getState().fin4Store.defaultAccount;
		getContractData(context.drizzle.contracts.Fin4Groups, defaultAccount, 'getGroupsInfo').then(
			({ 0: userIsCreatorArr, 1: userIsMemberArr }) => {
				let groupsArr = [];
				for (let i = 0; i < userIsCreatorArr.length; i++) {
					let userIsCreator = userIsCreatorArr[i];
					let userIsMember = userIsMemberArr[i];
					if (userIsCreator || userIsMember) {
						groupsArr.push({
							groupId: i,
							userIsCreator: userIsCreator,
							userIsMember: userIsMember,
							name: null,
							creator: null
						});
					}
				}
				let promises = [];
				for (let i = 0; i < groupsArr.length; i++) {
					promises.push(
						getContractData(
							context.drizzle.contracts.Fin4Groups,
							defaultAccount,
							'getGroupNameAndCreator',
							groupsArr[i].groupId
						).then(({ 0: groupName, 1: groupCreator }) => {
							groupsArr[i].name = groupName;
							groupsArr[i].creator = groupCreator;
						})
					);
				}
				// TODO multiple setGroups would be nicer to show stuff early and let names load asynchron
				// didn't figure it out in reasonable time though
				Promise.all(promises).then(() => setGroups(groupsArr));
			}
		);
	};

	const submitNewGroup = () => {
		let val = values.current;
		if (val.name === null || val.name.length < 3) {
			alert('Group name invalid');
			return;
		}
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Groups',
			'createGroup',
			[val.name, val.addCreator],
			'Create group'
		);
	};

	const removeUsersMembership = () => {
		let groupId = leaveGroupValues.current.groupId;
		let notifyOwner = leaveGroupValues.current.notifyOwner;
		let defaultAccount = props.store.getState().fin4Store.defaultAccount;
		contractCall(
			context,
			props,
			defaultAccount,
			'Fin4Groups',
			'removeMember',
			[groupId, defaultAccount, notifyOwner],
			'Remove user from group'
		);
	};

	return (
		<Container>
			<Box title={t('groups.create-new.box-title')}>
				<TextField
					key="name-field"
					type="text"
					label={t('groups.create-new.group-name-field')}
					onChange={e => (values.current.name = e.target.value)}
					style={inputFieldStyle}
				/>
				<FormControlLabel
					control={
						<Checkbox
							key="addCreator-field"
							onChange={() => {
								values.current.addCreator = !values.current.addCreator;
							}}
						/>
					}
					label={<span style={{ color: 'gray' }}>{t('groups.create-new.add-yourself-checkbox')}</span>}
				/>
				<Button onClick={submitNewGroup} center="true">
					{t('groups.create-new.submit-button')}
				</Button>
				{showHint && (
					<center style={{ color: 'gray', fontFamily: 'arial' }}>{t('groups.create-new.reload-hint')}</center>
				)}
			</Box>
			{groups.filter(group => group.userIsCreator).length > 0 && (
				<Box title={t('groups.created-by-user.box-title')}>
					<Table
						headers={[t('groups.columns.group-name'), t('groups.columns.group-id'), t('groups.columns.action')]}
						colWidths={[75, 10, 15]}>
						{groups
							.filter(g => g.userIsCreator)
							.map((group, index) => {
								return (
									<TableRow
										key={'groupCreator_' + index}
										data={{
											name: group.name,
											id: group.groupId,
											actions: (
												<small style={{ color: 'blue', textDecoration: 'underline' }}>
													<Link to={'/users/group/edit/' + group.groupId}>Edit</Link>
												</small>
											)
										}}
									/>
								);
							})}
					</Table>
				</Box>
			)}
			{groups.filter(group => group.userIsMember).length > 0 && (
				<Box title={t('groups.user-is-member.box-title')}>
					<Table
						headers={[t('groups.columns.group-name'), t('groups.columns.group-id'), t('groups.columns.action')]}
						colWidths={[64, 5, 31]}>
						{groups
							.filter(g => g.userIsMember)
							.map((group, index) => {
								return (
									<TableRow
										key={'groupMember_' + index}
										// TODO leave group option, checkbox if inform group owner about you leaving or not
										data={{
											name: group.name,
											id: group.groupId,
											actions: (
												<>
													{group.userIsCreator ? (
														<small>{t('groups.user-is-member.user-is-owner')}</small>
													) : (
														<small style={{ color: 'blue', textDecoration: 'underline' }}>
															<Link to={'/user/message/' + group.creator}>
																{t('groups.user-is-member.message-owner')}
															</Link>
														</small>
													)}
													<br />
													<small
														title={group.userIsCreator ? t('groups.user-is-member.remove-yourself-hint') : ''}
														style={{ color: 'blue', textDecoration: 'underline' }}
														onClick={() => {
															leaveGroupValues.current.groupId = group.groupId;
															if (group.userIsCreator) {
																removeUsersMembership(group.groupId);
															} else {
																toggleLeaveGroupModal();
															}
														}}>
														Leave group
													</small>
												</>
											)
										}}
									/>
								);
							})}
					</Table>
				</Box>
			)}
			<Modal isOpen={isLeaveGroupModalOpen} handleClose={toggleLeaveGroupModal} title="Leave group" width="350px">
				<FormControlLabel
					control={
						<Checkbox
							onChange={() => {
								leaveGroupValues.current.notifyOwner = !leaveGroupValues.current.notifyOwner;
							}}
						/>
					}
					label="Notify the group owner"
				/>
				<Button
					onClick={() => {
						toggleLeaveGroupModal();
						removeUsersMembership();
					}}
					center="true">
					Submit
				</Button>
			</Modal>
		</Container>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

Groups.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts
	};
};

export default drizzleConnect(Groups, mapStateToProps);
