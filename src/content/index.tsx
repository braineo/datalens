import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { AlertCircle, FileJson, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import "../index.css";

interface Message {
  type: "SHOW_JSON" | "SHOW_ERROR";
  payload: any;
}

const EOFViewer = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleMessage = (
      message: Message,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void,
    ) => {
      console.log("Received message from background:", message);
      if (message.type === "SHOW_JSON") {
        setData(message.payload);
        setError(null);
        setOpen(true);
      } else if (message.type === "SHOW_ERROR") {
        setError(message.payload);
        setData(null);
        setOpen(true);
      }
      sendResponse({ status: "ok" });
      return true;
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleCopy = () => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {error ? (
              <AlertCircle className="text-destructive h-6 w-6" />
            ) : (
              <FileJson className="text-primary h-6 w-6" />
            )}
            {error ? "Extraction Error" : "DataLens JSON Extraction"}
          </DialogTitle>
          <DialogDescription>
            {error
              ? "An error occurred while inspecting the image."
              : "Successfully extracted embedded EOF watermark data."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto rounded-md border mt-2">
          {error ? (
            <div className="p-6 text-sm text-destructive">{error}</div>
          ) : (
            <SyntaxHighlighter
              language="json"
              style={atomOneDark}
              customStyle={{
                margin: 0,
                padding: "1.5rem",
                borderRadius: "inherit",
                fontSize: "14px",
                backgroundColor: "#1e1e2e",
              }}
              wrapLongLines={true}
            >
              {JSON.stringify(data, null, 2)}
            </SyntaxHighlighter>
          )}
        </div>

        <DialogFooter className="mt-4 sm:justify-between items-center w-full">
          <span className="text-xs text-muted-foreground mr-auto hidden sm:block">
            EOF Watermark Extractor by DataLens
          </span>
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            {!error && (
              <Button variant="outline" onClick={handleCopy} className="w-full sm:w-auto">
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <FileJson className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy JSON"}
              </Button>
            )}
            <Button variant="default" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Create a mount point and inject the React app
const init = () => {
  const rootElement = document.createElement("div");
  rootElement.id = "datalens-crx-root";
  // Ensure the injected root sits above everything, pointer-events none on the container but auto on children
  // handled correctly if we just append to body directly since Dialog uses Portal.
  document.body.appendChild(rootElement);

  const root = createRoot(rootElement);
  root.render(<EOFViewer />);
};

// Ensure it runs after DOM content is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
