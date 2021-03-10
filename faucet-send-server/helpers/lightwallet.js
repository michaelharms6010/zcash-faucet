const Users = require("../users/users-model");
const {exec} = require("child_process");
const db = require("../data/db-config");
const Txns = require("../users/transactions/transactions-model");


module.exports = {
    getNewDeposits,
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