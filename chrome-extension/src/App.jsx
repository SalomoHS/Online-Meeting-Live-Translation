import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import createMicrophoneStream from "./StreamTranscribe"

const AWS_REGION = "ap-southeast-1";
const AWS_ACCESS_KEY_ID = "AKIAQXPZDB6CHUD3ORD7" 
const AWS_SECRET_ACCESS_KEY= "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"
console.log("inside-stream.js")


function App() {
  const [count, setCount] = useState(0)

  const start = async() => {
    

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true})
    let curr_tab = tab.id
    // chrome.runtime.sendMessage({ type: "start-listen", curr_tab });
    
    // // window.open("http://127.0.0.1:5500/blank.html");
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },

      func: async () => {
        const iframe = document.createElement("iframe");
        iframe.id = "microphone";
        iframe.setAttribute("hidden", "hidden");
        iframe.setAttribute("id", "permissionsIFrame");
        iframe.setAttribute("allow", "microphone; camera; display-capture;");
        iframe.src = chrome.runtime.getURL("recorder.html");
        document.body.appendChild(iframe);
        console.log("-----LMA-------injected iframe")
        // createMicrophoneStream()
        const stream = navigator.mediaDevices.getDisplayMedia({
                      video: false,
                      audio: true,
                    });
      }})
      chrome.runtime.sendMessage({
        action: 'StartTranscription'
      });
        
      // });
        
        
        // await startRecording((text) => {
        //     transcription += text;
        //     transcriptionDiv.innerHTML = transcription;
        //     console.log(transcription)
        //   });
      //   navigator.mediaDevices.getUserMedia({ audio: {
      //     noiseSuppression: true,
      //     autoGainControl: true,
      //     echoCancellation: true,
      // } });
    //   transcribeClient = new TranscribeStreamingClient({
    //     region: "ap-southeast-1",
    //     credentials: {
    //     accessKeyId: "AKIAQXPZDB6CHUD3ORD7",
    //     secretAccessKey: "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",
    //     },
    // })

  //   const command = new StartStreamTranscriptionCommand({
  //     // LanguageCode: language,
  //     IdentifyMultipleLanguages:true,
  //     LanguageOptions:"en-US,id-ID",
  //     // PreferredLanguage:"en-US",
  //     MediaEncoding: "pcm",
  //     MediaSampleRateHertz: SAMPLE_RATE,
  //     AudioStream: getAudioStream(),
  // });
  // const data = await transcribeClient.send(command);
  // for await (const event of data.TranscriptResultStream) {
  //     const results = event.TranscriptEvent.Transcript.Results;
  //     if (results.length && !results[0]?.IsPartial) {
  //     const newTranscript = results[0].Alternatives[0].Transcript;
  //     console.log(newTranscript);
  //     callback(newTranscript + " ");
  //     }
  // }
      // }
    // })

    // let [second_tab] = await chrome.tabs.query({ url: "http://127.0.0.1:5500/blank.html"})
    // let second_curr_tab = second_tab.id
    // chrome.runtime.sendMessage({ type: "start-read", second_curr_tab });

    // chrome.scripting.executeScript({
    //   target: { tabId: second_tab.id },
    //   func: () => {
    //     transcriptionDiv = document.getElementById("transcription");
    //   }
    // })
    // createMicrophoneStream()
    // chrome.runtime.sendMessage({ type: "get-div", transcriptionDiv });
    // console.log("Success access second page",transcriptionDiv)
    // await startRecording((text) => {
    //   transcription += text;
    //   transcriptionDiv.innerHTML = transcription;
    // });
    // );
    // await startRecording((text) => {
    //   transcription += text;
    //   transcriptionDiv.innerHTML = transcription;
    // })
  }

  const stop = async() => {
    // const url = await window.open("http://127.0.0.1:5500/blank.html");
    // const newTab = await chrome.tabs.create({ url }); 

    stopRecording();
    transcription = ""
    // stopRecording();
    // transcription = ""
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
