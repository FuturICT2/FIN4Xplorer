import React, { useState, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import { findTokenBySymbol } from '../../components/Contractor';
import moment from 'moment';
import Tooltip from '@material-ui/core/Tooltip';

function TokenTextSubmissions(props) {
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

	/*const getRandomColor = () => { // from stackoverflow.com/a/1484514/2474159
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i ++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };*/

	const getRandomFin4Color = () => {
		// official FuturICT2 colors
		let colors = ['#00a3ef', '#695ead', '#cc1c6e', '#3d363f'];
		return colors[Math.floor(Math.random() * colors.length)];
	};

	const getRandomFontSize = () => {
		// from stackoverflow.com/a/45791988/2474159
		let min = 15;
		let maxAddToMin = 20;
		return Math.floor(Math.random() * maxAddToMin + min) + 'px';
	};

	return (
		<div style={{ fontFamily: 'arial', padding: '0 50px 0 50px' }}>
			{getSubmissionsOnToken().map((sub, idx) => {
				let date = moment.unix(sub.timestamp).calendar();
				let tooltipText = (
					<span>
						{'By ' + sub.user}
						<br />
						{date}
					</span>
				); // TODO add more fields here?
				return (
					<Tooltip key={'content_' + idx} title={tooltipText} arrow>
						<span style={{ color: getRandomFin4Color(), fontSize: getRandomFontSize() }}>
							{sub.content}&nbsp;&nbsp;
						</span>
					</Tooltip>
				);
			})}
		</div>
	);
}

const mapStateToProps = state => {
	return {
		submissions: state.fin4Store.submissions,
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(TokenTextSubmissions, mapStateToProps);
