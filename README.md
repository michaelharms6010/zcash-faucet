# React / Node zcash faucet

This is a simple testnet faucet. You can set it up on any machine running a zcashd fullnode relatively simply.

Environment configuration:
at the root `/raucet-send-server/`, create a `.env` file. You'll need to specify two values in it.

```
ZCASH_RPC_CREDS=<yourusername>:<yourpassword>
MASTER_ZADDR=ztestsapling.... (a funded zaddr where faucet payments will come from)
```

From there you can simply clone the repo, do `npm i` inside both directories

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

Everything else in my nginx conf is just certbot  boilerplate.
