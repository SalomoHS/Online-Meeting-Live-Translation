

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.action === "StartTranscription") {
      console.log("Received recorder start streaming message", request);
      chrome.runtime.sendMessage({ action: "transcription", data: "Hello from the tab!" });

    //   startStreaming();
    // startListen();
    } else if (request.action === "StopTranscription") {
      console.log("Received recorder stop streaming message", request);
    //   stopStreaming();
    // stopListen();
    }
}); 
const Ask = async () => {
    // first request permission to use camera and microphone
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
}

  /* globals */
let audioProcessor = undefined;
let displayAudioSource;
let samplingRate = 44100;

// let caption_box;

let audioContext;
let audioInput;
let processor;

const caption_box = document.getElementById("caption")
const translate_box = document.getElementById("translate")

let socket = io("ws://localhost:8000");

socket.on('transcription', data => {
    console.log('Received transcription:', data);
    let lastIndex = 0
    let currTranscribe = data.text
    currTranscribe = currTranscribe.split(" ").slice(-25).join(" ")
    caption_box.innerHTML = currTranscribe
    
});

socket.on('translate', data => {
    console.log('Received translate:', data);
    let lastIndex = 0
    let currTranslate = data.text
    currTranslate = currTranslate.split(" ").slice(-25).join(" ")
    translate_box.innerHTML = currTranslate
    
});

socket.on('error', errorMessage => {
    console.error('Server error:', errorMessage);
    caption_box.innerHTML += '\nError: ' + errorMessage;
});

console.log('Client-side script loaded');
  
  /* Helper funcs */
const bytesToBase64DataUrl = async (bytes, type = "application/octet-stream") => {
    return await new Promise((resolve, reject) => {
        const reader = Object.assign(new FileReader(), {
        onload: () => resolve(reader.result),
        onerror: () => reject(reader.error),
        });
        reader.readAsDataURL(new File([bytes], "", { type }));
    });
}
  
const pcmEncode = (input) => {
    const buffer = new ArrayBuffer(input.length * 2);   
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i += 1) {
        const s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
};
  
const convertToMono = (audioSource) => {
    const splitter = audioContext.createChannelSplitter(2);
    const merger = audioContext.createChannelMerger(1);
    audioSource.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 1, 0);
    return merger;
};
  
const stopStreaming = async () => {
    console.log('Stop button clicked');
    if (audioContext && audioContext.state !== 'closed') {
        audioInput.disconnect();
        processor.disconnect();
        audioContext.close();
        socket.emit('stopTranscription');
    }
}

async function startStreaming() {
    console.log('Start button clicked');
    try {
        // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        displayStream = await navigator.mediaDevices.getDisplayMedia({
            preferCurrentTab: true,
            video: true,
            audio: {
                noiseSuppression: true,
                autoGainControl: true,
                echoCancellation: true,
            }
        });
        console.log('Microphone access granted');
        audioContext = new AudioContext();
        audioInput = audioContext.createMediaStreamSource(displayStream);
        let monoDisplaySource = convertToMono(audioInput);
        processor = audioContext.createScriptProcessor(16384, 1, 1);
        monoDisplaySource.connect(processor);
        processor.connect(audioContext.destination);

        // displayStream.getAudioTracks()[0].onended = () => {
        //     stopStreaming();
        // };

        processor.onaudioprocess = (e) => {
            const float32Array = e.inputBuffer.getChannelData(0);
            const int16Array = new Int16Array(float32Array.length);
            for (let i = 0; i < float32Array.length; i++) {
                int16Array[i] = Math.max(-32768, Math.min(32767, Math.floor(float32Array[i] * 32768)));
            }
            console.log('Sending audio chunk to server, size:', int16Array.buffer.byteLength);
            socket.emit('audioData', int16Array.buffer);
            // const buffer = new ArrayBuffer(e.length * 2);   
            // const view = new DataView(buffer);
            // for (let i = 0; i < e.length; i += 1) {
            //     const s = Math.max(-1, Math.min(1, e[i]));
            //     view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
            // }
            // console.log('Sending audio chunk to server, size:', buffer.byteLength);
            // socket.emit('audioData', buffer);
        };

        socket.emit('startTranscription');
        console.log('startTranscription event emitted');
    } catch (error) {
        console.error('Error accessing microphone:', error);
    }
}



function stopListen (){
    console.log("stop listening")
    observer.disconnect()
}

  socket.on('translated', translatedText => {console.log('Translated', translatedText)})

  
console.log("Inside the recorder.js");