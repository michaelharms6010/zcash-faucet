import logo from './logo.svg';
import './App.css';
import Axios from "axios"

function App() { 
  const RPC_URI = "localhost:" 

  const [address, setAddress] = React.useState("")

  const handleChange = e => setAddress(e.target.value)

  const sendTaz = _ => {
    Axios.post("localhost:5000/sendtaz", {address})
    .then(r => console.log(r))
    .catch(err => console.log(err))
  }

  return (
    <div className="main">
      <div className="faucet-container">
        <h2>Testnet Zcash Faucet</h2>
        <input 
          name="to_address"
          value={address}
          onChange={handleChange} 
        />
        <button onClick={sendTaz}>Send</button>
      </div>
    </div>
  );
}

export default App;
