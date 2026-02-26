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
      <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[85vh] flex flex-col bg-zinc-950/80 backdrop-blur-2xl border border-white/10 text-zinc-50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] !rounded-2xl overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 pb-5 border-b border-white/10 bg-white/5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight z-10 relative">
            {error ? (
              <div className="p-2 bg-red-500/20 rounded-xl border border-red-500/20 shadow-inner">
                <AlertCircle className="text-red-400 h-6 w-6" />
              </div>
            ) : (
              <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/20 shadow-inner">
                <FileJson className="text-blue-400 h-6 w-6" />
              </div>
            )}
            <span className="bg-gradient-to-br from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              {error ? "Extraction Error" : "DataLens Extraction"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-[15px] mt-3 z-10 relative">
            {error
              ? "We couldn't locate any hidden JSON data in this image."
              : "Successfully extracted the embedded EOF watermark payload."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-zinc-950/50 p-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 mb-6 rounded-full bg-red-500/5 flex items-center justify-center border border-red-500/10 shadow-[0_0_30px_-5px_rgba(239,68,68,0.2)]">
                <AlertCircle className="w-10 h-10 text-red-500/70" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-200 mb-2">No watermark detected</h3>
              <p className="text-zinc-500 max-w-sm leading-relaxed">{error}</p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-white/5 bg-[#1e1e2e]/90 shadow-inner group">
              <SyntaxHighlighter
                language="json"
                style={atomOneDark}
                customStyle={{
                  margin: 0,
                  padding: "1.5rem",
                  background: "transparent",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                }}
                wrapLongLines={true}
              >
                {JSON.stringify(data, null, 2)}
              </SyntaxHighlighter>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 sm:p-5 border-t border-white/10 bg-zinc-950 flex flex-col sm:flex-row items-center sm:justify-between w-full gap-4">
          <div className="flex items-center gap-3 mr-auto hidden sm:flex">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
            </div>
            <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">
              EOF Extractor by DataLens
            </span>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {!error && (
              <Button
                variant="outline"
                onClick={handleCopy}
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10 transition-all duration-300 rounded-xl hover:shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)]"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-emerald-400" />
                ) : (
                  <FileJson className="mr-2 h-4 w-4 text-blue-400" />
                )}
                {copied ? "Copied to Clipboard" : "Copy JSON"}
              </Button>
            )}
            <Button
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] transition-all duration-300 rounded-xl border-0 border-t border-blue-400/30"
            >
              Close Lens
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
