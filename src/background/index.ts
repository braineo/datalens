// src/background/index.ts

const MENU_ITEM_ID = "decode-eof-json";
const SEPARATOR = "|||QA_DATA|||";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ITEM_ID,
    title: "Decode Embedded JSON",
    contexts: ["image"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === MENU_ITEM_ID && info.srcUrl && tab?.id) {
    try {
      // Fetch the image as an ArrayBuffer
      const response = await fetch(info.srcUrl);
      const arrayBuffer = await response.arrayBuffer();

      // Decode the ArrayBuffer to a string
      const decoder = new TextDecoder("utf-8");
      const text = decoder.decode(arrayBuffer);

      // Look for the EOF watermark separator
      const separatorIndex = text.lastIndexOf(SEPARATOR);

      if (separatorIndex !== -1) {
        // Extract the payload after the separator
        const payloadString = text.substring(separatorIndex + SEPARATOR.length);

        try {
          // Verify it's valid JSON (or just send the raw string)
          const parsedJson = JSON.parse(payloadString);

          // Send message to content script
          chrome.tabs.sendMessage(tab.id, {
            type: "SHOW_JSON",
            payload: parsedJson,
          });
        } catch (e) {
          console.error("Payload found but it is not valid JSON:", e);
          // Send message to content script with error
          chrome.tabs.sendMessage(tab.id, {
            type: "SHOW_ERROR",
            payload: "Embedded data found, but it is not valid JSON.",
          });
        }
      } else {
        // Send message to content script indicating no data found
        chrome.tabs.sendMessage(tab.id, {
          type: "SHOW_ERROR",
          payload: "No embedded JSON data (EOF watermark) found in this image.",
        });
      }
    } catch (error) {
      console.error("Error fetching or decoding image:", error);
      chrome.tabs.sendMessage(tab.id, {
        type: "SHOW_ERROR",
        payload: "Failed to fetch or decode the image.",
      });
    }
  }
});
