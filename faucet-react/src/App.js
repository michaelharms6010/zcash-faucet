import './App.css';
import Axios from "axios"
import React from "react"
import Pusher from 'pusher-js';
import NewTabLink from "./components/NewTabLink"
import zomgLogo from "./images/zomg-logo.png"

const zaddrRegex = /^ztestsapling[a-z0-9]{76}$/i
const taddrRegex = /((^tm[a-z0-9]{33}$)|(^t2[a-z0-9]{33}$))/i
const uaddrRegex = /^utest\w{212}$/i
const oaddrRegex = /^utest1[a-z0-9]{104}$/

const isValidAddress = address => zaddrRegex.test(address) || taddrRegex.test(address) || uaddrRegex.test(address) || oaddrRegex.test(address)

var pusher;

function App() { 

  const [address, setAddress] = React.useState("")
  const [message, setMessage] = React.useState(".")

  React.useEffect(() => {
    pusher = new Pusher('4e18f1b8741914d03145', {
      cluster: 'us2'
    });
    Pusher.logToConsole = false;

    
  }, [])

  const handleChange = e => setAddress(e.target.value.split(/[ \n\t]/).join(""))

  const sendTaz = _ => {


    if (!isValidAddress(address)) {
      setMessage("That doesn't look like a valid testnet address")
      return
    } else {
      setMessage("Sending TAZ . . . ")
      
    }
    const nonce = Date.now()
    Axios.post("https://faucet.zecpages.com/api/sendtaz", {time:  nonce, address})
    .then(r => {
      if (r.status === 200) {
        if (r.data.txid) {
          setMessage(`Sent TAZ - txid: ${r.data.txid}`)

        } else {

          
          var channel = pusher.subscribe('tx-notif');
          channel.bind(`${nonce}`, function(data) {
            if (data.txid) {
              setMessage(`Sent TAZ - txid: ${data.txid}`)
            } else {
              setMessage(data.error)
            }
          });      
        }
      } else {
        setMessage(`Failed`)
      }

    })
    .catch(err => {
      console.log(err)
      setMessage(`Send failed - please try again in a couple minutes`)
    })
  }



    

  return (
    <div className="main">
      <div className="faucet-container">
        <h2>Testnet Zcash (TAZ) Faucet</h2>
        <div className="input-button-pair">
          <textarea 
            placeholder="ztestsapling... or tm..."
            name="to_address"
            value={address}
            onChange={handleChange} 
          />
          <button onClick={sendTaz}>Request TAZ</button>
        </div>
        <h3 style={{color: message === "." ? "#333" : "#f9bb00"}} className="zaddr">{message}</h3>
      </div>
      <p id="disclaimer">With love from <NewTabLink href="https://zecpages.com">Zecpages</NewTabLink> 🧡 <br/>
        <span className="zomg-credit">and a grant from <NewTabLink className="zomg-link" href="https://zcashomg.org/">ZOMG<img className="zomg-logo" src={zomgLogo} alt="Zcash Open Major Grants Logo"/></NewTabLink></span>
      </p>
    </div>
  );
}

export default App;
