console.log("Background.js loaded");

let lastBodyHash = null;

const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
];

function extractOrgTokens(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

function detectIdentityMismatch(sender) {
  if (!sender) return { mismatch: false };

  const { senderDomain, displayName, subject } = sender;
  if (!senderDomain) return { mismatch: false };

  const domain = senderDomain.toLowerCase();

  const tokens = [
    ...extractOrgTokens(displayName),
    ...extractOrgTokens(subject),
  ];

  if (tokens.length === 0) return { mismatch: false };

  const isFreeEmail = FREE_EMAIL_DOMAINS.includes(domain);
  const domainMatchesToken = tokens.some((t) => domain.includes(t));

  if (isFreeEmail) {
    return {
      mismatch: true,
      reason:
        "Email claims an organization identity but uses a free email domain",
    };
  }

  if (!domainMatchesToken) {
    return {
      mismatch: true,
      reason: "Claimed organization does not match sender domain",
    };
  }

  return { mismatch: false };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Message:", msg);

  if (msg.type === "SCAN_EMAIL" && msg.payload?.body) {
    const { body, sender: senderInfo } = msg.payload;

    const hash = body.slice(0, 200);
    if (hash === lastBodyHash) {
      console.log("Duplicate scan skipped");
      return true;
    }
    lastBodyHash = hash;

    chrome.storage.local.set({ lastAnalysis: "SCANNING" });

    fetch("http://127.0.0.1:8000/checkURL", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailBody: body.slice(0, 1500) }),
    })
      .then((r) => r.json())
      .then((res) => {
        const aiSignals =
          typeof res.signals === "string"
            ? JSON.parse(res.signals)
            : res.signals;

        const identityCheck = detectIdentityMismatch(senderInfo);

        const combined = {
          ...aiSignals,
          identity_mismatch: identityCheck.mismatch,
          identity_reason: identityCheck.reason || null,
        };

        chrome.storage.local.set({ lastAnalysis: combined });
        console.log("Combined Analysis:", combined);
      })
      .catch(() => {
        chrome.storage.local.set({ lastAnalysis: "ERROR" });
      });

    return true;
  }

  if (msg.type === "GET_LAST_SCAN") {
    chrome.storage.local.get("lastAnalysis", (data) => {
      sendResponse(
        data.lastAnalysis || "No email scanned yet. Open an email first.",
      );
    });
    return true;
  }
});
