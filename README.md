# React / Node zcash faucet

This is a simple zcash faucet (currently configured for testnet, just change the ports in rpc.js for mainnet). You can set it up on any machine running a zcashd fullnode relatively simply.

## Installation

Clone this repo. Install dependencies in both the react and node app with `npm i`
```
cd 
```
### Prereqs

- A server running ubuntu
- Node 12+. https://github.com/nvm-sh/nvm - Install this per its instructions, then
```
nvm install v12
nvm use v12
```

#### Environment configuration:

In `faucet-send-server/`, create a `.env` file. The faucet uses a few things, but the most important is your Zcash RPC creds - these authenticate with your full node.

```
ZCASH_RPC_CREDS=<yourusername>:<yourpassword>
MASTER_ZADDR=ztestsapling.... (The zaddr that funds faucet payments)
PUSHER_APP_ID=111111111
PUSHER_KEY=4e1xxxxxxxxxxxxa1
PUSHER_SECRET=3d2xxxxxxxxxxxxxx // Pusher notif provider creds - used for delivering txid back to user
```

in `faucet-send-server/` run `npm i`, `npm run server` (or better, use pm2 to run the server) start the node api. It has two roles: Rate limiting and middle-manning Zcash RPC requests. It has a sqlite db that it uses to count requests and handle rate limiting.

in `faucet-react/` run `npm run build` to build the react app.

If you can't/don't want to run a full node, check out `faucet-send-server/helpers/lightwallet.js` for some example helper functions using [zecwallet-cli](https://github.com/adityapk00/zecwallet-light-cli) and child processes. You'll also have to add your own zecwallet-cli inside `faucet-send-server/` for this to work.

You can wire the apps together via nginx thusly:

```
server {
  server_name faucet.zecpages.com;
  root /home/ubuntu/zcash-faucet/faucet-react/build;
  index index.html;
  location / {
    try_files /maintenance.html $uri $uri/ =404;
  }

  location /api/ {
    proxy_set_header  X-Forwarded-For $remote_addr;
    proxy_set_header  X-Real-IP  $remote_addr;
    proxy_set_header  Host       $http_host;
    proxy_pass http://127.0.0.1:5000/;
  }
}
```

In this way https traffic to urls matching `/api/` is routed to our node app on port 5000. Since the faucet only does one thing, that's not super helpful in this case, but it's super extensible and this node server rpc middleman thing seems to be a road travelled by many greats

Everything else in my nginx conf is just certbot boilerplate.

Assuming your server has http/https open and configured... you should be set to fly and faucet out some coinage. Nice!
