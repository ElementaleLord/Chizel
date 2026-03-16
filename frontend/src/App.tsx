import { useEffect, useState } from "react";
import axios from "axios";
import './App.css'

function App() 
{
    const [msg, setMsg] = useState("");

    useEffect(() => {
        axios.get("http://localhost:3000/api/hello")
        .then(response => setMsg(response.data.message))
        .catch(err => console.error(err));
    }, []);
    
    return <div>{msg}</div>
}

export default App;
