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
			<Box title="About FIN4Xplorer">
				<div className={classes.font}>
					The Finance4.0 platform (Fin4) aspires to be a socio-technical artifact spanning a design space for a
					socio-ecological financial system and for post-monetary concepts and experiments.
					<br />
					<br />
					The research project is supported by{' '}
					<a href="http://www.snf.ch/" target="_blank">
						SNF
					</a>
					,{' '}
					<a href="http://www.climate-kic.org/" target="_blank">
						Climate-KIC
					</a>{' '}
					and powered by{' '}
					<a href="https://coss.ethz.ch/" target="_blank">
						COSS
					</a>
					.
					<br />
					<br />
					The project is open source and welcomes contributors:{' '}
					<a href="https://github.com/FuturICT2/" target="_blank">
						github.com/FuturICT2
					</a>
					<br />
					<br />
					The documentation can be found{' '}
					<a
						href={
							i18n.language === 'en'
								? 'https://fin4xplorer.readthedocs.io/en/latest/'
								: 'https://fin4xplorer.readthedocs.io/de/latest/'
						}
						target="_blank">
						here
					</a>
					.
					<br />
					<br />
					More info on{' '}
					<a href="http://finfour.net/" target="_blank">
						finfour.net
					</a>
					<br />
					<br />
					Contact: finfour@gmx.net
				</div>
			</Box>
		</Container>
	);
}

About.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(About);
