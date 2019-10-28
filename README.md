# FIN4Xplorer

## Context

**FIN4Xplorer** is a decentralised design for a bottom-up and multidimensional finance system with the aim of making communities healthier, more social, and sustainable. It is part of the FLAG-ERA-funded project [FuturICT 2.0](https://futurict2.eu/).

<table border="0"><tr><td>
<a href="https://futurict2.eu/"><img src="public/project-logos/FuturICT2_logo_on_white.png" width="250" ></a></td>
<td>
<img src="public/project-logos/Fin4_logo_on_white.jpg" width="100">
</td></tr></table>

ℹ️ [Explanatory video FIN4](http://www.youtube.com/watch?v=oNlKdHjvExo)
ℹ️ [Explanatory video Accepted Tokens](https://www.youtube.com/watch?v=1bircSUBNm0)

## Description

**FIN4Xplorer** allows any person, organisation, and public institution to create tokens, which stand for a positive action. Users can claim and prove these actions, for which they receive said tokens. By designing the system to be open to markets tailored to the respective actions, incentives are generated. The main characteristics of this system are its decentralization, immutability, rewards, and bottom-up approach.

## Quick start

### Install dependencies

```sh
# the basics
sudo apt-get install git build-essential python

# node v10
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
source ~/.bashrc
nvm install 10.16.0
nvm use 10.16.0

# on macOS, to prevent gyp related errors
npm explore npm -g -- npm install node-gyp@latest

# truffle
npm install -g truffle
npm install -g ganache-cli

# project
npm install # requires apparently more than 1GB of memory to run
```

### For deployment
Add and fill this file: `src/config/deployment-config.json`
```json
{
    "MNEMONIC": "",
    "INFURA_API_KEY": "",
    "PRIVATE_KEY_OF_FAUCET_ACCOUNT": "",
    "FAUCET_URL": ""
}
```

The mnemonic gets used for deploying (e.g. `truffle migrate --network rinkeby`), therefore the account has to have sufficient funds on the respective network. The infura API key can be obtained by creating a project on infura.io: it is the "Project ID" under "View Project".

#### Mapping port 3000 to 80 (optional)

To serve your application on the default port `80` (and therefore have the port number dissapear in the browser) instead of `3000`, you can use `nginx` in the following way (copied from [here](https://link.medium.com/MW5iaxQ96Z)):
```sh
sudo apt-get install nginx
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/fin4x
```
Paste this in:
```sh
server {
  listen 80;
  server_name fin4x;
  location / {
    proxy_set_header  X-Real-IP  $remote_addr;
    proxy_set_header  Host       $http_host;
    proxy_pass        http://127.0.0.1:3000;
  }
}
```
```sh
sudo ln -s /etc/nginx/sites-available/fin4x /etc/nginx/sites-enabled/fin4x
sudo service nginx restart
```

### Compile and migrate the smart contracts

1. `npm run start-ganache`
2. `npm run migrate`
4. install the [MetaMask](https://metamask.io/) browser extension, paste the `MNEMONIC` from Ganache into the `seed` input and create a network with `http://127.0.0.1:7545` as `custom RPC`

### Use the app
```sh
npm start
```

## Docs

Our documentation is located at [fin4xplorer.readthedocs.io](https://fin4xplorer.readthedocs.io/en/latest/) in English and German.

To update the `.po` files for the German translation in `docs/locales/de` run:

```sh
sphinx-intl update -p _build/gettext -l de
```

If you haven't done so before or if it doesn't update properly, delete the `_build` folder and run this `build` command:

```sh
sphinx-build -b gettext . _build/gettex
```

Then run the `update` command again.
