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
import { Checkbox, FormControlLabel } from '@material-ui/core';
import UploadIcon from '@material-ui/icons/CloudUpload';
import { Link } from 'react-router-dom';
const Jimp = require('jimp');

function PictureUploadComponent(props, context) {
	const { t } = useTranslation();

	const addressValue = useRef(null);
	const [ipfsHash, setIpfsHash] = useState(null);
	const uploadSize = useRef(null);
	const [uploadInProgress, setUploadInProgress] = useState(false);

	const maxSizeInKB = 500000;
	const reducedQuality = 85;
	const reducedPixels = 786432; // 1024 * 768
	const previewWidth = 300;

	const [original, setOriginal] = useState({
		fileName: null,
		fileReaderResult: null,
		previewBase64: null,
		width: null,
		height: null,
		size: null
	});

	const [reduceImageSize, setReduceImageSize] = useState(false);

	const onImageSelected = event => {
		let file = event.target.files[0];
		if (!file) {
			return;
		}

		const fileReader = new FileReader();
		// via https://github.com/oliver-moran/jimp/issues/286#issue-233572780
		fileReader.addEventListener('load', e => {
			Jimp.read(fileReader.result)
				.then(img => {
					let w = img.bitmap.width;
					let h = img.bitmap.height;
					img.resize(previewWidth, (previewWidth / w) * h).getBase64(Jimp.MIME_JPEG, (err, src) => {
						if (err) {
							console.error(err);
						}
						setOriginal({
							fileName: file.name,
							fileReaderResult: fileReader.result,
							previewBase64: src,
							width: w,
							height: h,
							size: file.size
						});
						if (file.size > maxSizeInKB) {
							setReduceImageSize(true);
						}
					});
				})
				.catch(err => {
					console.error(err);
				});
		});
		fileReader.readAsArrayBuffer(file);
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
			if (err) {
				console.log('Upload error: ', err);
				return;
			}
			console.log('Upload result: ', result);
			let hash = result[0].hash;
			let sizeKB = Math.round(result[0].size / 1000);
			uploadSize.current = sizeKB;
			setIpfsHash(hash);
			setUploadInProgress(false);
			console.log('Upload of ' + sizeKB + ' KB to IPFS successful: ' + hash, 'https://gateway.ipfs.io/ipfs/' + hash);

			// alternative way of getting the download-data:
			// under cat "Show IPFS object data": https://infura.io/docs/ipfs/get/block_get.md
			// --> curl "https://ipfs.infura.io:5001/api/v0/cat?arg=" + hash

			// ipfs.pin.add(hash, function (err) {
			//	console.log("Could not pin hash " + hash, err);
			// });
		});
		// this syntax seemed more error prone with large files:
		// ipfs.add(dataStream, { progress: length => {}})
		// .then(result => {});
	};

	const reducedDimensions = () => {
		let factor = Math.sqrt(reducedPixels / (original.width * original.height));
		return {
			w: Math.round(original.width * factor),
			h: Math.round(original.height * factor)
		};
	};

	const upload = () => {
		Jimp.read(original.fileReaderResult)
			.then(img => {
				if (reduceImageSize) {
					let dim = reducedDimensions();
					img.resize(dim.w, dim.h).quality(reducedQuality);
				}
				img.getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
					uploadToIPFS(buffer);
				});
			})
			.catch(err => {
				console.error(err);
			});
	};

	/*const downloadUploadedImage = () => {
		let a = document.createElement('a');
		// a.href = processedImageData.uploadBase64;
		let fileName = original.fileName;
		// this will fail for files without extension
		let extension = fileName.split('.')[fileName.split('.').length - 1];
		let fileNameWithoutExtension = fileName.substring(0, fileName.length - extension.length - 1);
		a.download = fileNameWithoutExtension + '_uploaded.' + extension;
		a.click();
	};*/

	return (
		<>
			{props.showAddressField && (
				<>
					<AddressQRreader
						onChange={val => (addressValue.current = val)}
						label={t('proof-submission.custom-component.picture-upload.qr-reader-label')}
					/>
					<br />
					<br />
				</>
			)}
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
					<Link
						to="#"
						onClick={() => {
							window.open('https://gateway.ipfs.io/ipfs/' + ipfsHash, '_blank');
						}}
						style={{ textDecoration: 'none' }}>
						<table>
							<tbody>
								<tr>
									<td>
										<CheckIcon />
									</td>
									<td>
										{t('proof-submission.custom-component.picture-upload.upload-complete')}
										<small>{' (' + uploadSize.current + ' KB)'}</small>
									</td>
								</tr>
							</tbody>
						</table>
					</Link>
				) : (
					<>
						<input type="file" onChange={onImageSelected} accept="image/png, image/jpeg" />
						{original.previewBase64 && (
							<>
								<br />
								<br />
								<img src={original.previewBase64} />
							</>
						)}
						{original.size > maxSizeInKB && (
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
										<span style={{ fontSize: 'small' }}>
											{t('proof-submission.custom-component.picture-upload.reduce-image-size-checkbox')}
										</span>
									}
								/>
							</>
						)}
					</>
				)}
			</center>
			{original.fileReaderResult && !uploadInProgress && !ipfsHash ? (
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
					if (!ipfsHash) {
						alert('No completed upload');
						return;
					}

					if (!props.showAddressField) {
						props.onSubmit(ipfsHash, null);
						return;
					}

					// sanity checks
					if (!isValidPublicAddress(addressValue.current)) {
						alert('Invalid Ethereum public address');
						return;
					}

					props.onSubmit(ipfsHash, addressValue.current);
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
