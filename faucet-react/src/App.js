import './App.css';
import Axios from "axios"
import React from "react"

const zaddrRegex = /^ztestsapling[a-z0-9]{76}$/i
const taddrRegex = /^tm[a-z0-9]{33}$/i
const isValidAddress = address => zaddrRegex.test(address) || taddrRegex.test(address)

function App() { 

  const [address, setAddress] = React.useState("")
  const [message, setMessage] = React.useState("")

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
      if (r.data.txid) {      
      setMessage(`Sent TAZ - txid: ${r.data.txid}`)
      } else {
        setMessage(`Failed`)
      }

    })
    .catch(err => {
      try {
        setMessage(err.response.data.err)
      } catch {
        setMessage("Unknown Wallet Error")
      }
    })
  }

  return (
    <div className="main">
      <div className="faucet-container">
        <h2>Testnet Zcash Faucet</h2>
        <div className="input-button-pair">
          <textarea 
            name="to_address"
            value={address}
            onChange={handleChange} 
          />
          <button onClick={sendTaz}>Request</button>
        </div>
        {message && <h3>{message}</h3>}
      </div>
      <p id="disclaimer">With love from Mike at <a target="_blank" rel="noopener noreferrer" href="https://zecpages.com">Zecpages</a> 🧡</p>
    </div>
  );
}

export default App;
