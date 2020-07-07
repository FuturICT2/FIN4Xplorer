const IPFS = require('ipfs-http-client');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
// const ipfs = new IPFS('ipfs.dappnode'); // requires VPN connection to DAppNode

export default ipfs;
