import './App.css';
import Axios from "axios"
import React from "react"

const zaddrRegex = /^ztestsapling[a-z0-9]{76}$/i
const taddrRegex = /^tm[a-z0-9]{33}$/i
const isValidAddress = address => zaddrRegex.test(address) && zaddrRegex.test(address)

function App() { 

  const [address, setAddress] = React.useState("")
  const [message, setMessage] = React.useState("")

  const handleChange = e => setAddress(e.target.value.split(" ").join(""))

  const sendTaz = _ => {


    if (!isValidAddress(address)) {
      setMessage("That doesn't look like a valid testnet address")
      return
    } else {
      setMessage("")
    }

    Axios.post("http://localhost:5000/sendtaz", {address})
    .then(r => console.log(r))
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
    </div>
  );
}

export default App;
