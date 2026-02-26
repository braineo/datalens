import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "DataLens",
  description: "Extract EOF embedded JSON from images",
  version: "1.0.0",
  permissions: ["contextMenus", "activeTab", "scripting"],
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.tsx"],
    },
  ],
  host_permissions: ["<all_urls>"],
});
