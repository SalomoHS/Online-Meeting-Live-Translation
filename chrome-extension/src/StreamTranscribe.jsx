import {
    TranscribeStreamingClient,
    StartStreamTranscriptionCommand,
  } from "@aws-sdk/client-transcribe-streaming";
  import MicrophoneStream from "microphone-stream";
  import { Buffer } from "buffer";
  
  let microphoneStream = undefined;
  const language = "en-US";
  const SAMPLE_RATE = 44100;
  let transcribeClient = undefined;

const createMicrophoneStream = async () => {
    console.log("inside function")
    await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
    })
};

export default createMicrophoneStream;