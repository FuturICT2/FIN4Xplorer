import React, { useState, useEffect, useRef } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import Box from '../../components/Box';
import PropTypes from 'prop-types';
import Button from '../../components/Button';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import Dropdown from '../../components/Dropdown';
import { Link } from 'react-router-dom';
import Table from '../../components/Table';
import TableRow from '../../components/TableRow';
import Currency from '../../components/Currency';
import Modal from '../../components/Modal';
import TextField from '@material-ui/core/TextField';
import { isValidPublicAddress, contractCall } from '../../components/Contractor';
import AddressQRreader from '../../components/AddressQRreader';

function CollectionEdit(props, context) {
	const { t } = useTranslation();

	const [collection, setCollection] = useState(null);
	const tokensToAddArr = useRef(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const groupIdViaModal = useRef(null);

	const [ownershipExpanded, setOwnershipExpanded] = useState(false);
	const newOwnerAddress = useRef(null);

	const toggleModal = () => {
		setIsModalOpen(!isModalOpen);
	};

	useEffect(() => {
		let collIdentifier = props.match.params.collectionIdentifier;
		if (collIdentifier && !collection) {
			let coll = props.collections[collIdentifier];
			if (coll) {
				setCollection(coll);
				// TODO fetch admins
			}
		}
	});

	const collectionContainsToken = tokenAddr => {
		for (let i = 0; i < collection.tokens.length; i++) {
			if (tokenAddr === collection.tokens[i]) {
				return true;
			}
		}
		return false;
	};

	const getFormattedTokensNotYetInCollection = () => {
		return Object.keys(props.fin4Tokens)
			.filter(tokenAddr => !collectionContainsToken(tokenAddr))
			.map(tokenAddr => {
				let token = props.fin4Tokens[tokenAddr];
				return {
					value: token.address,
					label: token.name,
					symbol: token.symbol
				};
			});
	};

	const addTokens = () => {
		if (!tokensToAddArr.current || tokensToAddArr.current.length === 0) {
			alert('No tokens selected');
			return;
		}
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Collections',
			'addTokens',
			[collection.collectionId, tokensToAddArr.current],
			'Add tokens to collection'
		);
	};

	const removeToken = tokenToRemove => {
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Collections',
			'removeToken',
			[collection.collectionId, tokenToRemove],
			'Remove token from collection'
		);
	};

	const setAdminGroup = () => {
		toggleModal();
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Collections',
			'setAdminGroupId',
			[collection.collectionId, groupIdViaModal.current],
			'Set admin group'
		);
	};

	const removeAdminGroup = () => {
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Collections',
			'removeAdminGroup',
			[collection.collectionId],
			'Remove admin group'
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
			'Fin4Collections',
			'transferOwnership',
			[collection.collectionId, newOwnerAddress.current],
			'Transfer collection ownership'
		);
	};

	return (
		<>
			{collection && (
				<Container>
					<Box title={t('collections.edit.box-title')}>
						<center style={{ fontFamily: 'arial' }}>
							<b style={{ fontSize: 'large' }}>{collection.name}</b>
							<br />
							<br />
							<Link to={'/collection/' + collection.identifier}>{t('collections.edit.view-button')}</Link>
							<br />
							<br />
							{!(collection.userIsCreator || collection.userIsAdmin) && (
								<span style={{ color: 'red' }}>{t('collections.edit.no-edit-rights')}</span>
							)}
							{collection.userIsCreator && <span>{t('collections.edit.user-is-creator')}</span>}
							{!collection.userIsCreator && collection.userIsAdmin && (
								<span>{t('collections.edit.user-is-admin', { groupId: collection.adminGroupId })}</span>
							)}
						</center>
					</Box>
					{collection.userIsAdmin && (
						<Box title={t('collections.edit.tokens.box-title')}>
							<Table
								headers={[t('collections.edit.tokens.token-column'), t('collections.edit.tokens.action-column')]}
								colWidths={[85, 15]}>
								{collection.tokens.map((tokenAddress, index) => {
									let token = props.fin4Tokens[tokenAddress];
									if (!token) {
										return;
									}
									return (
										<TableRow
											key={'token_' + index}
											data={{
												token: <Currency name={token.name} symbol={token.symbol} />,
												actions: (
													<small
														onClick={() => removeToken(tokenAddress)}
														style={{ color: 'blue', textDecoration: 'underline' }}>
														{t('collections.edit.tokens.remove-button')}
													</small>
												)
											}}
										/>
									);
								})}
							</Table>
							<br />
							<br />
							<center>
								<br />
								<Dropdown
									key="add_tokens_select"
									multipleChoice
									onChange={e => (tokensToAddArr.current = e === null ? null : e.map(el => el.value))}
									options={getFormattedTokensNotYetInCollection()}
								/>
								<Button icon={AddIcon} onClick={() => addTokens()}>
									{t('collections.edit.tokens.add-button')}
								</Button>
								<br />
								<br />
							</center>
						</Box>
					)}
					{collection.userIsCreator && (
						<>
							<Box title={t('collections.edit.admins.box-title')}>
								<center style={{ fontFamily: 'arial' }}>
									<br />
									<Modal
										isOpen={isModalOpen}
										handleClose={toggleModal}
										title={t('collections.edit.admins.modal-title')}
										width="350px">
										<center>
											<TextField
												key="groupId-field"
												type="number"
												label={t('collections.edit.admins.group-id-field')}
												onChange={e => (groupIdViaModal.current = e.target.value)}
												style={inputFieldStyle}
											/>
											<br />
											<Button onClick={setAdminGroup}>{t('collections.edit.admins.submit-button')}</Button>
											<br />
										</center>
									</Modal>
									{collection.adminGroupIsSet ? (
										<>
											{t('collections.edit.admins.group-id')}: <b>{collection.adminGroupId}</b>
											<br />
											<br />
											<Button icon={EditIcon} onClick={toggleModal}>
												{t('collections.edit.admins.change-button')}
											</Button>
											<br />
											<br />
											<Button icon={DeleteIcon} onClick={removeAdminGroup}>
												{t('collections.edit.admins.remove-button')}
											</Button>
										</>
									) : (
										<>
											<Button icon={AddIcon} onClick={toggleModal}>
												{t('collections.edit.admins.select-group-button')}
											</Button>
										</>
									)}
									<br />
									<br />
								</center>
							</Box>
							<Box title={t('collections.edit.ownership.box-title')}>
								<br />
								<center style={{ fontFamily: 'arial' }}>
									{ownershipExpanded && (
										<>
											<AddressQRreader
												onChange={val => (newOwnerAddress.current = val)}
												label={t('collections.edit.ownership.new-owner-address')}
											/>
											<br />
											<span style={{ color: 'red' }}>{t('collections.edit.ownership.no-edit-hint')}</span>
											<br />
											<br />
										</>
									)}
									<Button onClick={() => transferOwnership()}>{t('collections.edit.ownership.transfer-button')}</Button>
								</center>
								<br />
							</Box>
						</>
					)}
				</Container>
			)}
		</>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

CollectionEdit.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {
		collections: state.fin4Store.collections,
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(CollectionEdit, mapStateToProps);
