chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener(function (request, sender) {
console.log("message received", request, sender);

switch (request.type) {
    case "start-listen":
    console.log("Start Listen")
    record()
    break;
    case "start-read":
    console.log("Start read", request.second_curr_tab)
    break;
    case "get-div":
    console.log("div", request.transcriptionDiv)
    break;
}

});


const record = async () => {
    console.log("ini record")
    const existingContexts = await chrome.runtime.getContexts({});
  let recording = false;

  const offscreenDocument = existingContexts.find(
    (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
  );

  // If an offscreen document is not already open, create one.
  if (!offscreenDocument) {
    // Create an offscreen document.
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Recording from chrome.tabCapture API'
    });
  } else {
    recording = offscreenDocument.documentUrl.endsWith('#recording');
  }
  if (recording) {
    chrome.runtime.sendMessage({
      type: 'stop-recording',
      target: 'offscreen'
    });
    return;
  }
  console.log("get stream")
  // Get a MediaStream for the active tab.
  let tab = await chrome.tabs.query({ active: true, currentWindow: true})
  console.log("get stream 2")
  console.log(tab[0].id,tab[0].url)
  const streamId = await chrome.tabCapture.getMediaStreamId({
    targetTabId: tab[0].id
  });

  console.log(tab)

  // Send the stream ID to the offscreen document to start recording.
  chrome.runtime.sendMessage({
    type: 'start-recording',
    target: 'offscreen',
    data: streamId
  });
  };