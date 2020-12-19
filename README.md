# React / Node zcash faucet

This is a simple testnet faucet. You can set it up on any machine running a zcashd fullnode relatively simply.

## Installation

Clone this lovely repo. do an `npm i` in both the server and the react app directories.

### Prereqs

- A server. I'm using a t2.large.
- Nodejs. I mostly use Node 12.20. Google "how to get/use nvm" if you don't know how to install Node.

#### Environment configuration:

In `/faucet-send-server/`, create a `.env` file. You'll need to specify two values in it.

```
ZCASH_RPC_CREDS=<yourusername>:<yourpassword>
MASTER_ZADDR=ztestsapling.... (The zaddr that funds faucet payments)
PUSHER_SECRET=fjdlksa
PUSHER_KEY=3jh2l
```

i used pusher as a quick, free solution for websockets. You can quickly sign up and get keys for your specific faucet. Without websockets, there's a good solution with an automated reload and an opid check, but I've not built it yet.

in `/faucet-send-server`, run `npm i` then `npm run server` (or better, use pm2 to run the server) will bring up the wallet api (this exists only so Chrome can get cors headers that it's happy with when we do our zcash rpc. if you know a better way, please let me know)

in `/faucet-react` run `npm i` to get dependencies, then `npm run build` to build the react app.

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
    rewrite ^/api(/.*)$ $1 break;
    proxy_set_header  X-Forwarded-For $remote_addr;
    proxy_set_header  X-Real-IP  $remote_addr;
    proxy_set_header  Host       $http_host;
    proxy_pass http://127.0.0.1:5000;
  }
}
```

In this way https traffic to urls matching `/api/` is routed to our node app on port 5000. Since the faucet only does one thing, that's not super helpful in this case, but it's super extensible and this node server rpc middleman thing seems to be a road travelled by many greats

Everything else in my nginx conf is just certbot boilerplate.

Assuming your server has http/https open and configured... you should be set to fly and faucet out some coinage. Nice!
