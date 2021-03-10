import './App.css';
import Axios from "axios"
import React from "react"
import Pusher from 'pusher-js';

const zaddrRegex = /^ztestsapling[a-z0-9]{76}$/i
const taddrRegex = /((^tm[a-z0-9]{33}$)|(^t2[a-z0-9]{33}$))/i
const isValidAddress = address => zaddrRegex.test(address) || taddrRegex.test(address)

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

    Axios.post("https://faucet.zecpages.com/api/sendtaz", {address})
    .then(r => {
      if (r.data.opid) {

        var channel = pusher.subscribe('tx-notif');
        channel.bind(r.data.opid, function(data) {
          if (data.txid) {
          setMessage(`Sent TAZ - txid: ${data.txid}`)
          } else {
            setMessage(data.error)
          }
        });      
      } else {
        setMessage(`Failed`)
      }

    })
    .catch(err => {
      try {
        if (err && err.response && err.response.data && err.response.data.err) {
        setMessage(err.response.data.err)
        }
      } catch {
        setMessage("Unknown Wallet Error")
      }
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
      <p id="disclaimer">With love from <a href="https://twitter.com/michaelharms70" target="_blank" rel="noopener noreferrer" >Mike</a> at <a target="_blank" rel="noopener noreferrer" href="https://zecpages.com">Zecpages</a> 🧡</p>
    </div>
  );
}

export default App;
