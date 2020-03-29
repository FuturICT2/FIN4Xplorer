// originally from www.trufflesuite.com/tutorials/drizzle-and-contract-events
import { generateStore, EventActions } from 'drizzle';
import drizzleOptions from '../config/drizzle-config';
import { toast } from 'react-toastify';
import update from 'react-addons-update';
import Cookies from 'js-cookie';
import { doCallback } from '../components/utils';
const BN = require('bignumber.js');

const contractEventNotifier = store => next => action => {
	if (action.type !== EventActions.EVENT_FIRED) {
		return next(action);
	}

	const contract = action.name;
	const contractEvent = action.event.event;
	let display = `${contract}: ${contractEvent}`;

	let defaultAccount = store.getState().fin4Store.defaultAccount;

	// ------------------------------ Fin4TokenCreated ------------------------------

	if (contractEvent === 'Fin4TokenCreated') {
		let token = action.event.returnValues;
		let address = token.addr;

		// block duplicate events, seems easier this "definite" way then latest block?
		if (store.getState().fin4Store.fin4Tokens[address]) {
			return next(action);
		}

		let name = token.name;
		let symbol = token.symbol;
		display = 'New Fin4 token created: ' + name + ' [' + symbol + ']';

		store.dispatch({
			type: 'ADD_FIN4_TOKEN',
			token: {
				address: address,
				name: name,
				symbol: symbol,
				description: token.description,
				unit: token.unit,
				userIsCreator: token.creator === defaultAccount,
				totalSupply: 0,
				creationTime: token.creationTime,
				hasFixedMintingQuantity: token.hasFixedMintingQuantity,
				isOPAT: null
			}
		});
	}

	// ------------------------------ ClaimSubmitted ------------------------------

	if (contractEvent === 'ClaimSubmitted') {
		let claim = action.event.returnValues;
		let id = claim.tokenAddr + '_' + claim.claimId; // pseudoId, just for frontend
		let isCurrentUsersClaim = claim.claimer === defaultAccount;

		// block: claim-event not caused by current user / duplicate events
		if (!isCurrentUsersClaim || store.getState().fin4Store.usersClaims[id]) {
			return next(action);
		}

		let quantity = new BN(claim.quantity).toNumber();
		let token = store.getState().fin4Store.fin4Tokens[claim.tokenAddr];
		display = 'You are claiming ' + quantity + ' ' + token.name + ' [' + token.symbol + '] tokens';

		let proofStatusesObj = {};
		for (let i = 0; i < claim.requiredProofTypes.length; i++) {
			proofStatusesObj[claim.requiredProofTypes[i]] = false;
		}

		store.dispatch({
			type: 'ADD_CLAIM',
			claim: {
				id: id,
				token: claim.tokenAddr,
				claimId: claim.claimId,
				claimer: claim.claimer,
				isApproved: false,
				gotRejected: false,
				quantity: quantity,
				claimCreationTime: new BN(claim.claimCreationTime).toNumber(),
				comment: claim.comment,
				proofStatuses: proofStatusesObj
			}
		});
	}

	// ------------------------------ ClaimApproved ------------------------------

	if (contractEvent === 'ClaimApproved') {
		let claim = action.event.returnValues;
		let id = claim.tokenAddr + '_' + claim.claimId; // pseudoId
		let isCurrentUsersClaim = claim.claimer === defaultAccount;

		// block: current user is not claimer / duplicate events / claim is already approved
		let usersClaims = store.getState().fin4Store.usersClaims;
		if (!isCurrentUsersClaim || (usersClaims[id] && usersClaims[id].isApproved)) {
			return next(action);
		}

		let token = store.getState().fin4Store.fin4Tokens[claim.tokenAddr];
		display = 'Claim approved: you got ' + claim.mintedQuantity + ' ' + token.name + ' [' + token.symbol + '] tokens';

		store.dispatch({
			type: 'APPROVE_CLAIM',
			id: id
		});

		store.dispatch({
			type: 'UPDATE_BALANCE',
			tokenAddress: claim.tokenAddr,
			balance: Number(claim.newBalance)
		});
	}

	// ------------------------------ ClaimRejected ------------------------------

	if (contractEvent === 'ClaimRejected') {
		let claim = action.event.returnValues;
		let id = claim.tokenAddr + '_' + claim.claimId; // pseudoId
		let isCurrentUsersClaim = claim.claimer === defaultAccount;

		// block: current user is not claimer / duplicate events / claim is already rejected
		let usersClaims = store.getState().fin4Store.usersClaims;
		if (!isCurrentUsersClaim || (usersClaims[id] && usersClaims[id].gotRejected)) {
			return next(action);
		}

		let token = store.getState().fin4Store.fin4Tokens[claim.tokenAddr];
		display = 'Claim on token ' + token.name + ' rejected';

		store.dispatch({
			type: 'REJECT_CLAIM',
			id: id
		});
	}

	// ------------------------------ UpdatedTotalSupply ------------------------------

	if (contractEvent === 'UpdatedTotalSupply') {
		let tokenAddr = action.event.returnValues.tokenAddr;
		let totalSupply = new BN(action.event.returnValues.totalSupply).toNumber();

		let token = store.getState().fin4Store.fin4Tokens[tokenAddr];
		if (token.totalSupply === totalSupply) {
			// block duplicate events, not sure if this can happen, but just to be sure
			return next(action);
		}

		display = null;

		store.dispatch({
			type: 'UPDATE_TOTAL_SUPPLY',
			tokenAddress: tokenAddr,
			totalSupply: totalSupply
		});
	}

	// ------------------------------ ProofApproved ------------------------------

	if (contractEvent === 'ProofApproved') {
		let approvedProof = action.event.returnValues;
		let belongsToCurrentUsersClaim = approvedProof.claimer === defaultAccount;
		let pseudoClaimId = approvedProof.tokenAddrToReceiveProof + '_' + approvedProof.claimId;

		let usersClaims = store.getState().fin4Store.usersClaims;
		if (!usersClaims[pseudoClaimId]) {
			console.log('Dev: this should not happen! Investigate why');
			return next(action);
		}

		let claim = usersClaims[pseudoClaimId];
		// block: proof-approval belongs to claim not of current user / duplicate events / proof on claim is already approved
		if (!belongsToCurrentUsersClaim || claim.proofStatuses[approvedProof.proofTypeAddress] === true) {
			return next(action);
		}

		display = 'One proof of your claim got approved'; // TODO show more info

		store.dispatch({
			type: 'APPROVE_PROOF',
			pseudoClaimId: pseudoClaimId,
			proofType: approvedProof.proofTypeAddress
		});
	}

	// ------------------------------ NewMessage ------------------------------

	if (contractEvent === 'NewMessage') {
		let msg = action.event.returnValues;
		if (msg.receiver !== defaultAccount) {
			// user is not recipient: ignore
			return next(action);
		}

		let messageId = msg.messageId.toString();
		if (messageIdAlreadyExists(store, messageId)) {
			// block duplicate events
			return next(action);
		}

		display = 'You got a new message';

		store.dispatch({
			type: 'ADD_MESSAGE_STUB',
			oneMessage: {
				messageId: messageId,
				messageType: null,
				sender: null,
				proofTypeName: null,
				message: null,
				hasBeenActedUpon: null,
				attachment: null,
				pendingApprovalId: null
			}
		});
	}

	// ------------------------------ MessageMarkedAsRead ------------------------------

	if (contractEvent === 'MessageMarkedAsRead') {
		let msg = action.event.returnValues;
		if (msg.receiver !== defaultAccount) {
			return next(action);
		}

		let messageId = msg.messageId.toString();
		if (messageHasBeenActedUpon(store, messageId)) {
			// block duplicate events
			return next(action);
		}

		display = 'Message marked as read';

		store.dispatch({
			type: 'MESSAGE_MARKED_AS_READ',
			messageId: msg.messageId.toString()
		});
	}

	// ------------------------------ SubmissionAdded ------------------------------

	if (contractEvent === 'SubmissionAdded') {
		let submission = action.event.returnValues;

		if (store.getState().fin4Store.submissions[submission.submissionId]) {
			// block duplicate events, this submission is already here
			return next(action);
		}

		let tokenObj = store.getState().fin4Store.fin4Tokens[submission.token];
		display = 'Submission added to token ' + tokenObj.symbol;

		store.dispatch({
			type: 'ADD_SUBMISSION',
			submission: submission
		});
	}

	// ------------------------------------------------------------

	if (display) {
		toast.success(display, { position: toast.POSITION.TOP_RIGHT });
	}
	return next(action);
};

const messageIdAlreadyExists = (store, messageId) => {
	let messages = store.getState().fin4Store.messages;
	for (let i = 0; i < messages.length; i++) {
		if (messages[i].messageId === messageId) {
			return true;
		}
	}
	return false;
};

const messageHasBeenActedUpon = (store, messageId) => {
	let messages = store.getState().fin4Store.messages;
	for (let i = 0; i < messages.length; i++) {
		if (messages[i].messageId === messageId) {
			return messages[i].hasBeenActedUpon;
		}
	}
	return false;
};

const findMatchingMixedCaseTokenAddress = (fin4Tokens, lowerCaseTokenAddr) => {
	let addresses = Object.keys(fin4Tokens);
	for (let i = 0; i < addresses.length; i++) {
		let addr = addresses[i];
		if (addr.toLowerCase() === lowerCaseTokenAddr) {
			return addr;
		}
	}
	return null;
};

const appMiddlewares = [contractEventNotifier];

const initialState = {
	drizzleInitialized: false,
	fin4Tokens: {},
	fin4TokensInitiallyFetched: false, // is there a more elegant solution to know this? E.g. needed in Listing.jsx
	usersClaims: {},
	usersFin4TokenBalances: {},
	usersFin4GovernanceTokenBalances: {}, // REP and GOV
	proofTypes: {},
	defaultAccount: null,
	usersEthBalance: null,
	messages: [],
	collections: {},
	parameterizerParams: {},
	systemParameters: {},
	tokenCreationDrafts: {},
	submissions: {},
	transactions: []
};

function fin4StoreReducer(state = initialState, action) {
	let i = 0;
	switch (action.type) {
		case 'ACCOUNT_BALANCE_FETCHED':
			return {
				...state,
				defaultAccount: action.account,
				usersEthBalance: window.web3.toDecimal(window.web3.fromWei(action.accountBalance, 'ether'))
			};
		case 'DRIZZLE_INITIALIZED':
			return {
				...state,
				drizzleInitialized: true
			};
		case 'ADD_FIN4_TOKEN':
			return {
				...state,
				fin4Tokens: {
					...state.fin4Tokens,
					[action.token.address]: action.token
				}
			};
		case 'ADD_MULTIPLE_FIN4_TOKENS':
			for (i = 0; i < action.tokenArr.length; i++) {
				let token = action.tokenArr[i];
				state = {
					...state,
					fin4Tokens: {
						...state.fin4Tokens,
						[token.address]: token
					}
				};
			}
			return update(state, {
				fin4TokensInitiallyFetched: { $set: true }
			});
		case 'ADD_CLAIM':
			return {
				...state,
				usersClaims: {
					...state.usersClaims,
					[action.claim.id]: action.claim
				}
			};
		case 'ADD_MULTIPLE_CLAIMS':
			for (i = 0; i < action.claimArr.length; i++) {
				let claim = action.claimArr[i];
				state = {
					...state,
					usersClaims: {
						...state.usersClaims,
						[claim.id]: claim
					}
				};
			}
			return state;
		case 'APPROVE_CLAIM':
			return {
				...state,
				usersClaims: {
					...state.usersClaims,
					[action.id]: {
						...state.usersClaims[action.id],
						isApproved: true
					}
				}
			};
		case 'REJECT_CLAIM':
			return {
				...state,
				usersClaims: {
					...state.usersClaims,
					[action.id]: {
						...state.usersClaims[action.id],
						gotRejected: true
					}
				}
			};
		case 'UPDATE_BALANCE':
			return {
				...state,
				usersFin4TokenBalances: {
					...state.usersFin4TokenBalances,
					[action.tokenAddress]: action.balance
				}
			};
		case 'UPDATE_GOVERNANCE_BALANCE': // REP and GOV
			return {
				...state,
				usersFin4GovernanceTokenBalances: {
					...state.usersFin4GovernanceTokenBalances,
					[action.tokenAddress]: action.balance
				}
			};
		case 'UPDATE_MULTIPLE_BALANCES':
			for (i = 0; i < action.tokenAddresses.length; i++) {
				state = {
					...state,
					usersFin4TokenBalances: {
						...state.usersFin4TokenBalances,
						[action.tokenAddresses[i]]: action.balances[i]
					}
				};
			}
			return state;
		case 'UPDATE_TOTAL_SUPPLY':
			return {
				...state,
				fin4Tokens: {
					...state.fin4Tokens,
					[action.tokenAddress]: {
						...state.fin4Tokens[action.tokenAddress],
						totalSupply: action.totalSupply
					}
				}
			};
		case 'ADD_MULTIPLE_PROOF_TYPES':
			for (i = 0; i < action.proofTypesArr.length; i++) {
				let proofType = action.proofTypesArr[i];
				state = {
					...state,
					proofTypes: {
						...state.proofTypes,
						[proofType.value]: proofType // TODO change value to address and label to name
					}
				};
			}
			return state;
		case 'APPROVE_PROOF':
			return {
				...state,
				usersClaims: {
					...state.usersClaims,
					[action.pseudoClaimId]: {
						...state.usersClaims[action.pseudoClaimId],
						proofStatuses: {
							...state.usersClaims[action.pseudoClaimId].proofStatuses,
							[action.proofType]: true
						}
					}
				}
			};
		case 'ADD_MULTIPLE_MESSAGES':
			return Object.assign({}, state, {
				messages: [...state.messages, ...action.messagesArr]
			});
		case 'ADD_MESSAGE_STUB':
			return Object.assign({}, state, {
				messages: [...state.messages, action.oneMessage]
			});
		case 'UPDATE_STUB_MESSAGE':
			let msg = action.message;
			return update(state, {
				messages: {
					[msg.messageId]: {
						messageType: { $set: msg.messageType },
						sender: { $set: msg.sender },
						proofTypeName: { $set: msg.proofTypeName },
						message: { $set: msg.message },
						hasBeenActedUpon: { $set: msg.hasBeenActedUpon },
						attachment: { $set: msg.attachment },
						pendingApprovalId: { $set: msg.pendingApprovalId }
					}
				}
			});
		case 'MESSAGE_MARKED_AS_READ':
			return update(state, {
				messages: {
					[action.messageId]: {
						hasBeenActedUpon: { $set: true }
					}
				}
			});
		case 'ADD_MULTIPLE_COLLECTIONS':
			for (i = 0; i < action.collectionsArr.length; i++) {
				let collection = action.collectionsArr[i];
				state = {
					...state,
					collections: {
						...state.collections,
						[collection.identifier]: collection
					}
				};
			}
			return state;
		case 'SET_PARAMETERIZER_PARAMS':
			return Object.assign({}, state, {
				parameterizerParams: action.paramsObj
			});
		case 'MARK_FIN4TOKEN_AS_OPAT':
			let matchingMixedCaseTokenAddr = findMatchingMixedCaseTokenAddress(
				state.fin4Tokens,
				action.lowerCaseTokenAddress
			);
			if (!matchingMixedCaseTokenAddr) {
				// should only happen if tokens were added to TCR that are not Fin4Tokens
				return state;
			}
			return update(state, {
				fin4Tokens: {
					[matchingMixedCaseTokenAddr]: {
						isOPAT: { $set: true }
					}
				}
			});
		case 'SET_SYSTEM_PARAMETER':
			return {
				...state,
				systemParameters: {
					...state.systemParameters,
					[action.parameter.name]: action.parameter.value
				}
			};
		case 'ADD_TOKEN_CREATION_DRAFT':
			if (action.addToCookies) {
				Cookies.set('TokenCreationDraft_' + action.draft.id, JSON.stringify(action.draft));
			}
			return {
				...state,
				tokenCreationDrafts: {
					...state.tokenCreationDrafts,
					[action.draft.id]: action.draft
				}
			};
		case 'DELETE_TOKEN_CREATION_DRAFT':
			Cookies.remove('TokenCreationDraft_' + action.draftId);
			// via https://flaviocopes.com/how-to-remove-object-property-javascript/
			const newTokenCreationDrafts = Object.keys(state.tokenCreationDrafts).reduce((object, key) => {
				if (key !== action.draftId) {
					object[key] = state.tokenCreationDrafts[key];
				}
				return object;
			}, {});
			return {
				...state,
				tokenCreationDrafts: newTokenCreationDrafts
			};
		case 'UPDATE_TOKEN_CREATION_DRAFT_FIELDS':
			let draftId = action.draftId;
			state = update(state, {
				tokenCreationDrafts: {
					[draftId]: {
						lastModified: { $set: action.lastModified },
						[action.nodeName]: { $set: action.node }
					}
				}
			});
			Cookies.set('TokenCreationDraft_' + draftId, JSON.stringify(state.tokenCreationDrafts[draftId]));
			return state;
		case 'ADD_SUBMISSION':
			return {
				...state,
				submissions: {
					...state.submissions,
					[action.submission.submissionId]: action.submission
				}
			};
		case 'ADD_MULTIPLE_SUBMISSIONS':
			for (i = 0; i < action.submissionsArr.length; i++) {
				let submission = action.submissionsArr[i];
				state = {
					...state,
					submissions: {
						...state.submissions,
						[submission.submissionId]: submission
					}
				};
			}
			return state;
		case 'DRY_RUN_FAILED':
			// this entry is not connected to a "real" transaction lifecycle
			// it only serves to provide details for the transaction log page
			return Object.assign({}, state, {
				transactions: [
					...state.transactions,
					{
						status: 'DRY_RUN_FAILED',
						methodStr: action.methodStr,
						displayStr: action.displayStr,
						err: action.errorReason,
						timestamp: Date.now()
					}
				]
			});
		case 'SEND_CONTRACT_TX':
			return Object.assign({}, state, {
				transactions: [
					...state.transactions,
					{
						stackTempKey: action.stackTempKey,
						stackId: action.stackId,
						txHash: null,
						err: null,
						status: 'SENT',
						methodStr: null,
						displayStr: null,
						receiptObj: null,
						callbackTxCompleted: null,
						callbackTxFailed: null,
						timestamp: Date.now()
					}
				]
			});
		case 'ENRICH_PENDING_TRANSACTION':
			let pendingTx_enrich = state.transactions.filter(tx => tx.stackId === action.stackId)[0];
			let index_enrich = state.transactions.indexOf(pendingTx_enrich);
			return update(state, {
				transactions: {
					[index_enrich]: {
						status: { $set: 'ENRICHED' },
						methodStr: { $set: action.methodStr },
						displayStr: { $set: action.displayStr },
						callbacks: { $set: action.callbacks },
						timestamp: { $set: Date.now() }
					}
				}
			});
		case 'TX_BROADCASTED':
			let pendingTx_broadcasted = state.transactions.filter(tx => tx.stackId === action.stackId)[0];
			let index_broadcasted = state.transactions.indexOf(pendingTx_broadcasted);
			return update(state, {
				transactions: {
					[index_broadcasted]: {
						txHash: { $set: action.txHash },
						status: { $set: 'BROADCASTED' },
						timestamp: { $set: Date.now() }
					}
				}
			});
		case 'TX_SUCCESSFUL':
			// TODO shield against transactions that don't go through our controlled lifecycle?
			let pendingTx_successful = state.transactions.filter(tx => tx.txHash === action.txHash)[0];
			let index_successful = state.transactions.indexOf(pendingTx_successful);
			console.log('Transaction completed successfully: ' + pendingTx_successful.methodStr);
			doCallback(pendingTx_successful.callbacks, 'transactionCompleted', action.receipt);
			return update(state, {
				transactions: {
					[index_successful]: {
						status: { $set: 'SUCCESSFUL' },
						receiptObj: { $set: action.receipt },
						timestamp: { $set: Date.now() }
					}
				}
			});
		case 'TX_ERROR':
			let pendingTx_error = state.transactions.filter(tx => tx.stackTempKey === action.stackTempKey)[0];
			let index_error = state.transactions.indexOf(pendingTx_error);
			toast.error('Transaction failed', { position: toast.POSITION.TOP_RIGHT });
			doCallback(pendingTx_error.callbacks, 'transactionFailed', action.error.message);
			return update(state, {
				transactions: {
					[index_error]: {
						status: { $set: 'ERROR' },
						err: { $set: action.error },
						timestamp: { $set: Date.now() }
					}
				}
			});
		default:
			return state;
	}
}

const appReducers = { fin4Store: fin4StoreReducer };

export default generateStore({
	drizzleOptions,
	appReducers,
	appMiddlewares,
	disableReduxDevTools: false // enable ReduxDevTools!
});
