let lastAnalysis = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SCAN") {
    // If it's a scan request with content
    if (msg.payload && msg.payload.body) {
      const safeText = msg.payload.body.slice(0, 1000);

      fetch("http://127.0.0.1:8000/checkURL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailBody: safeText }),
      })
        .then((r) => r.json())
        .then((res) => {
          lastAnalysis = res.signals;
          console.log("AI Analysis Updated:", lastAnalysis);
          sendResponse({ status: "success", data: lastAnalysis });
        })
        .catch((err) => {
          // console.error("Fetch Error:", err);
          sendResponse({ status: "error", error: err.message });
        });
      return true; // Keep port open for async response
    }

    // If it's a request for the current status (from popup)
    else {
      sendResponse(
        lastAnalysis || "No email detected yet. Open an email in Gmail to scan."
      );
      return false; // Sync response, close port immediately
    }
  }
});
