import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Tooltip from '@material-ui/core/Tooltip';
import { getEtherscanAddressURL, getEtherscanTxURL } from './utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-regular-svg-icons'; // addtional package found via https://stackoverflow.com/a/56566156/2474159

function AddressDisplayWithCopy(props) {
	const { t } = useTranslation();

	const [tooltipText, setTooltipText] = useState('Click to copy to clipboard');

	return (
		<>
			<CopyToClipboard text={props.address} onCopy={() => setTooltipText('Copied!')}>
				<Tooltip title={tooltipText}>
					<span style={{ fontSize: 'x-small' }}>
						<FontAwesomeIcon icon={faCopy} style={styles.default} />
					</span>
				</Tooltip>
			</CopyToClipboard>
			<a
				style={{ fontSize: 'small' }}
				href={props.txHash ? getEtherscanTxURL(props.txHash) : getEtherscanAddressURL(props.address)}
				target="_blank">
				{props.address}
			</a>
		</>
	);
}

const styles = {
	default: {
		color: 'gray',
		width: '14px',
		height: '14px',
		paddingRight: '4px'
	}
};

export default AddressDisplayWithCopy;
