import React, { useState } from 'react';
import { drizzleConnect } from 'drizzle-react';
import Container from '../../components/Container';
import Box from '../../components/Box';
import { useTranslation } from 'react-i18next';
import UsersIcon from '@material-ui/icons/Group';
import CollectionsIcon from '@material-ui/icons/CollectionsBookmark';
import MessageIcon from '@material-ui/icons/Message';
import EmailIcon from '@material-ui/icons/Email';
import StarIcon from '@material-ui/icons/Star';
import TokenBalances from '../../components/TokenBalances';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import SettingsIcon from '@material-ui/icons/SettingsOutlined';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import BuildIcon from '@material-ui/icons/Build';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import AssignmentIcon from '@material-ui/icons/Assignment';
import QRModal from '../../components/QRModal';
import { buildIconLabelLink, buildIconLabelCallback } from '../../components/utils';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import { contractCall } from '../../components/Contractor';

let faucetConfig = null;
try {
	faucetConfig = require('../../config/faucet-url.json');
} catch (err) {
	console.log('faucet-url.json not found');
}

const axios = require('axios');
const showDevButton = false;

function Home(props, context) {
	const { t } = useTranslation();

	const [iconIsHovered, setIconHovered] = useState(false);
	const [isQRModalOpen, setQRModalOpen] = useState(false);
	const toggleQRModal = () => {
		setQRModalOpen(!isQRModalOpen);
	};

	const requestEther = () => {
		let recipient = props.defaultAccount;
		let networkID = window.ethereum.networkVersion;
		let encodedURL = faucetConfig.FAUCET_URL + '/faucet?recipient=' + recipient + '&networkID=' + networkID;
		console.log('Calling faucet server: ' + encodedURL);
		axios
			.get(encodedURL)
			.then(response => {
				console.log('Successfully called faucet server. Response: ' + response.data);
				alert(response.data);
			})
			.catch(error => {
				console.log('Error calling faucet server', error);
				alert('Failed to request Ether');
			})
			.finally(() => {});
	};

	const dev = () => {
		contractCall(context, props, 'Fin4Main', 'dev', 3, 'dev method call');
	};

	return (
		<Container>
			<TokenBalances />
			<Box title="On the blockchain">
				{' '}
				{/*t('about-you')*/}
				<p style={{ fontFamily: 'arial' }}>
					{t('your-public-address')}
					<br />
					<span style={{ fontSize: 'x-small' }}>
						{props.defaultAccount === null ? (
							t('info-not-yet-available')
						) : (
							<>
								{/* TODO make network-generic */}
								<a href={'https://rinkeby.etherscan.io/address/' + props.defaultAccount} target="_blank">
									{props.defaultAccount}
								</a>
								<FontAwesomeIcon
									style={iconIsHovered ? styles.QRiconHover : styles.QRicon}
									icon={faQrcode}
									onClick={toggleQRModal}
									onMouseEnter={() => setIconHovered(true)}
									onMouseLeave={() => setIconHovered(false)}
								/>
							</>
						)}
					</span>
				</p>
				<QRModal isOpen={isQRModalOpen} handleClose={toggleQRModal} publicAddress={props.defaultAccount} />
				<div style={{ fontFamily: 'arial' }}>
					Your balance:{' '}
					{props.usersEthBalance === null
						? t('info-not-yet-available')
						: // TODO dynamic rounding / unit?
						  `${Math.round(props.usersEthBalance * 1000) / 1000} ETH`}
				</div>
				{props.usersEthBalance === 0 && (
					<div style={{ fontFamily: 'arial', color: 'red' }}>
						<small>Without Ether you are limited to read-only interactions.</small>
					</div>
				)}
				{(props.usersEthBalance === null || props.usersEthBalance === 0) && (
					<div style={{ fontFamily: 'arial', color: 'red' }}>
						<small>Are you connected to the correct network?</small>
					</div>
				)}
				{faucetConfig && faucetConfig.FAUCET_URL && (
					<>
						<br />
						{buildIconLabelCallback(() => {}, <SaveAltIcon />, t('request-ether'), false)}
					</>
				)}
			</Box>
			<Box title="Settings" width="250px">
				{/* TODO better title */}
				{buildIconLabelLink('/about', <InfoIcon />, 'About')}
				{buildIconLabelLink('/settings', <SettingsIcon />, 'System settings')}
				{buildIconLabelLink('/users/groups', <UsersIcon />, 'User groups')}
				{buildIconLabelLink('/collections', <CollectionsIcon />, 'Token collections', true, false)}
			</Box>
			<Box title="Inbox" width="250px">
				{buildIconLabelLink('/messages', <EmailIcon />, 'Your messages')}
				{buildIconLabelLink('/user/message', <MessageIcon />, 'Message user', true, false)}
			</Box>
			<Box title="Token curation" width="250px">
				{buildIconLabelLink('/governance/listing', <StarIcon />, 'Listing')}
				{buildIconLabelLink('/governance/management', <AssignmentIcon />, 'Management')}
				{buildIconLabelLink('/governance/parameters', <BuildIcon />, 'Parameters', true, false)}
			</Box>
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
