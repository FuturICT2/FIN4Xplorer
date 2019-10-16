pragma solidity ^0.5.0;

import 'contracts/stub/Fin4MainStub.sol';
import "contracts/proof/Fin4BaseProofType.sol";
import "contracts/stub/Fin4ClaimingStub.sol";

contract Fin4TokenBase { // abstract class

  address public Fin4MainAddress;
  address public Fin4ClaimingAddress;
  address public actionTypeCreator;
  string public description;
  string public unit;
  uint public tokenCreationTime;

  constructor(string memory _description, string memory _unit, address _actionTypeCreator) public {
    description = _description;
    unit = _unit;
    actionTypeCreator = _actionTypeCreator;
    tokenCreationTime = now;
  }

  function setAddresses(address Fin4MainAddr, address Fin4ClaimingAddr) public {
    Fin4MainAddress = Fin4MainAddr;
    Fin4ClaimingAddress = Fin4ClaimingAddr;
  }

  function name() public view returns(string memory);
  function symbol() public view returns(string memory);

  function getTokenInfo(address user) public view returns(bool, bool, string memory, string memory, string memory, string memory) {
    bool userIsAdmin = false; // TODO
    return (user == actionTypeCreator, userIsAdmin, name(), symbol(), description, unit);
  }

  // ------------------------- CLAIM -------------------------

  uint nextClaimId = 0;

	struct Claim {
    uint claimId;
    address claimer;
    bool isApproved;
    uint quantity;
    uint date;
    string comment;
    address[] requiredProofTypes;
    mapping(address => bool) proof_statuses;
  }

	mapping (uint => Claim) public claims;

  // intentional forwarding like this so that the front end doesn't need to know which token to submit a claim to at the moment of submitting it
	function submitClaim(address claimer, uint quantity, uint date, string memory comment) public returns (uint, address[] memory) {
    Claim storage claim = claims[nextClaimId];
    claim.claimId = nextClaimId;
    claim.claimer = claimer;
    claim.quantity = quantity;
    claim.date = date;
    claim.comment = comment;
    // make a deep copy because the token creator might change the required proof types, but throughout the lifecycle of a claim they should stay fix
    // TODO should they? --> #ConceptualDecision
    claim.requiredProofTypes = getRequiredProofTypes();
    // initialize all the proofs required by the action type creator with false
    // TODO isn't the default initialization false?
    for (uint i = 0; i < claim.requiredProofTypes.length; i ++) {
      claim.proof_statuses[claim.requiredProofTypes[i]] = false;
    }
    claim.isApproved = false;

    if (claim.requiredProofTypes.length == 0) {
      approveClaim(nextClaimId);
    }

    nextClaimId ++;
    return (nextClaimId - 1, claim.requiredProofTypes);
  }

  function getClaim(uint claimId) public view returns(address, bool, uint, uint, string memory, address[] memory, bool[] memory) {
    // require(claims[claimId].claimer == msg.sender, "This claim was not submitted by the sender");

    Claim storage claim = claims[claimId];
    // This assumes the proof types are still the same as when the claim was submitted
    // We probably want to support an evolving set of proof types though? TODO
    address[] memory requiredProofTypes = getRequiredProofTypes();
    bool[] memory proofTypeStatuses = new bool[](requiredProofTypes.length);
    for (uint i = 0; i < requiredProofTypes.length; i ++) {
      proofTypeStatuses[i] = claim.proof_statuses[requiredProofTypes[i]];
    }

    return (claim.claimer, claim.isApproved, claim.quantity, claim.date, claim.comment, requiredProofTypes, proofTypeStatuses);
  }

  function getClaimInfo(uint claimId) public view returns(address, bool, uint, uint, string memory) {
    return (claims[claimId].claimer, claims[claimId].isApproved,
      claims[claimId].quantity, claims[claimId].date, claims[claimId].comment);
  }

  function getClaimIds(address claimer) public view returns(uint[] memory) {
    uint count = 0;
    for (uint i = 0; i < nextClaimId; i ++) {
      if (claims[i].claimer == claimer) {
          count ++;
      }
    }
    uint[] memory ids = new uint[](count);
    count = 0;
    for (uint i = 0; i < nextClaimId; i ++) {
      if (claims[i].claimer == claimer) {
          ids[count] = i;
          count ++;
      }
    }
    return ids;
  }

  // ------------------------- METHODS USED BY PROOF TYPES -------------------------

  // Used by the MinimumInterval proof type
  function getTimeBetweenThisClaimAndThatClaimersPreviousOne(address claimer, uint claimId) public view returns(uint) {
    uint[] memory ids = getClaimIds(claimer);
    if (ids.length < 2 || ids[0] == claimId) {
      return 365 * 24 * 60 * 60 * 1000; // a year as indicator that it's not applicable (can't do -1 unfortunately)
    }
    uint previousId;
    for (uint i = 0; i < ids.length; i ++) {
      if(ids[i] == claimId) {
          return claims[claimId].date - claims[previousId].date;
      }
      previousId = ids[i];
    }
  }

  // Used by the MaximumQuantityPerInterval proof type
  function sumUpQuantitiesWithinIntervalBeforeThisClaim(address claimer, uint claimId, uint interval) public view returns(uint, uint) {
    uint[] memory ids = getClaimIds(claimer);
    if (ids.length < 2 || ids[0] == claimId) {
      return (0, claims[claimId].quantity);
    }

    uint dateOfRequestingClaim = claims[claimId].date; // TODO check if that's actually the claimers claim
    uint sum = 0;

    for (uint i = 0; i < ids.length; i ++) {
      if (ids[i] != claimId && dateOfRequestingClaim - claims[ids[i]].date <= interval) {
          sum = sum + claims[ids[i]].quantity;
      }
    }

    return (sum, claims[claimId].quantity);
  }

  // ------------------------- PROOF TYPES -------------------------

  address[] public requiredProofTypes; // a subset of all existing ones linked to Fin4Main, defined by the action type creator

  // called from ProofType contracts
  function receiveProofApproval(address proofTypeAddress, uint claimId) public returns(bool) {
    // TODO require something as guard?
    claims[claimId].proof_statuses[proofTypeAddress] = true;
    Fin4ClaimingStub(Fin4ClaimingAddress).proofApprovalPingback(address(this), proofTypeAddress, claimId, claims[claimId].claimer);
    if (_allProofTypesApprovedOnClaim(claimId)) {
      approveClaim(claimId);
    }
    return true;
  }

  function approveClaim(uint claimId) private {
    claims[claimId].isApproved = true;
    // here the minting happens, actual change of balance
    // requires the proof type calling this method to have the Minter role on this Token
    // that was granted him in Fin4Main.createNewToken()
    // can alse be called from here (Fin4TokenBase) in case of no proof types required, therefore
    // Fin4TokenBase must also have the Minter role
    mint(claims[claimId].claimer, claims[claimId].quantity);
    Fin4ClaimingStub(Fin4ClaimingAddress).claimApprovedPingback(address(this), claims[claimId].claimer, claimId);
  }

  function isMinter(address account) public view returns (bool);

  function addMinter(address account) public;

  function mint(address account, uint256 amount) public returns (bool);

  function _allProofTypesApprovedOnClaim(uint claimId) private view returns(bool) {
    for (uint i = 0; i < requiredProofTypes.length; i ++) {
      if (!claims[claimId].proof_statuses[requiredProofTypes[i]]) {
        return false;
      }
    }
    return true;
  }

  function getRequiredProofTypes() public view returns(address[] memory) {
    return requiredProofTypes;
  }

  // called for each proof type from Fin4Main.createNewToken()
  function addRequiredProofType(address proofType) public returns(bool) {
    require(Fin4MainStub(Fin4MainAddress).proofTypeIsRegistered(proofType),
      "This address is not registered as proof type in Fin4Main");
    requiredProofTypes.push(proofType);
    Fin4BaseProofType(proofType).registerActionTypeCreator(actionTypeCreator);
    return true;
  }

}
