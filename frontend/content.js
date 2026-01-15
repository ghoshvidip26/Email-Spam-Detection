let debounceTimer = null;
let lastText = "";

function extractEmailBody() {
  const container = document.querySelector("div[role='main']");
  if (!container) return null;

  const text = container.innerText.trim();
  if (!text || text.length < 200) return null;

  return text;
}

function triggerScan() {
  const body = extractEmailBody();
  if (!body) return;

  if (body === lastText) return;
  lastText = body;

  console.log("Sending email for scan, length:", body.length);

  chrome.runtime.sendMessage({
    type: "SCAN_EMAIL",
    payload: { body },
  });
}

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(triggerScan, 800);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
