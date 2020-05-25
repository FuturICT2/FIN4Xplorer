import React, { useRef, useState, useEffect } from 'react';
import { drizzleConnect } from 'drizzle-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Dropdown from '../../../components/Dropdown';
import Button from '../../../components/Button';
import AddIcon from '@material-ui/icons/Add';
import { getContractData, contractCall } from '../../../components/Contractor';

function VoteProof(props, context) {
	const { t } = useTranslation();

	const [fetchingVoteOptionsInitiated, setFetchingVoteOptionsInitiated] = useState(false);
	const [voteOptions, setVoteOptions] = useState([]);
	const [selectedVoteOption, setSelectedVoteOption] = useState(null);

	useEffect(() => {
		if (!fetchingVoteOptionsInitiated) {
			setFetchingVoteOptionsInitiated(true);
			getContractData(
				context.drizzle.contracts.Vote,
				props.store.getState().fin4Store.defaultAccount,
				'getVoteOptionsStringForToken',
				props.tokenAddr
			).then(voteOptionsString => {
				setVoteOptions(
					voteOptionsString.split(',').map(option => {
						return {
							label: option,
							value: option
						};
					})
				);
			});
		}
	});

	const submit = () => {
		console.log(selectedVoteOption);
		contractCall(
			context,
			props,
			props.store.getState().fin4Store.defaultAccount,
			'Vote',
			'submitProof_Vote',
			[props.tokenAddr, props.claimId, selectedVoteOption.label],
			'Submit vote proof',
			props.callbacks
		);
	};

	return (
		<span style={{ fontFamily: 'arial' }}>
			<Dropdown
				key="vote-options-dropdown"
				onChange={e =>
					setSelectedVoteOption({
						label: e.value,
						value: e.value
					})
				}
				options={voteOptions}
				label="Vote options"
				value={selectedVoteOption}
			/>
			<Button icon={AddIcon} onClick={submit} center="true">
				Submit
			</Button>
		</span>
	);
}

VoteProof.contextTypes = {
	drizzle: PropTypes.object
};

export default drizzleConnect(VoteProof);
