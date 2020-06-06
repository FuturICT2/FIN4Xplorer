import React, { useState, useRef, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import { TextField, InputAdornment } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { BrowserQRCodeReader } from '@zxing/library';

function AddressQRreader(props) {
	const { t } = useTranslation();

	const [videoElementVisible, setVideoElementVisible] = useState(false);
	const [addressValue, setAddressValue] = useState(null);
	const [iconIsHovered, setIconHovered] = useState(false);

	const codeReader = useRef(new BrowserQRCodeReader());

	const initialValueAdopted = useRef(false);

	useEffect(() => {
		if (props.initialValue && !initialValueAdopted.current) {
			initialValueAdopted.current = true;
			updateAddressValue(props.initialValue);
		}
	});

	async function getAddressFromQRCode() {
		setVideoElementVisible(true);
		// via https://github.com/zxing-js/library
		codeReader.current
			.decodeFromInputVideoDevice(undefined, 'qr_vid')
			.then(result => {
				let addr = result.text;
				// apparently MetaMask prepends this to their generated QR codes
				if (addr.startsWith('ethereum:')) {
					addr = addr.substring(9, addr.length);
				}
				console.log('QR code read: ' + addr);
				updateAddressValue(addr);
			})
			.catch(err => console.error(err))
			.finally(() => stopScanning());
	}

	const updateAddressValue = val => {
		setAddressValue(val);
		props.onChange(val);
	};

	const stopScanning = () => {
		codeReader.current.stopStreams();
		setVideoElementVisible(false);
	};

	return (
		<>
			<TextField
				type="text"
				label={props.label ? props.label : t('address-qr-reader-component.default-public-address')}
				style={styles.inputField}
				variant="outlined"
				value={addressValue ? addressValue : ''}
				onChange={e => updateAddressValue(e.target.value)}
				InputProps={{
					style: { fontSize: 'small' },
					endAdornment: (
						<InputAdornment position="end">
							<FontAwesomeIcon
								style={iconIsHovered ? styles.QRiconHover : styles.QRicon}
								icon={faQrcode}
								onClick={() => {
									getAddressFromQRCode();
								}}
								onMouseEnter={() => setIconHovered(true)}
								onMouseLeave={() => setIconHovered(false)}
							/>
						</InputAdornment>
					)
				}}
			/>
			{videoElementVisible && (
				<center>
					<video id="qr_vid" width="300" height="200"></video>
					<br />
					<a style={styles.cancelLink} onClick={() => stopScanning()}>
						{t('address-qr-reader-component.cancel-button')}
					</a>
				</center>
			)}
		</>
	);
}

const styles = {
	QRicon: {
		color: 'black',
		width: '20px',
		height: '20px',
		padding: '3px 2px 3px 1px'
	},
	QRiconHover: {
		color: 'gray',
		width: '23px',
		height: '23px'
	},
	inputField: {
		width: '100%',
		marginBottom: '15px'
	},
	smallFont: {
		fontSize: 'small'
	},
	cancelLink: {
		color: 'red',
		fontFamily: 'arial',
		fontSize: 'small'
	}
};

const mapStateToProps = state => {
	return {};
};

export default drizzleConnect(AddressQRreader, mapStateToProps);
