document.getElementById("checkButton").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.textContent = "Fetching last scan...";
  resultDiv.style.display = "block";
  console.log("Result Div: ", resultDiv);
  try {
    const response = await chrome.runtime.sendMessage({
      type: "SCAN",
    });
    console.log("Response: ", response);
    if (!response) {
      resultDiv.textContent = "No email scanned yet. Open an email first.";
      return;
    }

    let signals;

    try {
      signals = typeof response === "string" ? JSON.parse(response) : response;
    } catch (e) {
      resultDiv.textContent = response;
      return;
    }

    resultDiv.innerHTML = `
      <div style="color:${
        signals.threat || signals.sensitive_request ? "#ff4d4d" : "#2ecc71"
      }; font-weight:bold;">
        Risk Level: ${
          signals.threat || signals.sensitive_request ? "High" : "Low"
        }
      </div>
      <div style="margin-top:6px; font-size:12px;">
        <strong>Urgency:</strong> ${signals.urgency ? "Yes" : "No"}<br>
        <strong>Threat:</strong> ${signals.threat ? "Yes" : "No"}<br>
        <strong>Sensitive Request:</strong> ${
          signals.sensitive_request ? "Yes" : "No"
        }<br>
        <strong>Why:</strong> ${signals.explanation}
      </div>
    `;
  } catch (e) {
    console.error(e);
    resultDiv.textContent = "Could not retrieve scan result.";
  }
});
