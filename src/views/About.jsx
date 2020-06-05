import React from 'react';
import Box from '../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../components/Container';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	font: {
		'font-family': 'arial'
	}
}));

function About(props, context) {
	const { t, i18n } = useTranslation();

	const classes = useStyles();
	return (
		<Container>
			<Box title={t('about.box-title')}>
				<div className={classes.font}>
					{t('about.intro-text')}
					<br />
					<br />
					{t('about.support-start') + ' '}
					<a href="http://www.snf.ch/" target="_blank">
						SNF
					</a>
					,{' '}
					<a href="http://www.climate-kic.org/" target="_blank">
						Climate-KIC
					</a>
					{' ' + t('about.powered-by') + ' '}
					<a href="https://coss.ethz.ch/" target="_blank">
						COSS
					</a>
					.
					<br />
					<br />
					{t('about.open-source') + ': '}
					<a href="https://github.com/FuturICT2/" target="_blank">
						github.com/FuturICT2
					</a>
					<br />
					<br />
					{t('about.documentation') + ' '}
					<a
						href={
							i18n.language === 'en'
								? 'https://fin4xplorer.readthedocs.io/en/latest/'
								: 'https://fin4xplorer.readthedocs.io/de/latest/'
						}
						target="_blank">
						{t('about.documentation-link-keyword')}
					</a>
					.
					<br />
					<br />
					{t('about.more-info') + ' '}
					<a href="http://finfour.net/" target="_blank">
						finfour.net
					</a>
					.
					<br />
					<br />
					{t('about.contact')}: finfour@gmx.net
				</div>
			</Box>
		</Container>
	);
}

About.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(About);
