import React, { useRef } from 'react';
import { getContractData, contractCall } from '../../components/Contractor';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { drizzleConnect } from 'drizzle-react';
import { TextField } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
const { soliditySha3 } = require('web3-utils');
const BN = require('bignumber.js');

function VoteModal(props, context) {
	const { t } = useTranslation();

	const voteModalValues = useRef({
		vote: null,
		salt: null,
		numbTokens: null
	});

	const resetVoteModalValues = () => {
		voteModalValues.current = {
			vote: null,
			salt: null,
			numbTokens: null
		};
	};

	const submitVoteModal = () => {
		if (
			voteModalValues.current.vote === null ||
			voteModalValues.current.salt === null ||
			voteModalValues.current.numbTokens === null
		) {
			alert('All values must be set.');
			return;
		}

		let vote = voteModalValues.current.vote;
		let salt = voteModalValues.current.salt;
		let numbTokens = Number(voteModalValues.current.numbTokens);
		let pollID = props.pollID;

		if (numbTokens < 0) {
			alert('Number of tokens must be more than 0.');
			return;
		}

		resetVoteModalValues();
		props.handleClose();

		let defaultAccount = props.store.getState().fin4Store.defaultAccount;
		let PLCRVotingContract = context.drizzle.contracts.PLCRVoting;

		contractCall(
			context,
			props,
			defaultAccount,
			'GOV',
			'approve',
			[PLCRVotingContract.address, numbTokens],
			'Approve GOV spending',
			{
				transactionCompleted: () => {
					getContractData(
						PLCRVotingContract,
						defaultAccount,
						'getInsertPointForNumTokens',
						defaultAccount,
						numbTokens,
						pollID
					).then(prevPollIdBN => {
						let prevPollID = new BN(prevPollIdBN).toNumber();
						let secretHash = soliditySha3(vote, salt);
						contractCall(
							context,
							props,
							defaultAccount,
							'PLCRVoting',
							'commitVote',
							[pollID, secretHash, numbTokens, prevPollID],
							'Commit vote'
						);
					});
				}
			}
		);
	};

	return (
		<center>
			<Modal
				isOpen={props.isOpen}
				handleClose={props.handleClose}
				title="Set vote, salt and number of tokens"
				width="400px">
				<TextField
					key="set-vote"
					type="number"
					label="Vote (1 or 0)"
					onChange={e => (voteModalValues.current.vote = e.target.value)}
					style={inputFieldStyle}
				/>
				<small style={{ fontFamily: 'arial', color: 'gray' }}>{props.voteOptionsInfo}</small>
				<TextField
					key="set-salt"
					type="number"
					label="Salt"
					onChange={e => (voteModalValues.current.salt = e.target.value)}
					style={inputFieldStyle}
				/>
				<TextField
					key="set-numb-tokens"
					type="number"
					label="Number of tokens"
					onChange={e => (voteModalValues.current.numbTokens = e.target.value)}
					style={inputFieldStyle}
				/>
				<Button onClick={submitVoteModal} center="true">
					Submit
				</Button>
				<center>
					<small style={{ fontFamily: 'arial', color: 'gray' }}>
						Upon submitting, two transactions have to be signed: to allow the number of tokens to be withdrawn from your
						GOV token balance and then to submit your vote.
					</small>
				</center>
			</Modal>
		</center>
	);
}

const inputFieldStyle = {
	width: '100%',
	marginBottom: '15px'
};

VoteModal.contextTypes = {
	drizzle: PropTypes.object
};

const mapStateToProps = state => {
	return {};
};

export default drizzleConnect(VoteModal, mapStateToProps);
