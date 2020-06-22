import React, { useRef, useState } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AddressQRreader from '../../../components/AddressQRreader';
import Button from '../../../components/Button';
import ipfs from '../../../config/ipfs';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';
import { isValidPublicAddress } from '../../../components/Contractor';
import Resizer from 'react-image-file-resizer';
import { getImageDimensions } from '../../../components/utils';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';

function PictureUploadComponent(props, context) {
	const { t } = useTranslation();

	const addressValue = useRef(null);
	const ipfsHash = useRef(null);
	const [uploadInProgress, setUploadInProgress] = useState(false);

	const maxPixels = 786432; // 1024 * 768

	const [original, setOriginal] = useState({
		fileObject: null,
		width: null,
		height: null,
		pixels: null
	});

	const [processedImageData, setProcessedImageData] = useState({
		previewBase64: null,
		uploadBase64: null
	});

	const [reduceImageSize, setReduceImageSize] = useState(false);

	const onImageSelected = event => {
		let file = event.target.files[0];
		if (!file) {
			return;
		}

		// store preview
		Resizer.imageFileResizer(
			file,
			300,
			300,
			'JPEG',
			75,
			0,
			uri => {
				setProcessedImageData({
					...processedImageData,
					previewBase64: uri
				});
			},
			'base64'
		);

		getImageDimensions(file, (w, h) => {
			setOriginal({
				fileObject: file,
				width: w,
				height: h,
				pixels: w * h
			});
			if (w * h > maxPixels) {
				setReduceImageSize(true);
			}
		});
	};

	const onSelectFile = file => {
		setUploadInProgress(true);
		console.log('Started upload to IPFS...');
		let reader = new window.FileReader();
		reader.readAsArrayBuffer(file);
		reader.onloadend = () => convertToBuffer(reader);
	};

	const convertToBuffer = async reader => {
		const buffer = await Buffer.from(reader.result);
		saveToIpfs(buffer);
	};

	const saveToIpfs = async buffer => {
		ipfs.add(buffer, (err, result) => {
			let hash = result[0].hash;
			let sizeKB = Math.round(result[0].size / 1000);
			ipfsHash.current = hash;
			setUploadInProgress(false);
			console.log('Upload of ' + sizeKB + ' KB to IPFS successful: ' + hash, 'https://gateway.ipfs.io/ipfs/' + hash);
			//ipfs.pin.add(hash, function (err) {
			//	console.log("Could not pin hash " + hash, err);
			//});
		});
	};

	const reducedDimensions = () => {
		let factor = Math.sqrt(maxPixels / original.pixels);
		return {
			factor: Math.round(factor * 100) / 100,
			w: Math.round(original.width * factor),
			h: Math.round(original.height * factor)
		};
	};

	return (
		<>
			<AddressQRreader
				onChange={val => (addressValue.current = val)}
				label={t('proof-submission.custom-component.picture-upload.qr-reader-label')}
			/>
			<br />
			<br />
			<center style={{ fontFamily: 'arial' }}>
				{uploadInProgress ? (
					<>
						<CircularProgress />
						&nbsp;&nbsp;&nbsp;
						<span style={{ color: 'gray' }}>{t('proof-submission.custom-component.picture-upload.uploading')}</span>
					</>
				) : ipfsHash.current ? (
					<>
						<CheckIcon />{' '}
						<span style={{ color: 'gray' }}>
							<a href={'https://gateway.ipfs.io/ipfs/' + ipfsHash.current} target="_blank">
								{t('proof-submission.custom-component.picture-upload.upload-complete')}
							</a>
						</span>
					</>
				) : (
					<>
						<input type="file" onChange={onImageSelected} accept="image/png, image/jpeg" />
						{processedImageData.previewBase64 && (
							<>
								<br />
								<br />
								<img src={processedImageData.previewBase64} />
							</>
						)}
						{original.pixels > maxPixels && (
							<>
								<br />
								<FormControlLabel
									control={
										<Checkbox
											size={'small'}
											checked={reduceImageSize}
											onChange={() => {
												setReduceImageSize(!reduceImageSize);
											}}
										/>
									}
									label={
										<Tooltip
											title={
												'The numbers of pixel for when this suggestion is triggered is 1024x768=786432. Your image has ' +
												original.width +
												'x' +
												original.height +
												'=' +
												original.pixels +
												' pixels. Therefore the reduction factor is (786432/' +
												original.pixels +
												')^0.5=' +
												reducedDimensions().factor
											}>
											<span style={{ fontSize: 'small' }}>
												{'Reduce image size from ' +
													original.width +
													'x' +
													original.height +
													' to ' +
													reducedDimensions().w +
													'x' +
													reducedDimensions().h}
											</span>
										</Tooltip>
									}
								/>
							</>
						)}
					</>
				)}
			</center>
			<br />
			<Button
				onClick={() => {
					// sanity checks
					if (!isValidPublicAddress(addressValue.current)) {
						alert('Invalid Ethereum public address');
						return;
					}
					if (!ipfsHash.current) {
						alert('No completed upload');
						return;
					}
					props.onSubmit(addressValue.current, ipfsHash.current);
				}}
				center="true">
				{t('proof-submission.custom-component.picture-upload.submit-button')}
			</Button>
		</>
	);
}

PictureUploadComponent.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(PictureUploadComponent);
