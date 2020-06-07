import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Tooltip from '@material-ui/core/Tooltip';
var QRCode = require('qrcode.react');

function QRModal(props) {
	const { t } = useTranslation();

	const [tooltipText, setTooltipText] = useState(t('qr-code-modal.click-to-copy'));

	return (
		<Modal isOpen={props.isOpen} handleClose={props.handleClose} title={t('qr-code-modal.box-title')} width="300px">
			<center style={{ fontFamily: 'arial', color: 'gray' }}>
				<QRCode value={props.publicAddress} size={250} />
				<br />
				<br />
				{t('qr-code-modal.users-address') + ':'}
				<br />
				<CopyToClipboard text={props.publicAddress} onCopy={() => setTooltipText(t('qr-code-modal.copied'))}>
					<Tooltip title={tooltipText}>
						<span style={{ fontSize: 'x-small' }}>
							<b>{props.publicAddress}</b>
						</span>
					</Tooltip>
				</CopyToClipboard>
			</center>
		</Modal>
	);
}

export default QRModal;
