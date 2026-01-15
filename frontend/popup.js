console.log("SignalMail popup.js active");

document.getElementById("checkButton").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.textContent = "Fetching last scan...";
  resultDiv.style.display = "block";
  console.log("Result Div: ", resultDiv);
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_LAST_SCAN",
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
    console.log("Signals: ", signals);
    const badge = (flag, label) => `
  <div style="
    margin: 6px 0;
    padding: 8px;
    border-radius: 6px;
    background: ${flag ? "#ffebee" : "#e8f5e9"};
    color: ${flag ? "#c62828" : "#2e7d32"};
    font-weight: 600;
  ">
    ${flag ? "⚠️" : "✅"} ${label}
  </div>
`;

    resultDiv.innerHTML = `
  <div style="font-weight:bold; margin-bottom:8px;">
    Email Safety Signals
  </div>

  ${badge(signals.urgency, "Urgency / Pressure")}
  ${badge(signals.threat, "Threats")}
  ${badge(signals.sensitive_request, "Sensitive Data Request")}

  <div style="margin-top:10px; font-size:12px; color:#555;">
    ${signals.explanation}
  </div>
`;
  } catch (e) {
    console.error(e);
    resultDiv.textContent = "Could not retrieve scan result.";
  }
});
