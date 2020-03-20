import React, { useState } from 'react';
import Box from '../../components/Box';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { contractCall } from '../../components/Contractor';
import { TextField } from '@material-ui/core';
import Button from '../../components/Button';
import AddIcon from '@material-ui/icons/Add';

function CreateCollection(props, context) {
	const { t } = useTranslation();
	const [showHint, setShowHint] = useState(false);

	const [data, setData] = useState({
		name: '',
		shortName: '',
		description: ''
	});

	const createCollection = () => {
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Collections',
			'createCollection',
			[data.name, data.shortName, data.description],
			'Create collection ' + data.shortName,
			() => {
				// TODO replace this with instant logic aka ContractEvent or redux store addition uppon successful dry run
				setShowHint(true);
			}
		);
	};

	const updateVal = (key, val) => {
		setData({
			...data,
			[key]: val
		});
	};

	return (
		<Box title="Create token collection">
			<TextField
				key="name-field"
				type="text"
				label="Collection-Name"
				value={data.name}
				onChange={e => updateVal('name', e.target.value)}
				style={inputFieldStyle}
			/>
			<TextField
				key="shortname-field"
				type="text"
				label='Short-name (e.g. "ethz" for "ETH Zürich")'
				value={data.shortName}
				onChange={e => updateVal('shortName', e.target.value)}
				style={inputFieldStyle}
			/>
			<TextField
				key="description-field"
				type="text"
				label="Description"
				value={data.description}
				onChange={e => updateVal('description', e.target.value)}
				style={inputFieldStyle}
			/>
			<Button icon={AddIcon} onClick={createCollection} center="true">
				Submit
			</Button>
			{showHint && (
				<center style={{ color: 'gray', fontFamily: 'arial' }}>Reload the page to see your new collection.</center>
			)}
		</Box>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

CreateCollection.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {};
};

export default drizzleConnect(CreateCollection, mapStateToProps);
