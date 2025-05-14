import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const AWS_REGION = "AWS_REGION";
const AWS_ACCESS_KEY_ID = "AWS_ACCESS_KEY_ID" 
const AWS_SECRET_ACCESS_KEY= "AWS_SECRET_ACCESS_KEY"

function App() {
  const [count, setCount] = useState(0)

  const start = async() => {
    

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true})
    let curr_tab = tab.id
    chrome.runtime.sendMessage({
      action: 'StartTranscription'
    });
        
  }

  const stop = async() => {
    chrome.runtime.sendMessage({
        action: 'StopTranscription'
      });
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => start()}>
          Start Listening
        </button>
        <button onClick={() => stop()}>
          Stop Listening
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
