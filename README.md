# DataLens Chrome Extension

DataLens is a Chrome extension to extract embedded JSON payloads (EOF
watermarks) appended to PNG images directly from browser context menu.

## Prerequisites

- [Bun](https://bun.sh/)

## Development

1. Clone the repository.
2. Install the dependencies using Bun:
   ```bash
   bun install
   ```
3. Start the hot-reloading development server:
   ```bash
   bun run dev
   ```

## Production Build

To bundle the extension for production (e.g., uploading to the Chrome Web Store):

```bash
bun run build
```

This will produce a `dist/` directory containing all your bundled extension assets (`manifest.json`, `index.js`, styles, etc.).

## Installing the Extension (Unpacked)

To test the extension natively in your own Chrome browser:

1. Build the project using `bun run build` (or start `bun run dev` for HMR).
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** via the toggle switch in the top right corner.
4. Click the **"Load unpacked"** button in the top left.
5. Select the `dist/` folder that was generated in your project directory.
6. The DataLens extension will now appear in your list of active extensions.

## Usage

1. Open any web page containing an image with an appended EOF watermark.
2. **Right-click** on the image.
3. Select **"Decode Embedded JSON"** from the context menu.
4. If the JSON is valid and present, a stylish shadcn dialog will appear overlaying the page containing the syntax-highlighted data block.

## Linting and Formatting

The project relies on [oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/) to keep the code performant and well-structured.

```bash
# Lint the codebase
bunx oxlint --fix .

# Format the codebase
bunx oxfmt --write .
```
