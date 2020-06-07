import React, { useState, useRef, useEffect } from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import PropTypes from 'prop-types';
import { getContractData, zeroAddress, isValidPublicAddress, contractCall } from '../../components/Contractor';
import Table from '../../components/Table';
import TableRow from '../../components/TableRow';
import { Radio, RadioGroup, FormControlLabel, TextField } from '@material-ui/core';
import AddressQRreader from '../../components/AddressQRreader';
import Button from '../../components/Button';

function GroupEdit(props, context) {
	const { t } = useTranslation();

	const groupsContractReady = useRef(false);
	const [groupId, setGroupId] = useState(null);
	const [groupData, setGroupData] = useState({
		creator: null,
		members: [],
		name: null,
		userIsCreator: null,
		userIsMember: null
	});
	const [addMemberMode, setAddMemberMode] = useState('addOne');
	const newMembersString = useRef('');

	const [ownershipExpanded, setOwnershipExpanded] = useState(false);
	const newOwnerAddress = useRef(null);

	useEffect(() => {
		let groupIdViaURL = props.match.params.groupId;
		if (!groupId && groupIdViaURL) {
			setGroupId(groupIdViaURL);
		}

		if (
			groupId &&
			!groupsContractReady.current &&
			props.contracts.Fin4Groups &&
			props.contracts.Fin4Groups.initialized
		) {
			groupsContractReady.current = true;
			fetchGroup(groupId);
		}
	});

	const fetchGroup = gId => {
		let defaultAccount = props.store.getState().fin4Store.defaultAccount;
		getContractData(context.drizzle.contracts.Fin4Groups, defaultAccount, 'getGroup', gId).then(
			({ 0: creator, 1: members, 2: name }) => {
				setGroupData({
					creator: creator,
					members: members,
					name: name,
					userIsCreator: creator === defaultAccount,
					userIsMember: members.filter(m => m === defaultAccount).length > 0
				});
			}
		);
	};

	const removeMember = address => {
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Groups',
			'removeMember',
			[groupId, address, false],
			'Remove user from group'
		);
	};

	const addMembers = () => {
		if (!newMembersString.current || newMembersString.current.length === 0) {
			alert('No public addresses found');
			return;
		}
		let addresses = newMembersString.current.split(',').map(str => str.trim());
		for (let i = 0; i < addresses.length; i++) {
			if (!isValidPublicAddress(addresses[i])) {
				alert('Contains invalid public addresses: ' + addresses[i]);
				return;
			}
		}
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Groups',
			'addMembers',
			[groupId, addresses],
			'Add members to group'
		);
	};

	const transferOwnership = () => {
		if (!ownershipExpanded) {
			setOwnershipExpanded(true);
			return;
		}
		if (!isValidPublicAddress(newOwnerAddress.current)) {
			alert('Invalid Ethereum public address');
			return;
		}
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Groups',
			'transferOwnership',
			[groupId, newOwnerAddress.current],
			'Transfer group ownership'
		);
	};

	return (
		<Container>
			<Box title={t('groups.edit.group.box-title')}>
				<center style={{ fontFamily: 'arial' }}>
					{groupData.creator === null ? (
						<span>Loading...</span>
					) : groupData.creator === zeroAddress ? (
						<span style={{ color: 'red' }}>Invalid group ID: {groupId}</span>
					) : (
						<>
							<span style={{ fontSize: 'x-large' }}>
								<b>{groupData.name}</b>
							</span>
							<br />
							<br />
							{groupData.userIsCreator ? (
								<span>{t('groups.edit.group.user-is-creator')}</span>
							) : (
								<span style={{ color: 'red' }}>{t('groups.edit.group.no-edit-rights')}</span>
							)}
						</>
					)}
				</center>
			</Box>
			{groupData.creator !== null && groupData.creator !== zeroAddress && groupData.userIsCreator && (
				<>
					<Box title={t('groups.edit.members.box-title')}>
						<Table headers={[t('groups.columns.member'), t('groups.columns.action')]} colWidths={[85, 15]}>
							{groupData.members.map((memberAddress, index) => {
								let user = props.store.getState().fin4Store.defaultAccount;
								return (
									<TableRow
										key={'member_' + index}
										data={{
											member: <small>{memberAddress}</small>,
											actions: (
												<small
													onClick={() => removeMember(memberAddress)}
													style={{ color: 'blue', textDecoration: 'underline' }}>
													{t('groups.edit.members.remove-user', {
														user: memberAddress === user ? t('groups.edit.members.yourself') : ''
													})}
												</small>
											)
										}}
									/>
								);
							})}
						</Table>
						<br />
						{groupData.userIsMember && (
							<>
								<center style={{ fontFamily: 'arial', color: 'gray' }}>
									<small>{t('groups.user-is-member.remove-yourself-hint')}</small>
								</center>
								<br />
							</>
						)}
						<RadioGroup
							row={true}
							onChange={e => {
								setAddMemberMode(e.target.value);
								newMembersString.current = '';
							}}
							value={addMemberMode}>
							<FormControlLabel value="addOne" control={<Radio />} label={t('groups.edit.members.add-one')} />
							<FormControlLabel value="addMultiple" control={<Radio />} label={t('groups.edit.members.add-multiple')} />
						</RadioGroup>
						<br />
						{addMemberMode === 'addOne' ? (
							<AddressQRreader
								onChange={val => (newMembersString.current = val)}
								label={t('groups.edit.members.new-member-address')}
							/>
						) : (
							<>
								<TextField
									label={t('groups.edit.members.new-members-addresses')}
									multiline
									rows="4"
									fullWidth
									variant="outlined"
									onChange={e => (newMembersString.current = e.target.value)}
								/>
								<br />
							</>
						)}
						<br />
						<center>
							<Button onClick={() => addMembers()}>{t('groups.edit.members.add-button')}</Button>
						</center>
						<br />
					</Box>
					<Box title={t('groups.edit.ownership.box-title')}>
						<br />
						<center style={{ fontFamily: 'arial' }}>
							{ownershipExpanded && (
								<>
									<AddressQRreader
										onChange={val => (newOwnerAddress.current = val)}
										label={t('groups.edit.ownership.new-owner-address')}
									/>
									<br />
									<span style={{ color: 'red' }}>{t('groups.edit.ownership.no-edit-hint')}</span>
									<br />
									<br />
								</>
							)}
							<Button onClick={() => transferOwnership()}>{t('groups.edit.ownership.transfer-button')}</Button>
						</center>
						<br />
					</Box>
				</>
			)}
		</Container>
	);
}

GroupEdit.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts
	};
};

export default drizzleConnect(GroupEdit, mapStateToProps);
