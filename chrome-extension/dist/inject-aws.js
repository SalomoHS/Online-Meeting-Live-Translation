const iframe = document.createElement("iframe");
iframe.id = "aws";
iframe.setAttribute("hidden", "hidden");
iframe.setAttribute("id", "aws");
iframe.setAttribute("allow", "microphone; camera; display-capture;");
iframe.src = chrome.runtime.getURL("aws.html");
document.body.appendChild(iframe);
console.log("-----AWS-------injected iframe");