
const {exec} = require("child_process");

const Pusher = require("pusher");


// todos - shuffle and env pusher creds
// move model / endpoint functions to helper file

const pusher = new Pusher({
  appId: "1126204",
  key: "4e18f1b8741914d03145",
  secret: "3d2e94c5b0a7d3af6e76",
  cluster: "us2",
  useTLS: true
});


module.exports = {
	sendFaucet,
	sync
}

function sync() {
	exec(`./testnet-zecwallet-cli sync`, (err, stdout, stderr) => {
		console.log(err)
		console.log(stderr)
		console.log(stdout)
	})
}

function sendFaucet(zaddr, time) {
	console.log("Zaddr:", zaddr)
	console.log("time:", time)
	exec(`./testnet-zecwallet-cli send ${zaddr} 1000000`, (err, stdout, stderr) => {
		console.log(err)
		console.log(stderr)
		console.log(stdout)
		stdout = "{" + stdout.split("{").slice(1).join("{")

		stdout = JSON.parse(stdout)
		
		pusher.trigger("tx-notif", `${time}`, {
				txid: stdout.txid
		});
	})
}

