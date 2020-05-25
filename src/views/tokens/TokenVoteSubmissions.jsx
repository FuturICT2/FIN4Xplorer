import React, { useState, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import { findTokenBySymbol } from '../../components/Contractor';
import moment from 'moment';
import Tooltip from '@material-ui/core/Tooltip';

function TokenVoteSubmissions(props) {
	const { t } = useTranslation();

	const [token, setToken] = useState();

	useEffect(() => {
		let symbol = props.match.params.tokenSymbol;
		if (!token && symbol && Object.keys(props.fin4Tokens).length > 0) {
			let token = findTokenBySymbol(props, symbol);
			if (token) {
				setToken(token);
			}
		}
	});

	const getSubmissionsOnToken = () => {
		if (!token) {
			return [];
		}
		return Object.keys(props.submissions)
			.map(subId => props.submissions[subId])
			.filter(sub => sub.token === token.address);
	};

	const buildVoteRanking = () => {
		let optionsToOccurences = {};
		getSubmissionsOnToken().map(submission => {
			if (!optionsToOccurences[submission.content]) {
				optionsToOccurences[submission.content] = 1;
			} else {
				optionsToOccurences[submission.content] += 1;
			}
		});
		return (
			<>
				{Object.keys(optionsToOccurences).map((option, index) => {
					return (
						<div key={'option_' + index}>
							{option}: <b>{optionsToOccurences[option]}</b>
						</div>
					);
				})}
			</>
		);
	};

	return <div style={{ fontFamily: 'arial', padding: '0 50px 0 50px' }}>{buildVoteRanking()}</div>;
}

const mapStateToProps = state => {
	return {
		submissions: state.fin4Store.submissions,
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(TokenVoteSubmissions, mapStateToProps);
