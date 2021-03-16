const Users = require("../users/users-model");
const {exec} = require("child_process");
const db = require("../data/db-config");
const Txns = require("../users/transactions/transactions-model");

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
    getNewDeposits,
	sendFaucet
}

function sendFaucet(zaddr, time) {
	exec(`./zecwallet-cli send 1000000 ${zaddr}`, (err, stdout, stderr) => {
		console.log(err)
		console.log(stderr)
		console.log(stdout)
		stdout = JSON.parse(stdout)
		var ip = "0.0.0.0"

		pusher.trigger("tx-notif", time, {
				txid: stdout.txid
		});
	})
}


function getNewDeposits() {
    exec("./zecwallet-cli list", (err, stdout, stderr) => {
		if(err) {
			console.log(err)
		} else {
			try {
				stdout = JSON.parse(stdout).filter(tx => tx.amount > 0 && tx.datetime > (Date.now()/1000) - ( 60 * 60) )
				for (let i= 0 ; i < stdout.length; i++) {
					let walletTx = stdout[i]
                    let memo = walletTx.memo.trim()
                    let newTx = {};
                    newTx.amount = +walletTx.amount
					newTx.txid = walletTx.txid
					newTx.memo = memo;
                    
                    Users.findBy({deposit_id: memo})
                    .then(async user => {
						if (user) {
							newTx.user_id = user.id;
							await Txns.add(newTx)
						} else {
							console.log("could not find deposit id:", memo)
						}
                    })
                    .catch(err => console.log(err))
				}
			} catch {
				console.log("error parsing stdout")
				console.log(stderr)
			}
			console.log(stdout)
		}
	})
}