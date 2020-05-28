import React from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import Container from '../../components/Container';
import PropTypes from 'prop-types';
import Button from '../../components/Button';

import { contractCall } from '../../components/Contractor';

function RegisterVoter(props, context) {
	const submitClaim = () => {
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Fin4Voting',
			'becomeVoter',
			[],
			'I want to be a voter',
			{
				transactionCompleted: receipt => {
					console.log('You are a voter now!');
				},
				transactionFailed: reason => {
					console.log("We couldn't enroll you on the list of voters because: " + reason);
				}
			}
		);
	};

	// const contractCall = (
	// 	context,
	// 	props,
	// 	defaultAccount,
	// 	contractName,
	// 	methodName,
	// 	params,
	// 	displayStr = '',
	// 	callbacks = {}, // transactionSent, transactionCompleted, transactionFailed, dryRunSucceeded, dryRunFailed
	// 	skipDryRun = false
	// )

	return (
		<container>
			<Button onClick={submitClaim} center="true">
				I want to be a voter!
			</Button>
		</container>
	);
}

RegisterVoter.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {};
};

export default drizzleConnect(RegisterVoter, mapStateToProps);
