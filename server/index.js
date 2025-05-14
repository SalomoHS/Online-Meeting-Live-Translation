const http = require('http').createServer();

const io = require('socket.io')(http, {
    cors: {origin:"*"}
})

const AWS_REGION = "AWS_REGION";
const AWS_ACCESS_KEY_ID = "AWS_ACCESS_KEY_ID" 
const AWS_SECRET_ACCESS_KEY= "AWS_SECRET_ACCESS_KEY"

const SOURCE_LANGUAGE = "en-US"
const TARGET_LANGUAGE = "en-US"

const { TranscribeStreamingClient, StartStreamTranscriptionCommand } = require("@aws-sdk/client-transcribe-streaming");
const transcribeClient = new TranscribeStreamingClient({
    region: AWS_REGION,
    credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY} // Ensure this matches your AWS region
});
const { 
    TranslateClient, TranslateTextCommand 
 } = require("@aws-sdk/client-translate");
const translateClient = new TranslateClient({
    region : AWS_REGION,
    credentials : {
       accessKeyId : AWS_ACCESS_KEY_ID,
       secretAccessKey : AWS_SECRET_ACCESS_KEY,
    },
 });
 
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('translate', data => {console.log("server receive: ",data)})
    let audioStream;
    let lastTranscribe = '';
    let lastTranslate = '';
    let isTranscribing = false;

    socket.on('startTranscription', async () => {
        console.log('Starting transcription');
        isTranscribing = true;
        let buffer = Buffer.from('');

        audioStream = async function* () {
            while (isTranscribing) {
                const chunk = await new Promise(resolve => socket.once('audioData', resolve));
                if (chunk === null) break;
                buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
                // console.log('Received audio chunk, buffer size:', buffer.length);

                while (buffer.length >= 16384) {
                    yield { AudioEvent: { AudioChunk: buffer.slice(0, 16384) } };
                    buffer = buffer.slice(16384);
                }
            }
        };

        const command = new StartStreamTranscriptionCommand({
            // LanguageCode: SOURCE_LANGUAGE,
            IdentifyMultipleLanguages:true,
            LanguageOptions:"en-US,zh-CN",
            MediaSampleRateHertz: 44000,
            MediaEncoding: "pcm",
            AudioStream: audioStream()
        });

        const translateTranscribedText = async (text) => {
            const translateCommand = new TranslateTextCommand ({
               SourceLanguageCode: "zh-CN",
               Text: text,
               TargetLanguageCode: TARGET_LANGUAGE,
            });
               const translated = await translateClient.send(translateCommand);
               return translated.TranslatedText;
            
         };

        try {
            console.log('Sending command to AWS Transcribe');
            const response = await transcribeClient.send(command);
            console.log('Received response from AWS Transcribe');
            
            for await (const event of response.TranscriptResultStream) {
                if (!isTranscribing) break;
                if (event.TranscriptEvent) {
                    // console.log('Received TranscriptEvent:', JSON.stringify(event.TranscriptEvent));
                    const results = event.TranscriptEvent.Transcript.Results;
                    if (results.length > 0 && results[0].Alternatives.length > 0) {
                        const transcript = results[0].Alternatives[0].Transcript;
                        const isFinal = !results[0].IsPartial;

                        if (isFinal) {
                            console.log(transcript);
                            socket.emit('transcription', { text: transcript, isFinal: true });
                            lastTranscribe = transcript;
                            
                            translated = await translateTranscribedText(transcript)
                            socket.broadcast.emit('translate', {text: translated})
                            // lastTranslate = translated;
                        } else {
                            const newPartTranscribe = transcript.substring(lastTranscribe.length);
                            if (newPartTranscribe.trim() !== '') {
                                console.log(newPartTranscribe);
                                socket.broadcast.emit('transcription', { text: newPartTranscribe, isFinal: false });
                                translated = await translateTranscribedText(transcript)
                                socket.broadcast.emit('translate', {text: translated})
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Transcription error:", error);
            socket.emit('error', 'Transcription error occurred: ' + error.message);
        }
    });
    socket.on('translate', async (captionText) => {
        console.log("server receive: ",captionText)
        const translateTranscribedText = async (text) => {
            const translateCommand = new TranslateTextCommand ({
               SourceLanguageCode: SOURCE_LANGUAGE,
               Text: text,
               TargetLanguageCode: TARGET_LANGUAGE,
            });
               const translated = await translateClient.send(translateCommand);
               return translated.TranslatedText;
            
         };
        translated = await translateTranscribedText(captionText)
        socket.emit('translated', {text: translated})
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        isTranscribing = false;
        audioStream = null;
    });
});


http.listen(8000, () => {console.log('listening on http://localhost:8000')})