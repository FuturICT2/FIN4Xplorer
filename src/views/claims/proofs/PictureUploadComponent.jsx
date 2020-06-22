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
import { getImageDimensions, fileToBase64 } from '../../../components/utils';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import UploadIcon from '@material-ui/icons/CloudUpload';
import { Link } from 'react-router-dom';

function PictureUploadComponent(props, context) {
	const { t } = useTranslation();

	const addressValue = useRef(null);
	const [ipfsHash, setIpfsHash] = useState(null);
	const [uploadInProgress, setUploadInProgress] = useState(false);

	const maxPixels = 786432; // 1024 * 768, threshold that triggers the recommendation to reduce file size
	const compressionRate = 85; // JPEG compression rate, 100 would be not compressed

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
			compressionRate,
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

	const uploadToIPFS = data => {
		setUploadInProgress(true);
		console.log('Started upload to IPFS...');
		// via https://stackoverflow.com/a/25650163/2474159
		let Readable = require('stream').Readable;
		var dataStream = new Readable();
		dataStream.push(data);
		dataStream.push(null);
		saveToIpfs(dataStream);
	};

	const saveToIpfs = async dataStream => {
		ipfs.add(dataStream, (err, result) => {
			console.log('Upload result: ', result);
			let hash = result[0].hash;
			let sizeKB = Math.round(result[0].size / 1000);
			setIpfsHash(hash);
			setUploadInProgress(false);
			console.log('Upload of ' + sizeKB + ' KB to IPFS successful: ' + hash, 'https://gateway.ipfs.io/ipfs/' + hash);
			// ipfs.pin.add(hash, function (err) {
			//	console.log("Could not pin hash " + hash, err);
			// });
		});
		// this syntax seemed more error prone with large files:
		// ipfs.add(dataStream, { progress: length => {}})
		// .then(result => {});
	};

	const reducedDimensions = () => {
		let factor = Math.sqrt(maxPixels / original.pixels);
		return {
			factor: Math.round(factor * 100) / 100,
			w: Math.round(original.width * factor),
			h: Math.round(original.height * factor)
		};
	};

	const upload = () => {
		if (reduceImageSize) {
			Resizer.imageFileResizer(
				original.fileObject,
				reducedDimensions().w,
				reducedDimensions().h,
				'JPEG',
				compressionRate,
				0,
				uri => {
					setProcessedImageData({
						...processedImageData,
						uploadBase64: uri
					});
					uploadToIPFS(uri);
				},
				'base64'
			);
		} else {
			fileToBase64(original.fileObject).then(uri => {
				setProcessedImageData({
					...processedImageData,
					uploadBase64: uri
				});
				uploadToIPFS(uri);
			});
		}
	};

	const downloadUploadedImage = () => {
		let a = document.createElement('a');
		a.href = processedImageData.uploadBase64;
		let fileName = original.fileObject.name;
		// this will fail for files without extension
		let extension = fileName.split('.')[fileName.split('.').length - 1];
		let fileNameWithoutExtension = fileName.substring(0, fileName.length - extension.length - 1);
		a.download = fileNameWithoutExtension + '_uploaded.' + extension;
		a.click();
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
					<table>
						<tbody>
							<tr>
								<td>
									<CircularProgress />
								</td>
								<td>&nbsp;&nbsp;&nbsp;{t('proof-submission.custom-component.picture-upload.uploading')}</td>
							</tr>
						</tbody>
					</table>
				) : ipfsHash ? (
					<Link to="#" onClick={downloadUploadedImage} style={{ textDecoration: 'none' }}>
						<table>
							<tbody>
								<tr>
									<td>
										<CheckIcon />
									</td>
									<td>{t('proof-submission.custom-component.picture-upload.upload-complete')}</td>
								</tr>
							</tbody>
						</table>
					</Link>
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
											title={t('proof-submission.custom-component.picture-upload.reduce-image-size-tooltip', {
												triggerDimensions: '1024x768=786432',
												originalDimensions: original.width + 'x' + original.height + '=' + original.pixels,
												reductionFactor: '(786432/' + original.pixels + ')^0.5=' + reducedDimensions().factor,
												reducedDimensions: reducedDimensions().w + 'x' + reducedDimensions().h,
												compressionRate: compressionRate
											})}>
											<span style={{ fontSize: 'small' }}>
												{t('proof-submission.custom-component.picture-upload.reduce-image-size-checkbox')}
											</span>
										</Tooltip>
									}
								/>
							</>
						)}
					</>
				)}
			</center>
			{original.fileObject && !uploadInProgress && !ipfsHash ? (
				<center style={{ fontFamily: 'arial' }}>
					<Link to="#" onClick={upload} style={{ textDecoration: 'none' }}>
						<table>
							<tbody>
								<tr>
									<td>
										<UploadIcon />
									</td>
									<td>{t('proof-submission.custom-component.picture-upload.upload-button')}</td>
								</tr>
							</tbody>
						</table>
					</Link>
				</center>
			) : (
				<br />
			)}
			<Button
				onClick={() => {
					// sanity checks
					if (!isValidPublicAddress(addressValue.current)) {
						alert('Invalid Ethereum public address');
						return;
					}
					if (!ipfsHash) {
						alert('No completed upload');
						return;
					}
					props.onSubmit(addressValue.current, ipfsHash);
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
