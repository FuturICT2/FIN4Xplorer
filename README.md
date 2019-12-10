# FIN4Xplorer

The smart contracts are located at [FIN4Contracts](https://github.com/FuturICT2/FIN4Contracts).

<hr>

**FIN4Xplorer** is a decentralised design for a bottom-up and multidimensional finance system with the aim of making communities healthier, more social, and sustainable. It is part of the FLAG-ERA-funded project [FuturICT 2.0](https://futurict2.eu/).

<table border="0"><tr>
<td>
<a href="https://futurict2.eu/"><img src="public/project-logos/fin4x_11_with_round_dots.png" width="200" ></a></td>
<td>
<a href="https://futurict2.eu/"><img src="public/project-logos/FuturICT2_logo_on_white.png" width="250" ></a></td>
<td>
<img src="public/project-logos/Fin4_logo_on_white.jpg" width="100">
</td></tr></table>

ℹ️ [Explanatory video](http://www.youtube.com/watch?v=oNlKdHjvExo)

**FIN4Xplorer** allows any person, organisation, and public institution to create tokens, which stand for a positive action. Users can claim and prove these actions, for which they receive said tokens. By designing the system to be open to markets tailored to the respective actions, incentives are generated. The main characteristics of this system are its decentralization, immutability, rewards, and bottom-up approach.

# Setup

## Dependencies

```sh
# the basics
sudo apt-get install git build-essential python

# node v10
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
source ~/.bashrc
nvm install 10.0.0
nvm use 10.0.0

# on macOS, to prevent gyp related errors
npm explore npm -g -- npm install node-gyp@latest

# truffle
npm install -g truffle
npm install -g ganache-cli # or the GUI app from trufflesuite.com/ganache

# project
npm install # requires apparently more than 1GB of memory to run
```

Install the [MetaMask](https://metamask.io/) browser extension.

## Deploying the smart contracts

To deploy the smart contracts to a local Ganache instance, run:
```sh
truffle migrate
```

To deploy to the Rinkeby testnet, use:

```sh
truffle migrate --network rinkeby
```

This requires the file `src/config/deployment-config.json` to be added and filled. For deploying, only the first two fields are required. The *faucet-server* located under `scripts/faucet-server` uses the third field as well. If the fourth field is present, a *Request Ether* link is shown in the *About you* box on the landing page.
```json
{
    "MNEMONIC": "",
    "INFURA_API_KEY": "",
    "PRIVATE_KEY_OF_FAUCET_ACCOUNT": "",
    "FAUCET_URL": ""
}
```
The account encoded by the mnemonic is paying the deployment costs. Therefore it has to have sufficient funds on the respective network. The Infura API key can be obtained by creating a project on infura.io: it is the "Project ID" under "View Project".

## Serving the GUI

Serving the GUI can happen right after deploying the smart contracts on the same computer - but does not have to.

If they are not the same computers it is necessary:

- to copy `src/config/Fin4MainAddress.js` onto the computer serving the GUI - this file was automatically created during `truffle migrate`

- to run `truffle compile` on a computer serving the GUI that hasn't run `truffle migrate` beforehand - this creates JSON-files for each contract that are necessary for calling the contracts on the blockchain

### Development mode

This starts the React app on port 3000:

```sh
npm start
```

### Production mode

This starts the React app on port 5000:

```sh
npm run build
npm install -g serve
serve -s build # -l 3000 to use that port e.g.
```

Serving the DApp in production mode instead of development mode also solves an issue with sub-sites (e.g. `/tokens`) on mobile DApp browsers (observed in MetaMask on Android) where it would only show `cannot GET /URL` on reloading.

### Serving via localhost

To expose specific local ports temporarily to the public can be useful during development. For instance to test the DApp on mobile without having to deploy it on a testnet first and getting your code-changes to your server etc.

One way of doing so, is using [localtunnel.me](https://localtunnel.me/):

```sh
npm install -g localtunnel
```

Running these commands in two terminal windows will make both your local Ganache as well as your DApp available via public URLs. If you don't specify `--subdomain` you will get a randomized one each time.

```sh
lt --port 3000 --subdomain finfour
lt --port 7545 --subdomain finfour-ganache
```

This should result in:

```sh
your url is: https://finfour.localtunnel.me
your url is: https://finfour-ganache.localtunnel.me
```

The Ganache-URL can now be used to set up a custom network in your mobile DApp-browser App. Then make sure to restore the mobile wallet using the seed phrase from your local Ganache, otherwise you won't have any ETH. Now you should be able to open and use the DApp at the generated localtunnel-URL.

## Using the Dapp

If running locally, choose "import using account seed phrase" in MetaMask and use the `MNEMONIC` from Ganache. Create a network with `http://127.0.0.1:7545` as `custom RPC`. If running on Rinkeby, select that as your network in MetaMask and create or restore your respective account.

Once correctly connected the warnings should disappear and you are good to go.
