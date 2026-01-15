console.log("Background.js loaded");
let lastAnalysis = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Message: ", msg);
  if (msg.type === "SCAN_EMAIL" && msg.payload.body) {
    console.log("Message: ", msg.payload.body);
    fetch("http://127.0.0.1:8000/checkURL", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailBody: msg.payload.body,
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        lastAnalysis = res.signals || res.result;
        console.log("AI Analysis Updated:", lastAnalysis);
      });
    return true;
  }

  if (msg.type === "GET_LAST_SCAN") {
    console.log("Current lastAnalysis state:", lastAnalysis);
    sendResponse(lastAnalysis || "No email scanned yet. Open an email first.");
    return true;
  }
});
