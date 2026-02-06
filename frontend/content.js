console.log("SignalMail content.js active");

let debounceTimer = null;
let lastBody = "";

function getSubject() {
  return (
    document.querySelector("h2[data-thread-perm-id]")?.innerText?.trim() ||
    document
      .querySelector('div[role="heading"][aria-level="2"]')
      ?.innerText?.trim() ||
    ""
  );
}

function extractSenderInfo() {
  const senderEl = document.querySelector("span[email]");
  const nameEl = document.querySelector("span.gD");

  if (!senderEl) return null;

  const senderEmail = senderEl.getAttribute("email");
  const senderDomain = senderEmail?.split("@")[1] || "";

  return {
    senderEmail,
    senderDomain,
    displayName: nameEl?.innerText || "",
    subject: getSubject(),
  };
}

function extractEmailBody() {
  const main = document.querySelector("div[role='main']");
  if (!main) return null;

  const text = main.innerText?.trim();
  if (!text || text.length < 200) return null;

  return text;
}

function safeSend(payload) {
  try {
    if (!chrome.runtime?.id) return;
    chrome.runtime.sendMessage({
      type: "SCAN_EMAIL",
      payload,
    });
  } catch {}
}

function triggerScan() {
  const body = extractEmailBody();
  if (!body || body === lastBody) return;

  lastBody = body;

  const sender = extractSenderInfo();

  console.log("Sending email for scan");
  safeSend({ body, sender });
}

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (!chrome.runtime?.id) return;
    triggerScan();
  }, 800);
});

observer.observe(document.body, { subtree: true, childList: true });
