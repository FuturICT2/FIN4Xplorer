import React, { useRef, useState } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Button from '../../../components/Button';
import ipfs from '../../../config/ipfs';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';

function FileUploadComponent(props, context) {
	const { t } = useTranslation();

	const ipfsHash = useRef(null);
	const [uploadInProgress, setUploadInProgress] = useState(false);
	const accept = props.accept;
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
	return (
		<>
			<br />
			<br />
			<center style={{ fontFamily: 'arial' }}>
				{uploadInProgress ? (
					<>
						<CircularProgress />
						&nbsp;&nbsp;&nbsp;<span style={{ color: 'gray' }}>Uploading...</span>
					</>
				) : ipfsHash.current ? (
					<>
						<CheckIcon />{' '}
						<span style={{ color: 'gray' }}>
							<a href={'https://gateway.ipfs.io/ipfs/' + ipfsHash.current} target="_blank">
								Upload complete
							</a>
						</span>
					</>
				) : (
					<input type="file" onChange={e => onSelectFile(e.target.files[0])} accept={props.accept} />
				)}
			</center>
			<br />
			<Button
				onClick={() => {
					// sanity checks
					if (!ipfsHash.current) {
						alert('No completed upload');
						return;
					}
					props.onSubmit(ipfsHash.current);
				}}
				center="true">
				Submit
			</Button>
		</>
	);
}

FileUploadComponent.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(FileUploadComponent);
