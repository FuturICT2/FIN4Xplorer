import React from 'react';
import Box from '../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../components/Container';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { translationMarkdown } from '../components/utils';

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
					{translationMarkdown(t('about.content', { email: 'finfour@gmx.net' }), {
						'snf-link': label => {
							return (
								<a key="snf-link" href="http://www.snf.ch/" target="_blank">
									{label}
								</a>
							);
						},
						'ckic-link': label => {
							return (
								<a key="ckic-link" href="http://www.climate-kic.org/" target="_blank">
									{label}
								</a>
							);
						},
						'coss-link': label => {
							return (
								<a key="coss-link" href="https://coss.ethz.ch/" target="_blank">
									{label}
								</a>
							);
						},
						'github-orga-link': label => {
							return (
								<a key="github-orga-link" href="https://github.com/FuturICT2/" target="_blank">
									{label}
								</a>
							);
						},
						'docs-link': label => {
							return (
								<a
									key="docs-link"
									href={
										i18n.language === 'en'
											? 'https://fin4xplorer.readthedocs.io/en/latest/'
											: 'https://fin4xplorer.readthedocs.io/de/latest/'
									}
									target="_blank">
									{label}
								</a>
							);
						},
						'finfour-link': label => {
							return (
								<a key="finfour-link" href="http://finfour.net/" target="_blank">
									{label}
								</a>
							);
						}
					})}
				</div>
			</Box>
		</Container>
	);
}

About.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(About);
