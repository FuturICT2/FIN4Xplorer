pragma solidity ^0.5.8;

import "./ERC20Plus.sol";
import "./../tcr/Parameterizer.sol";
import "./../tcr/Registry.sol";
import "./../tcr/PLCR/PLCRVoting.sol";

/**
  * @title GOV
  * @dev Token used for governance
 */
contract GOV is ERC20Plus {

  // The tokens that you delegated to someone else
  // mapping(address => address[]) private delegatorTokensIndexes;
  mapping(address => mapping(address => uint256)) private delegatorTokens;
  // Total amount of tokens a user has delegated
  mapping(address => uint256) private delegatorTokensTotal;
  // The tokens that have been delagated to you
  mapping(address => uint256) private delegateeTokens;

  PLCRVoting public voting;
  Parameterizer public parameterizer;
  Registry public registry;

  constructor(
    string memory _name,
    string memory _symbol,
    uint8 _decimals,
    address minter,
    bool _isBurnable,
    bool _isTransferable,
    bool _isMintable,
    uint _initialSupply)
      ERC20Plus(_name,_symbol, _decimals, minter, _isBurnable, _isTransferable, _isMintable, _initialSupply)
      public{}

  function init(address _registry, address _parameterizer, address _voting) public {
      require(_registry != address(0) && address(registry) == address(0), "Contract already initialized");
      registry = Registry(_registry);
      parameterizer = Parameterizer(_parameterizer);
      voting = PLCRVoting(_voting);
  }

  /* TODO:
  function getAmountsIDelegatedToOthers() public returns(address[] memory, uint256[] memory) {
    uint256[] memory tokens = new uint256[](delegatorTokensIndexes[msg.sender].length);
    for (uint i = 0; i<delegatorTokensIndexes[msg.sender].length; i++){
        tokens[i] = delegatorTokens[msg.sender][delegatorTokensIndexes[msg.sender][i]];
    }
    return (delegatorTokensIndexes[msg.sender], tokens);
  }
  */

  function getAmountsDelegatedByAUser(address tokenHolder) public returns(uint256) {
    return (delegatorTokensTotal[tokenHolder]);
  }

  function getAmountsDelegatedToMe() public returns(uint256) {
    return (delegateeTokens[msg.sender]);
  }

  function delegate(address to, uint256 amount) public returns (bool){
    require(msg.sender != to, "You cannot delegate to yourself");
    require(balanceOf(msg.sender) - delegateeTokens[msg.sender] >= amount, "You do not have enough tokens for this transaction");

    // delegatorTokensIndexes.push(to);
    delegatorTokens[msg.sender][to] += amount;
    delegateeTokens[to] += amount;
    delegatorTokensTotal[msg.sender] += amount;
    _transfer(msg.sender, to, amount);
    return true;
  }

  function refundDelegation(address to, uint256 amount) public returns (bool){
    require(balanceOf(to) >= amount, "The balance of reciver is too low");
    require(delegatorTokens[msg.sender][to] >= amount, "You do not have that much delegation for this account");

    // TODO: remove from
    delegatorTokens[msg.sender][to] -= amount;
    delegateeTokens[to] -= amount;
    delegatorTokensTotal[msg.sender] -= amount;


    _transfer(to, msg.sender, amount);
    return true;
  }

  function transfer(address recipient, uint256 amount) public returns (bool) {
    require (balanceOf(msg.sender) > amount, "transfer: Not enough balance");
    if(msg.sender != address(voting) && msg.sender != address(parameterizer) && msg.sender != address(registry)){
      require(recipient == address(voting) || recipient == address(parameterizer) || recipient == address(registry),
        "You do not have enough Tokens. You can only use delegated tokens on Registry contracts");
    }
    return super.transfer(recipient, amount);
  }

  function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
    require (balanceOf(sender) >= amount, "transferFrom: Not enough balance");
    if(sender != address(voting) && sender != address(parameterizer) && sender != address(registry)){
      require(recipient == address(voting) || recipient == address(parameterizer) || recipient == address(registry),
        "You do not have enough Tokens. You can only use delegated tokens on Registry contracts");
      }
    return super.transferFrom(sender, recipient, amount);
  }
}
