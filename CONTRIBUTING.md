# Contributing

Thanks for wanting to help. Here is how to get a change in.

## Before you start

- Look through the [open issues](../../issues) in case it is already known.
- For a big change, open an issue first so we can agree on the approach.

## Making a change

1. Fork the repository and create a branch from `main`.
2. Make your change. Keep it focused: one fix or feature per pull request.
3. Load the folder in Chrome with **Load unpacked** (`chrome://extensions/`) and try it on both the current Reddit and `old.reddit.com`. There is no automated test suite.
4. Add a line to [CHANGELOG.md](CHANGELOG.md) under **Unreleased**.
5. Open a pull request and fill in the template.

## Hot reload

So you don't have to reload the extension by hand after every change:

1. Press **Load unpacked** once more and choose the `dev/hot-reload` folder. This small helper needs loading only once. It is separate from the extension and is not part of the release zip.
2. Run `node dev/watch.js` from the project root (Node.js 20 or newer) and leave it running.

When you save a file in `src/`, `icons/` or `manifest.json`, the extension and its open Reddit pages reload. Press Ctrl+C to stop. A reload also interrupts any run in progress, so stop the watcher before you test a real run.

## Reporting bugs

Use the bug report form under [Issues](../../issues/new/choose). Say which
version you use, what you did, what you expected and what happened.
