function getEmailBody() {
  const main = document.querySelector('div[role="main"]');
  if (!main) {
    return null;
  }

  const candidates = [...main.querySelectorAll("div")].filter(
    (el) => el.innerText && el.innerText.length > 200
  );
  candidates.sort((a, b) => b.innerText.length - a.innerText.length);
  return candidates[0]?.innerText || null;
}

let lastScan = "";

function extractEmail() {
  const body = getEmailBody();
  const sender = document.querySelector("span[email]")?.getAttribute("email");
  if (!body || !sender) {
    return null;
  }

  const id = sender + body.slice(0, 50);
  if (id === lastScan) {
    return null;
  }
  lastScan = id;
  return { sender, body };
}

let observer = null;

function startObserver() {
  if (observer) observer.disconnect();

  observer = new MutationObserver(() => {
    try {
      const data = extractEmail();
      if (data) {
        chrome.runtime.sendMessage({
          type: "SCAN",
          payload: data,
        });
      }
    } catch (e) {
      console.warn("Extension context invalidated, stopping observer");
      observer.disconnect();
    }
  });

  observer.observe(document.body, { subtree: true, childList: true });
}

startObserver();
