# faucet-server

This small express server acts as faucet. Users can request Ether by sending a request and if they have not more Ether then a threshold value, they are being send a small amount of Ether.

The account to be used for sending Ether from, must be specified in `config.json`:

```json
{
    "MNEMONIC": "",
    "INFURA_API_KEY": "",
    "PRIVATE_KEY_OF_FAUCET_ACCOUNT": ""
}

```

The *Infura API* key can be obtained by creating a project on infura.io: it is the *Project ID* under *View Project*.
