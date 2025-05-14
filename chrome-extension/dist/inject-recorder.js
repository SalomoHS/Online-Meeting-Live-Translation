
const iframe = document.createElement("iframe");
iframe.id = "microphone";
// iframe.setAttribute(
//     "style",
//     `
//   all: initial;
//   position: fixed;        
//       bottom: 80px;           
//       left: 50%;
//       width: 100%;                
//       transform: translateX(-50%);
//       color: white;          
//       padding: 12px 20px;     
//       font-size: 18px;        
//       border-radius: 8px;     
//       max-width: 80%;         
//       text-align: center;
//       z-index: 9999;
//   `
//   );
iframe.setAttribute("hidden", "hidden");
iframe.setAttribute("id", "permissionsIFrame");
iframe.setAttribute("allow", "microphone; camera; display-capture;");
iframe.src = chrome.runtime.getURL("recorder.html");
document.body.appendChild(iframe);

window.onload = async function ()
{

    // Active Speaker Observer
    let lastActiveSpeaker = ''; // to avoid duplicate messages
    const activeSpeakerObserver = new MutationObserver((mutationsList, observer) =>
    {
        mutationsList.forEach((mutation) =>
        {
            if (mutation.type === "attributes")
            {
                const targetElement = mutation.target;
                if (targetElement.getAttribute('jscontroller') == "ES310d" && mutation.attributeName === 'class')
                {
                    if (targetElement.offsetParent !== null) // Check if the indicator element is visible
                    {
                        const container = targetElement.closest("div[data-participant-id]");
                        const activeSpeaker = container.querySelector('[data-tooltip-id][data-tooltip-anchor-boundary-type] span.notranslate').innerText;

                        if (activeSpeaker !== lastActiveSpeaker)
                        {
                            lastActiveSpeaker = activeSpeaker;
                            console.log(`Active Speaker Changed: ${activeSpeaker}`,container);
                            chrome.runtime.sendMessage({ action: "ActiveSpeakerChange", data: lastActiveSpeaker });
                        }
                    }
                }
            }
        });
    });

    const activeSpeakerInterval = setInterval(() =>
    {
        const speakerPanel = document.querySelector('div[data-participant-id]')?.parentElement?.parentElement;
        if (speakerPanel)
        {
            if (speakerPanel.hasAttribute('LMAAttached')) 
            {
                clearInterval(activeSpeakerInterval);
                return;
            }

            speakerPanel.setAttribute('LMAAttached', 'true');
            console.log(speakerPanel)

            activeSpeakerObserver.observe(speakerPanel, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });

            clearInterval(activeSpeakerInterval);
            console.log('activeSpeaker observer started');
        }
        else
        {
            console.log('speakerPanel not found. Retrying in 2 seconds...');
        }
    }, 2000);
};


console.log("-----LMA-------injected iframe");