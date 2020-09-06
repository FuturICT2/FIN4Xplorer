// originally from www.trufflesuite.com/tutorials/drizzle-and-contract-events
import { generateStore, EventActions } from 'drizzle';
import drizzleOptions from '../config/drizzle-config';
import { toast } from 'react-toastify';
import update from 'react-addons-update';
import Cookies from 'js-cookie';
import { doCallback, txErrorAugmentation } from '../components/utils';
const BN = require('bignumber.js');

const contractEventNotifier = store => next => action => {
	/*if (action.type !== EventActions.EVENT_FIRED) {
		return next(action);
	}

	// const contract = action.name;
	const eventName = action.event.event;
	const values = action.event.returnValues;

	if (contractEventList.includes(eventName)) {
		handleContractEvent(false, eventName, values);
	}*/
	return next(action);
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
	verifierTypes: {},
	defaultAccount: null,
	usersEthBalance: null,
	messages: [],
	collections: {},
	parameterizerParams: {},
	systemParameters: {},
	tokenCreationDrafts: {},
	submissions: {},
	transactions: [],
	allUnderlyings: {},
	sourcererPairs: []
};

function fin4StoreReducer(state = initialState, action) {
	let i = 0;
	switch (action.type) {
		case 'ACCOUNT_BALANCE_FETCHED':
			return {
				...state,
				defaultAccount: action.account,
				usersEthBalance: window.web3 ? window.web3.toDecimal(window.web3.fromWei(action.accountBalance, 'ether')) : 0
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
			// could probably also just set fin4Tokens to action.tokensObj?
			// it would only not work if a new-token event comes in BEFORE this
			// here gets called, then the new token would be overwritten
			// ... playing it safe and adding it one by one instead
			for (var tokenAddress in action.tokensObj) {
				if (action.tokensObj.hasOwnProperty(tokenAddress)) {
					state = {
						...state,
						fin4Tokens: {
							...state.fin4Tokens,
							[tokenAddress]: action.tokensObj[tokenAddress]
						}
					};
				}
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
		case 'ADD_MULTIPLE_VERIFIER_TYPES':
			for (i = 0; i < action.verifierTypesArr.length; i++) {
				let verifierType = action.verifierTypesArr[i];
				state = {
					...state,
					verifierTypes: {
						...state.verifierTypes,
						[verifierType.value]: verifierType // TODO change value to address and label to name
					}
				};
			}
			return state;
		case 'SET_VERIFIER_STATUS':
			return {
				...state,
				usersClaims: {
					...state.usersClaims,
					[action.pseudoClaimId]: {
						...state.usersClaims[action.pseudoClaimId],
						verifierStatuses: {
							...state.usersClaims[action.pseudoClaimId].verifierStatuses,
							[action.verifierTypeAddress]: action.statusObj
						}
					}
				}
			};
		case 'SET_VERIFIER_MESSAGE':
			// TODO use this nice shorter syntax in the case above too
			return update(state, {
				usersClaims: {
					[action.pseudoClaimId]: {
						verifierStatuses: {
							[action.verifierTypeAddress]: {
								message: { $set: action.message }
							}
						}
					}
				}
			});
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
						verifierContractName: { $set: msg.verifierContractName },
						message: { $set: msg.message },
						hasBeenActedUpon: { $set: msg.hasBeenActedUpon },
						attachment: { $set: msg.attachment },
						pendingRequestId: { $set: msg.pendingRequestId }
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
			doCallback(pendingTx_error.callbacks, 'transactionFailed', txErrorAugmentation(action.error.message));
			return update(state, {
				transactions: {
					[index_error]: {
						status: { $set: 'ERROR' },
						err: { $set: action.error },
						timestamp: { $set: Date.now() }
					}
				}
			});
		case 'SET_UNDERLYINGS':
			return Object.assign({}, state, {
				allUnderlyings: action.allUnderlyings
			});
		case 'ADD_UNDERLYING':
			return {
				...state,
				allUnderlyings: {
					...state.allUnderlyings,
					[action.underlying.name]: action.underlying
				}
			};
		case 'SET_SOURCERER_PAIRS':
			return Object.assign({}, state, {
				sourcererPairs: action.sourcererPairs
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
