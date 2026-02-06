console.log("SignalMail popup.js active");

const checkButton = document.getElementById("checkButton");
const resultContainer = document.getElementById("resultContainer");
const initialMsg = document.getElementById("initialMsg");
const statusBanner = document.getElementById("statusBanner");
const statusIcon = document.getElementById("statusIcon");
const statusLabel = document.getElementById("statusLabel");
const signalsList = document.getElementById("signalsList");
const explanationContainer = document.getElementById("explanationContainer");
const explanationText = document.getElementById("explanationText");

checkButton.addEventListener("click", () => {
  checkButton.innerHTML = '<span class="loading-spinner"></span>Analyzing...';
  checkButton.disabled = true;

  chrome.runtime.sendMessage({ type: "GET_LAST_SCAN" }, (res) => {
    checkButton.innerHTML = "Analyze Current Email";
    checkButton.disabled = false;

    if (res === "SCANNING") {
      initialMsg.textContent = "AI is still analyzing... Please wait a moment.";
      initialMsg.style.color = "#6366f1";
      return;
    }

    if (res === "ERROR") {
      initialMsg.textContent = "Connection error. Is the backend running?";
      initialMsg.style.color = "#ef4444";
      return;
    }

    if (typeof res === "string") {
      initialMsg.textContent = res;
      return;
    }

    // Success - Show Results
    initialMsg.classList.add("hidden");
    resultContainer.classList.remove("hidden");

    const isRisky =
      res.urgency ||
      res.threat ||
      res.sensitive_request ||
      res.identity_mismatch;

    // Update Banner
    if (isRisky) {
      statusBanner.className = "status-banner risk";
      statusIcon.textContent = "⚠️";
      statusLabel.textContent = "Flags Detected";
    } else {
      statusBanner.className = "status-banner safe";
      statusIcon.textContent = "✅";
      statusLabel.textContent = "No Flags";
    }

    // Update Signals
    const signals = [
      { id: "urg", label: "Urgency / Pressure", flag: res.urgency },
      { id: "thr", label: "Direct Threats", flag: res.threat },
      { id: "sen", label: "Sensitive Request", flag: res.sensitive_request },
      {
        id: "idm",
        label: "Identity Verification",
        flag: res.identity_mismatch,
        reason: res.identity_reason,
      },
    ];

    signalsList.innerHTML = signals
      .map(
        (s) => `
      <div class="signal-item">
        <div class="signal-info">
          <span class="signal-name">${s.label}</span>
          ${
            s.reason
              ? `<span style="font-size:11px; color:#64748b; margin-top:2px;">${s.reason}</span>`
              : ""
          }
        </div>
        <span class="status-badge ${s.flag ? "flagged" : "safe"}">
          ${s.flag ? "Flagged" : "Clear"}
        </span>
      </div>
    `
      )
      .join("");

    // Update Explanation
    if (res.explanation) {
      explanationContainer.classList.remove("hidden");
      explanationText.textContent = res.explanation;
    } else {
      explanationContainer.classList.add("hidden");
    }
  });
});
