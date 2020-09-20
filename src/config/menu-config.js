import ListIcon from '@material-ui/icons/List';
import CheckIcon from '@material-ui/icons/CheckCircle';
import HomeIcon from '@material-ui/icons/Home';
import GroupIcon from '@material-ui/icons/Group';
import Home from '../views/Home/Home';
import Campaign from '../views/Campaigns/Campaign';
import CampaignCreationProcess from '../views/Campaigns/CampaignCreationProcess';
import Claim from '../views/claims/Claim';
import TokenView from '../views/tokens/TokenView';
import Token from '../views/tokens/Token';
import ProofSubmission from '../views/claims/ProofSubmission';
import Collections from '../views/collections/Collections';
import CollectionView from '../views/collections/CollectionView';
import CollectionEdit from '../views/collections/CollectionEdit';
import UserMessage from '../views/users/UserMessage';
import UserTransfer from '../views/users/UserTransfer';
import Settings from '../views/Settings';
import About from '../views/About';
import Groups from '../views/users/Groups';
import GroupEdit from '../views/users/GroupEdit';
import Listing from '../views/CuratedTokens/Listing';
import Management from '../views/CuratedTokens/Management';
import Governance from '../views/CuratedTokens/Governance';
import Messages from '../views/Messages';
import TokenCreationProcess from '../views/tokens/TokenCreationProcess';
import TokenTextSubmissions from '../views/tokens/TokenTextSubmissions';
import TokenPictureSubmissions from '../views/tokens/TokenPictureSubmissions';
import TokenVoteSubmissions from '../views/tokens/TokenVoteSubmissions';
import TransactionLog from '../views/TransactionLog';
import DepositCollateral from '../views/underlying/DepositCollateral';
import ConvertToCollateral from '../views/underlying/ConvertToCollateral';
import AddNewSourcererPair from '../views/underlying/AddNewSourcererPair';
import CampaignView from '../views/Campaigns/CampaignView';

const menu = [
	{
		component: Home,
		path: '/',
		label: 'Home',
		icon: HomeIcon,
		showInNavBar: true // SHOW IN NAVBAR
	},
	// ------------------ TOKENS ------------------
	{
		component: Token,
		path: '/tokens',
		label: 'Tokens',
		icon: ListIcon,
		showInNavBar: true // SHOW IN NAVBAR
	},
	{
		component: TokenCreationProcess,
		path: '/token/create/:draftId',
		showInNavBar: false
	},
	{
		component: TokenCreationProcess,
		path: '/token/create/:draftId/:stepId',
		showInNavBar: false
	},
	{
		component: TokenView,
		path: '/token/view/',
		showInNavBar: false
	},
	{
		component: TokenView,
		path: '/token/view/:tokenSymbol',
		showInNavBar: false
	},
	// ------------------ SUBMISSIONS ON TOKENS ------------------
	// Submissions on proof types or per user also possible #ConceptualDecision
	{
		component: TokenTextSubmissions,
		path: '/token/submissions/:tokenSymbol/text',
		showInNavBar: false
	},
	{
		component: TokenPictureSubmissions,
		path: '/token/submissions/:tokenSymbol/picture',
		showInNavBar: false
	},
	{
		component: TokenVoteSubmissions,
		path: '/token/submissions/:tokenSymbol/vote',
		showInNavBar: false
	},
	// ------------------CAMPAIGN -----------------
	{
		component: Campaign,
		path: '/campaigns',
		label: 'Campaigns',
		icon: GroupIcon,
		showInNavBar: true // SHOW IN NAVBAR
	},
	{
		component: CampaignCreationProcess,
		path: '/campaigns/create',
		showInNavBar: false
	},
	{
		component: CampaignCreationProcess,
		path: '/campaigns/create/:draftId',
		showInNavBar: false
	},
	{
		component: CampaignCreationProcess,
		path: '/campaigns/create/:draftId/:stepId',
		showInNavBar: false
	},
	{
		component: CampaignView,
		path: '/campaigns/view/',
		showInNavBar: false
	},
	// ------------------ CLAIMS ------------------
	{
		component: Claim,
		path: '/claims',
		label: 'Claims',
		icon: CheckIcon,
		showInNavBar: true // SHOW IN NAVBAR
	},
	{
		component: Claim,
		path: '/claim/:tokenSymbol',
		showInNavBar: false
	},
	{
		component: ProofSubmission,
		path: '/claim/:tokenSymbol/proof/:claimId',
		showInNavBar: false
	},
	// ------------------ COLLECTIONS ------------------
	{
		component: Collections,
		path: '/collections/',
		showInNavBar: false
	},
	{
		component: CollectionView,
		path: '/collection/:collectionIdentifier',
		showInNavBar: false
	},
	{
		component: CollectionEdit,
		path: '/collection/edit/:collectionIdentifier',
		showInNavBar: false
	},
	// ------------------ USERS ------------------
	{
		component: Messages,
		path: '/messages',
		showInNavBar: false
	},
	{
		component: UserMessage,
		path: '/user/message',
		showInNavBar: false
	},
	{
		component: UserMessage,
		path: '/user/message/:userAddress',
		showInNavBar: false
	},
	{
		component: UserTransfer,
		path: '/user/transfer',
		showInNavBar: false
	},
	{
		component: UserTransfer,
		path: '/user/transfer/:tokenSymbol',
		showInNavBar: false
	},
	{
		component: UserTransfer,
		path: '/user/transfer/:tokenSymbol/:userAddress',
		showInNavBar: false
	},
	{
		component: UserTransfer,
		path: '/user/transfer/:tokenSymbol/:userAddress/:transferAmount',
		showInNavBar: false
	},
	{
		component: Groups,
		path: '/users/groups/',
		showInNavBar: false
	},
	{
		component: GroupEdit,
		path: '/users/group/edit/:groupId',
		showInNavBar: false
	},
	// ------------------ GOVERNANCE ------------------
	{
		component: Listing,
		path: '/governance/listing',
		showInNavBar: false
	},
	{
		component: Management,
		path: '/governance/management',
		showInNavBar: false
	},
	{
		component: Governance,
		path: '/governance/parameters',
		showInNavBar: false
	},
	// ------------------ SETTINGS ------------------
	{
		component: Settings,
		path: '/settings',
		showInNavBar: false
	},
	// ------------------ ABOUT ------------------
	{
		component: About,
		path: '/about',
		showInNavBar: false
	},
	// ------------------ TRANSACTION LOG ------------------
	{
		component: TransactionLog,
		path: '/transactions',
		showInNavBar: false
	},
	// ------------------ UNDERLYING ------------------
	{
		component: DepositCollateral,
		path: '/underlying/deposit',
		showInNavBar: false
	},
	{
		component: DepositCollateral,
		path: '/underlying/deposit/:sourcererName/:patToken/:collateralToken', // token: symbol or address
		showInNavBar: false
	},
	{
		component: DepositCollateral,
		path: '/underlying/deposit/:sourcererName/:patToken/:collateralToken/:amount',
		showInNavBar: false
	},
	{
		component: ConvertToCollateral,
		path: '/underlying/convert',
		showInNavBar: false
	},
	{
		component: ConvertToCollateral,
		path: '/underlying/convert/:sourcererName/:patToken/:collateralToken', // token: symbol or address
		showInNavBar: false
	},
	{
		component: ConvertToCollateral,
		path: '/underlying/convert/:sourcererName/:patToken/:collateralToken/:amount',
		showInNavBar: false
	},
	// ------------------ SOURCERERS ------------------
	{
		component: AddNewSourcererPair,
		path: '/sourcerer/new-pair/:patToken',
		showInNavBar: false
	}
];

export default menu;
