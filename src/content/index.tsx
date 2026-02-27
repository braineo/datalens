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
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[85vh] fixed sm:right-6 sm:bottom-6 sm:left-auto sm:top-auto sm:translate-x-0 sm:translate-y-0 right-4 bottom-4 left-4 top-auto translate-x-0 translate-y-0 flex flex-col bg-zinc-950/90 backdrop-blur-2xl border border-white/10 text-zinc-50 shadow-2xl !rounded-2xl overflow-hidden p-0 gap-0">
        <DialogHeader className="shrink-0 flex flex-col gap-1 p-4 border-b border-white/10 bg-white/5">
          <DialogTitle className="flex items-center gap-2.5 text-md font-bold tracking-tight">
            {error ? (
              <div className="flex items-center justify-center p-1.5 bg-red-500/20 rounded-lg border border-red-500/20 shadow-inner">
                <AlertCircle className="text-red-400 h-5 w-5" />
              </div>
            ) : (
              <div className="flex items-center justify-center p-1.5 bg-blue-500/20 rounded-lg border border-blue-500/20 shadow-inner">
                <FileJson className="text-blue-400 h-5 w-5" />
              </div>
            )}
            <span className="bg-gradient-to-br from-zinc-100 to-zinc-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden text-ellipsis">
              {error ? "Extraction Error" : "DataLens Extraction"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-[13px] text-left leading-relaxed">
            {error
              ? "We couldn't locate any hidden JSON data in this image."
              : "Successfully extracted the embedded EOF watermark payload."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-auto bg-zinc-950/50 p-4 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          {error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mb-4 rounded-full bg-red-500/5 flex items-center justify-center border border-red-500/10 shadow-[0_0_30px_-5px_rgba(239,68,68,0.2)]">
                <AlertCircle className="w-8 h-8 text-red-500/70" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200 mb-1">No watermark detected</h3>
              <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">{error}</p>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden border border-white/5 bg-[#1e1e2e]/90 shadow-inner group">
              <SyntaxHighlighter
                language="json"
                style={atomOneDark}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  background: "transparent",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}
                wrapLongLines={true}
              >
                {JSON.stringify(data, null, 2)}
              </SyntaxHighlighter>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 p-3 sm:px-4 sm:py-3 border-t border-white/10 bg-zinc-950 flex flex-col sm:flex-row items-center sm:justify-between w-full gap-3">
          <div className="flex items-center gap-2 mr-auto hidden sm:flex shrink-0">
            <div className="flex items-center justify-center relative h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </div>
            <span className="text-[10px] font-semibold text-zinc-500 tracking-wider uppercase">
              EOF Extractor by DataLens
            </span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            {!error && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10 transition-all duration-300 rounded-lg hover:shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)] h-9 px-3"
              >
                {copied ? (
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <FileJson className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
                )}
                {copied ? "Copied" : "Copy JSON"}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setOpen(false)}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] transition-all duration-300 rounded-lg border-0 border-t border-blue-400/30 h-9 px-4"
            >
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
  rootElement.className = "dark datalens-crx antialiased";
  rootElement.style.position = "fixed";
  rootElement.style.zIndex = "2147483647";
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
