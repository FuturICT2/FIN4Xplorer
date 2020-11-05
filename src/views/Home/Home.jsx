import React, { useState, useEffect, useRef } from 'react';
import { drizzleConnect } from 'drizzle-react';
import Container from '../../components/Container';
import Box from '../../components/Box';
import { useTranslation } from 'react-i18next';
import UsersIcon from '@material-ui/icons/Group';
import CollectionsIcon from '@material-ui/icons/CollectionsBookmark';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import MessageIcon from '@material-ui/icons/Message';
import EmailIcon from '@material-ui/icons/Email';
import StarIcon from '@material-ui/icons/Star';
import TokenBalances from '../../components/TokenBalances';
import SettingsIcon from '@material-ui/icons/SettingsOutlined';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import BuildIcon from '@material-ui/icons/Build';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import AssignmentIcon from '@material-ui/icons/Assignment';
import SendIcon from '@material-ui/icons/Send';
import ConvertIcon from '@material-ui/icons/SwapHoriz';
import DepositIcon from '@material-ui/icons/SaveAlt';
import { buildIconLabelLink, buildIconLabelCallback, TCRactive, UnderlyingsActive } from '../../components/utils';
import AddressDisplayWithCopy from '../../components/AddressDisplayWithCopy';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import Modal from '../../components/Modal';
import { contractCall, getContractData, readOnlyCall } from '../../components/Contractor';
import { Link } from 'react-router-dom';

let config = null;
try {
	config = require('../../config/config.json');
} catch (err) {
	console.log('config.json not found');
}

const axios = require('axios');
const showDevButton = false;

function Home(props, context) {
	const { t } = useTranslation();

	const [faucetRequestPending, setFaucetRequestPending] = useState(false);
	const [iconIsHovered, setIconHovered] = useState(false);
	const [isQRModalOpen, setQRModalOpen] = useState(false);
	const [isBecomeVoterModalActive, setisBecomeVoterModalActive] = useState(false);
	const [isBecomeVoterTabActive, setisBecomeVoterTabActive] = useState(false);
	const style = { textDecoration: 'none' };
	const homeReady = useRef(false);
	const toggleQRModal = () => {
		setQRModalOpen(!isQRModalOpen);
	};
	const toggleBecomeVoterModalActive = () => {
		setisBecomeVoterModalActive(!isBecomeVoterModalActive);
	};
	const [isEligibleToBeAVoter, setIsEligibleToBeAVoter] = useState(false);

	const requestEther = () => {
		let recipient = props.defaultAccount;
		let networkID = window.ethereum.networkVersion;
		let encodedURL = config.FAUCET_SERVER_URL + '/faucet?recipient=' + recipient + '&networkID=' + networkID;
		console.log('Calling faucet server: ' + encodedURL);
		setFaucetRequestPending(true);
		axios
			.get(encodedURL)
			.then(response => {
				console.log('Successfully called faucet server. Response: ' + response.data);
				alert(response.data);
			})
			.catch(error => {
				console.log('Error calling faucet server', error);
				alert(t('home.on-the-blockchain.request-ether.error'));
			})
			.finally(() => {
				setFaucetRequestPending(false);
			});
	};

	const dev = () => {
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Main',
			'dev',
			3,
			'dev method call',
			{
				transactionCompleted: () => {
					console.log('--> transactionCompleted callback');
				},
				transactionFailed: () => {
					console.log('--> transactionFailed callback');
				},
				dryRunSucceeded: () => {
					console.log('--> dryRunSucceeded callback');
				},
				dryRunFailed: () => {
					console.log('--> dryRunFailed callback');
				}
			}
		);
	};

	const isEligible = () => {
		let res = readOnlyCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Voting',
			'isEligibleToBeAVoter',
			[],
			'I want to be a voter',
			{},
			false,
			false
		);
		Promise.all(res).then(result => {
			// console.log(result[0]);
			setIsEligibleToBeAVoter(result[0]);
		});
	};

	useEffect(() => {
		if (props.contracts.Fin4Voting && props.contracts.Fin4Voting.initialized && !homeReady.current) {
			homeReady.current = true;
			isEligible();
		}
	});

	const submitClaim = () => {
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Voting',
			'becomeVoter',
			[],
			'I want to be a voter',
			{
				transactionCompleted: receipt => {
					console.log('You are a voter now!');
					let promises = [];
					promises.push(receipt.status);
					Promise.all(promises).then(() => setIsEligibleToBeAVoter(false));
				},
				transactionFailed: reason => {
					console.log("We couldn't enroll you on the list of voters because: " + reason);
				}
			}
		);
	};

	return (
		<Container>
			<TokenBalances />
			<Box title={t('home.on-the-blockchain.box-title')}>
				{' '}
				<p style={{ fontFamily: 'arial' }}>
					{t('home.on-the-blockchain.your-public-address')}:
					<br />
					<span style={{ fontSize: 'x-small' }}>
						{!window.web3 ? (
							t('home.on-the-blockchain.info-not-yet-available')
						) : (
							<AddressDisplayWithCopy address={props.defaultAccount} />
						)}
					</span>
				</p>
				<div style={{ fontFamily: 'arial' }}>
					{t('home.on-the-blockchain.users-balance') + ': '}
					{props.usersEthBalance === null
						? t('home.on-the-blockchain.info-not-yet-available')
						: // TODO dynamic rounding / unit?
						  `${Math.round(props.usersEthBalance * 1000) / 1000} ETH`}
				</div>
				{window.web3 && props.usersEthBalance === 0 && (
					<div style={{ fontFamily: 'arial', color: 'red' }}>
						<small>{t('home.on-the-blockchain.no-ether-warning')}</small>
					</div>
				)}
				{(props.usersEthBalance === null || props.usersEthBalance === 0) && (
					<div style={{ fontFamily: 'arial', color: 'red' }}>
						<small>{t('home.on-the-blockchain.right-network-warning')}</small>
					</div>
				)}
				{config && config.FAUCET_SERVER_URL && (
					<>
						<br />
						{faucetRequestPending ? (
							<>
								<CircularProgress size={20} style={{ color: '#695EAD' }} />
								&nbsp;&nbsp;
								<small style={{ fontFamily: 'arial', color: 'gray' }}>
									{t('home.on-the-blockchain.request-ether.pending')}
								</small>
							</>
						) : (
							buildIconLabelCallback(
								requestEther,
								<SaveAltIcon />,
								t('home.on-the-blockchain.request-ether.button'),
								false
							)
						)}
					</>
				)}
			</Box>
			<Box title={t('home.settings.box-title')} width="250px">
				{/* TODO better title */}
				{buildIconLabelLink('/about', <InfoIcon />, t('home.settings.about-button'))}
				{buildIconLabelLink('/settings', <SettingsIcon />, t('home.settings.settings-button'))}
				{buildIconLabelLink('/users/groups', <UsersIcon />, t('home.settings.user-groups-button'))}
				{buildIconLabelLink('/collections', <CollectionsIcon />, t('home.settings.collections-button'))}{' '}
				{/*true, false*/}
				{isEligibleToBeAVoter ? (
					<Link to={'#'} style={style}>
						<div
							style={{ display: 'flex', alignItems: 'center', paddingLeft: '15px', fontFamily: 'arial' }}
							onClick={() => {
								toggleBecomeVoterModalActive();
							}}>
							<HowToVoteIcon />
							&nbsp;&nbsp;Become a voter
						</div>
					</Link>
				) : null}
			</Box>
			<Modal
				isOpen={isBecomeVoterModalActive}
				handleClose={toggleBecomeVoterModalActive}
				title="Do you want to become a voter?"
				width="400px">
				<Container>
					<Button
						onClick={() => {
							submitClaim();
							toggleBecomeVoterModalActive();
						}}>
						{' '}
						Yes
					</Button>
					<Button
						onClick={() => {
							toggleBecomeVoterModalActive();
						}}>
						{' '}
						No
					</Button>
				</Container>
			</Modal>
			<Box title="Inbox" width="250px">
				{buildIconLabelLink('/messages', <EmailIcon />, 'Your messages')}
				{buildIconLabelLink('/user/message', <MessageIcon />, 'Message user', true, false)}
			</Box>
			<Box title={t('home.inbox.box-title')} width="250px">
				{buildIconLabelLink('/messages', <EmailIcon />, t('home.inbox.your-messages-button'))}
				{buildIconLabelLink('/user/message', <MessageIcon />, t('home.inbox.message-user-button'))}
				{buildIconLabelLink(
					'/user/transfer',
					<SendIcon />,
					t('home.inbox.transfer-token-button'),
					true,
					UnderlyingsActive
				)}
				{UnderlyingsActive && (
					<>
						{buildIconLabelLink('/underlying/deposit', <DepositIcon />, t('home.inbox.deposit-collateral-button'))}
						{buildIconLabelLink(
							'/underlying/convert',
							<ConvertIcon />,
							t('home.inbox.convert-collateral-button'),
							true,
							false
						)}
					</>
				)}
			</Box>
			{TCRactive && (
				<Box title={t('home.token-curation.box-title')} width="250px">
					{buildIconLabelLink('/governance/listing', <StarIcon />, t('home.token-curation.listing-button'))}
					{buildIconLabelLink('/governance/management', <AssignmentIcon />, t('home.token-curation.management-button'))}
					{buildIconLabelLink(
						'/governance/parameters',
						<BuildIcon />,
						t('home.token-curation.parameters-button'),
						true,
						false
					)}
				</Box>
			)}
			{showDevButton && (
				<Box width="250px">
					<center>
						<Button variant="contained" color="primary" onClick={dev}>
							do the thing
						</Button>
					</center>
				</Box>
			)}
		</Container>
	);
}

const styles = {
	QRicon: {
		color: 'black',
		width: '20px',
		height: '20px',
		paddingLeft: '10px'
	},
	QRiconHover: {
		color: 'gray',
		width: '20px',
		height: '20px',
		paddingLeft: '10px'
	}
};

const mapStateToProps = state => {
	return {
		contracts: state.contracts,
		usersFin4TokenBalances: state.fin4Store.usersFin4TokenBalances,
		fin4Tokens: state.fin4Store.fin4Tokens,
		defaultAccount: state.fin4Store.defaultAccount,
		usersEthBalance: state.fin4Store.usersEthBalance
	};
};

Home.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(Home, mapStateToProps);
