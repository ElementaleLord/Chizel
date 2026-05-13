import { useState } from "react";
import axios from "axios";
import './App.css'

function App() 
{
    const [msg, setMsg] = useState("");
    const fetchHello = () => {
        axios.get("http://localhost:3000/api/hello")
            .then(response => setMsg(response.data.message))
            .catch(err => console.error(err));
    };

    const chzInit = () => {
        setMsg("running binary...");
        axios.post("http://localhost:3000/api/c_engine", { message : 'init' })
        .then(response => setMsg(response.data.result))
        .catch(err => console.error(err));
    };
    
    return (
        <div>
            <button onClick = {fetchHello}> Call Api </button>
            <button onClick = {chzInit}> Make Repo </button>
            <div>{msg}</div>
        </div>
    );
}

export default App;
