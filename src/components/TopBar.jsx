import React, { useState } from 'react';
import colors from '../config/colors-config';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import { useTranslation } from 'react-i18next';
import { drizzleConnect } from 'drizzle-react';
import NoNotificationsIcon from '@material-ui/icons/NotificationsNone';
import NewNotificationsIcon from '@material-ui/icons/NotificationsActive';
import RefreshIcon from '@material-ui/icons/Refresh';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import QRModal from './QRModal';
import Badge from '@material-ui/core/Badge';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'; // alternatively: History, Timelapse
import HourglassFullIcon from '@material-ui/icons/HourglassFull'; // TODO
import Modal from './Modal';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactInterval from 'react-interval';

const useStyles = makeStyles(theme => ({
	bar: {
		background: colors.main,
		marginBottom: 20,
		'padding-top': 15,
		'padding-bottom': 15,
		'font-size': 'large',
		'font-family': 'arial'
	},
	headerImage: {
		width: 220
		//margin: '10px auto'
	},
	alignRight: {
		'text-align': 'right',
		'padding-right': '20px'
	},
	//logoText: {
	//	'text-decoration': 'none',
	//	color: 'white'
	//},
	noWeb3Warning: {
		color: '#00a3ef',
		'font-family': 'arial'
	},
	noNotification: {
		color: 'white'
	},
	newNotification: {
		color: 'yellow'
	},
	QRicon: {
		color: 'white',
		width: '20px',
		height: '20px',
		padding: '0 4px 4px 0'
	},
	transactionsIcon: {
		color: 'white',
		width: '22px',
		height: '22px',
		padding: '0 6px 14px 0'
	}
}));

function TopBar(props) {
	const { t, i18n } = useTranslation();
	const classes = useStyles();

	const [isQRModalOpen, setQRModalOpen] = useState(false);
	const toggleQRModal = () => {
		setQRModalOpen(!isQRModalOpen);
	};
	const [isPendingTxOpen, setPendingTxOpen] = useState(false);
	const togglePendingTxModal = () => {
		setPendingTxOpen(!isPendingTxOpen);
	};

	const [timeNow, setTimeNow] = useState(Date.now());

	const getPendingTransactions = () => {
		return props.transactions.filter(pt => pt.status === 'BROADCASTED');
	};

	return (
		<>
			<ReactInterval timeout={1000} enabled={true} callback={() => setTimeNow(Date.now())} />
			<Modal isOpen={isPendingTxOpen} handleClose={togglePendingTxModal} title="Pending transactions" width="300px">
				<div style={{ fontFamily: 'arial' }}>
					{getPendingTransactions().map((tx, index) => {
						return (
							<div
								key={'pTx_' + index}
								style={{
									borderRadius: '15px',
									background: '#FED8B1',
									padding: '10px 10px 6px 15px',
									marginBottom: '10px'
								}}>
								<CircularProgress size={20} style={{ color: '#695EAD' }} />
								{tx.displayStr && (
									<>
										<span style={{ paddingLeft: '8px' }}>
											{tx.displayStr}
											<small>
												<span style={{ color: '#695EAD', marginLeft: '5px' }}>
													{Math.round((timeNow - tx.timestamp) / 1000) + 's'}
												</span>
											</small>
										</span>
									</>
								)}
							</div>
						);
					})}
					{getPendingTransactions().length === 0 && <center style={{ color: 'gray' }}>No pending transactions</center>}
					<br />
					<Link to={'/transactions'} onClick={togglePendingTxModal}>
						<center>
							<small style={{ color: 'gray', textDecoration: 'none' }}>See log</small>
						</center>
					</Link>
				</div>
			</Modal>
			<QRModal isOpen={isQRModalOpen} handleClose={toggleQRModal} publicAddress={props.defaultAccount} />
			<AppBar position="static" className={classes.bar}>
				{/* TODO is there a better way to put the logo in the middle AND the icons at the right side at the same height?
					The 'marginLeft' of <center> matches the 'width' of the icon-<td> to nudge the logo into the middle
					of the page instead of the middle within its <td>*/}
				<table style={{ width: '100%' }}>
					<tbody>
						<tr>
							<td>
								<center style={{ marginLeft: '75px' }}>
									<Link to={'/'}>
										{/* Logo made by @ShreshthaKriti */}
										<img
											src="/project-logos/fin4x_11_with_round_dots.png"
											alt="FIN4Xplorer Logo"
											className={classes.headerImage}
										/>
									</Link>
								</center>
							</td>
							<td style={{ width: '120px', whiteSpace: 'nowrap' }}>
								<Badge
									onClick={() => {
										setTimeNow(Date.now());
										togglePendingTxModal();
									}}
									anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
									badgeContent={getPendingTransactions().length}
									color="secondary">
									{getPendingTransactions().length === 0 ? (
										<HourglassEmptyIcon className={classes.transactionsIcon} />
									) : (
										<HourglassFullIcon className={classes.transactionsIcon} />
									)}
								</Badge>
								<FontAwesomeIcon className={classes.QRicon} icon={faQrcode} onClick={toggleQRModal} />
								<RefreshIcon onClick={() => window.location.reload()} />
								<Link to={'/messages'}>
									{props.messages.filter(msg => !msg.hasBeenActedUpon).length > 0 ? (
										<NewNotificationsIcon className={classes.newNotification} />
									) : (
										<NoNotificationsIcon className={classes.noNotification} />
									)}
								</Link>{' '}
							</td>
						</tr>
					</tbody>
				</table>
				{!(window.web3 && props.defaultAccount) && (
					<center className={classes.noWeb3Warning}>
						<div className={classes.activeLng}>
							Not connected to the Ethereum Rinkeby network. Is MetaMask installed and connected?
						</div>
						<div>
							Get the{' '}
							<a className={classes.noWeb3Warning} href="https://metamask.io/">
								MetaMask extension
							</a>{' '}
							for your desktop browser or try
							<br />{' '}
							<a className={classes.noWeb3Warning} href="https://link.medium.com/zdWtIl7Pq0">
								MetaMask Mobile
							</a>{' '}
							or{' '}
							<a className={classes.noWeb3Warning} href="https://status.im/get/">
								Status
							</a>{' '}
							on your mobile phone. Need help{' '}
							<a
								className={classes.noWeb3Warning}
								href={
									i18n.language === 'en'
										? 'https://fin4xplorer.readthedocs.io/en/latest'
										: 'https://fin4xplorer.readthedocs.io/de/latest/'
								}
								target="_blank">
								getting started
							</a>
							?
						</div>
					</center>
				)}
			</AppBar>
		</>
	);
}

const mapStateToProps = state => {
	return {
		defaultAccount: state.fin4Store.defaultAccount,
		messages: state.fin4Store.messages,
		transactions: state.fin4Store.transactions
	};
};

export default drizzleConnect(TopBar, mapStateToProps);
