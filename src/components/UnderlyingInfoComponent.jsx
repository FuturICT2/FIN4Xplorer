import React from 'react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from './Contractor';
import { drizzleConnect } from 'drizzle-react';
import { Fin4Colors } from './utils';
import Tooltip from '@material-ui/core/Tooltip';
import AddressDisplayWithCopy from './AddressDisplayWithCopy';
import { Link } from 'react-router-dom';

function UnderlyingInfoComponent(props) {
	const { t } = useTranslation();

	const displayAttachment = attachment => {
		if (attachment.includes('http') || attachment.includes('www')) {
			return (
				<small>
					<a href={attachment} target="_blank">
						{attachment}
					</a>
				</small>
			);
		}
		return <small>{attachment}</small>;
	};

	return (
		<>
			<div style={styles.mainDiv}>
				<table>
					<tbody>
						<tr>
							<td>
								<span style={styles.leftColumn}>Name</span>
							</td>
							<td>{props.underlying.name}</td>
						</tr>
						{props.underlying.contractAddress !== zeroAddress && (
							<tr>
								<td>
									<Tooltip
										title="Contract has to implement the SuccessfulClaimNotifierInterface. Gets called for each successful claim on this PAT."
										arrow>
										<span style={styles.leftColumn}>Contract</span>
									</Tooltip>
								</td>
								<td>
									<AddressDisplayWithCopy address={props.underlying.contractAddress} fontSize="xx-small" />
								</td>
							</tr>
						)}
						{props.underlying.attachment && (
							<tr>
								<td>
									<span style={styles.leftColumn}>Attachment</span>
								</td>
								<td>{displayAttachment(props.underlying.attachment)}</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</>
	);
}

const styles = {
	leftColumn: {
		fontSize: 'small',
		color: 'gray',
		marginRight: '8px'
	},
	mainDiv: {
		fontFamily: 'arial',
		borderRadius: '25px',
		border: '2px solid silver',
		padding: '15px',
		position: 'relative',
		margin: '15px 0 15px 0'
	}
};

const mapStateToProps = state => {
	return {
		fin4Tokens: state.fin4Store.fin4Tokens
	};
};

export default drizzleConnect(UnderlyingInfoComponent, mapStateToProps);
