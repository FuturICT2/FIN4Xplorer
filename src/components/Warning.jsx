import React from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	noWeb3Warning: {
		color: '#00a3ef',
		'font-family': 'arial'
	},
	alert: {
		width: '50%'
	},
	message: {
		marginLeft: '40px',
		margin: 'auto',
		textAlign: 'center'
	}
}));

const Warning = ({}) => {
	const { t, i18n } = useTranslation();
	const classes = useStyles();

	return (
		<center className={classes.noWeb3Warning}>
			<div className={classes.alert}>
				<Alert severity="error">
					<div className={classes.message}>
						Not connected to the Ethereum Rinkeby network. Is MetaMask installed and connected?
					</div>
					<div className={classes.message}>
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
				</Alert>
			</div>
		</center>
	);
};

export default Warning;
