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
			<Box title="Edit group">
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
								<span>You are the creator of this group</span>
							) : (
								<span style={{ color: 'red' }}>You have no editing rights for this group</span>
							)}
						</>
					)}
				</center>
			</Box>
			{groupData.creator !== null && groupData.creator !== zeroAddress && groupData.userIsCreator && (
				<>
					<Box title="Edit members">
						<Table headers={['Member', 'Action']} colWidths={[85, 15]}>
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
													Remove {memberAddress === user ? 'yourself' : ''}
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
									<small>Removing yourself as member does not change your ownership of this group</small>
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
							<FormControlLabel value="addOne" control={<Radio />} label="Add a member" />
							<FormControlLabel value="addMultiple" control={<Radio />} label="Add multiple members" />
						</RadioGroup>
						<br />
						{addMemberMode === 'addOne' ? (
							<AddressQRreader
								onChange={val => (newMembersString.current = val)}
								label="Public address of new member"
							/>
						) : (
							<>
								<TextField
									label="Public addresses, comma separated"
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
							<Button onClick={() => addMembers()}>Add</Button>
						</center>
						<br />
					</Box>
					<Box title="Transfer ownership">
						<br />
						<center style={{ fontFamily: 'arial' }}>
							{ownershipExpanded && (
								<>
									<AddressQRreader
										onChange={val => (newOwnerAddress.current = val)}
										label="Public address of new group owner"
									/>
									<br />
									<span style={{ color: 'red' }}>You won't be able to edit this group anymore</span>
									<br />
									<br />
								</>
							)}
							<Button onClick={() => transferOwnership()}>Transfer ownership</Button>
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
