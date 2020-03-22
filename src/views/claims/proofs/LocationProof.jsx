import React from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AddLocation from '@material-ui/icons/AddLocation';
import Button from '../../../components/Button';
import { getContractData, contractCall } from '../../../components/Contractor';

function LocationProof(props, context) {
	const { t } = useTranslation();

	const onSubmitLocation = () => {
		if (!navigator.geolocation) {
			alert('Location requests are not supported by this browser');
			return;
		}

		let defaultAccount = props.store.getState().fin4Store.defaultAccount;

		getContractData(
			context.drizzle.contracts.Location,
			defaultAccount,
			'getLatitudeLongitudeString',
			props.tokenAddr
		).then(latLonStr => {
			let tokenCreatorLatitude = Number(latLonStr.split('/')[0].trim());
			let tokenCreatorLongitude = Number(latLonStr.split('/')[1].trim());

			// via https://www.w3schools.com/html/html5_geolocation.asp
			navigator.geolocation.getCurrentPosition(pos => {
				let latitude = pos.coords.latitude;
				let longitude = pos.coords.longitude;

				console.log('Captured location ' + latitude + ' / ' + longitude);

				// use an oracle instead!? Maybe http://provable.xyz
				let distanceToTokenCreatorsLocation = Math.round(
					distanceInKmBetweenEarthCoordinates(tokenCreatorLatitude, tokenCreatorLongitude, latitude, longitude) * 1000
				);

				contractCall(
					context,
					props,
					defaultAccount,
					'Location',
					'submitProof_Location',
					[props.tokenAddr, props.claimId, distanceToTokenCreatorsLocation],
					'Submit location proof',
					{}
				);
			});
		});
	};

	return (
		<Button icon={AddLocation} onClick={onSubmitLocation} center="true">
			Submit location
		</Button>
	);
}

function degreesToRadians(degrees) {
	return (degrees * Math.PI) / 180;
}

// from https://stackoverflow.com/a/365853
function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
	var earthRadiusKm = 6371;

	var dLat = degreesToRadians(lat2 - lat1);
	var dLon = degreesToRadians(lon2 - lon1);

	lat1 = degreesToRadians(lat1);
	lat2 = degreesToRadians(lat2);

	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return earthRadiusKm * c;
}

LocationProof.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(LocationProof);
