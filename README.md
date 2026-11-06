<div align="center">

<img src="icons/icon128.png" alt="" width="104">

# Reddit Unfollow All

**Bulk unfollow subreddits, and keep the ones you love.**

A Chrome extension for the spring cleaning you do on Reddit every now and then.
Pick the subreddits to keep, press start, and it leaves all the others for you.

[![Download](https://img.shields.io/badge/Download-Extension_zip-2ea043?style=for-the-badge)](../../releases)

![Platform](https://img.shields.io/badge/Browser-Chrome-0078D4)
![Version](https://img.shields.io/badge/version-1.0.0-7b3fb3)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

<br>

## What you can do

| Area | What you can do |
|---|---|
| **Whitelist** | Tick the subreddits you want to stay subscribed to, for example r/Turkey or r/programming. Everything else is unfollowed. |
| **Search and filter** | Find a subreddit in the list before you start. Keep all or keep none with one click. |
| **Speed** | Four speeds from Slow to Turbo, so you can go gently if Reddit pushes back. |
| **Pause and resume** | Stop in the middle and carry on later. |
| **Both Reddit designs** | Works on the current Reddit and on `old.reddit.com`. |
| **Two languages** | A one-click English and Turkish switch. |

## Getting started

The extension is not on the Chrome Web Store yet, so you load it by hand:

1. **Download** `reddit-unfollow-all-<version>.zip` from the [Releases page](../../releases) and extract it anywhere. (Or clone this repository.)
2. **Open** `chrome://extensions/` in Chrome and switch on **Developer mode** in the top right.
3. **Load it.** Press **Load unpacked** and choose the extracted folder.
4. **Use it.** Go to your subscriptions page (`reddit.com/subreddits` or your communities page). The panel appears on the page.

Then:

1. **Review the list.** Press **Whitelist** to see all your subscriptions.
2. **Pick what to keep.** Tick the subreddits that should stay.
3. **Start.** Press **Start**. It skips the ones you ticked.

> [!IMPORTANT]
> Unfollowing is done through Reddit's own buttons and cannot be undone in one click. Check your whitelist before you press Start.

## Requirements

- Google Chrome, or another Chromium-based browser that can load unpacked extensions.
- A Reddit account that is signed in.

## Questions

**Does it send my data anywhere?**
No. Everything runs in your browser. See [PRIVACY.md](PRIVACY.md).

**It stops or skips some subreddits.**
Pick a slower speed and start again. Reddit can limit how fast you click.

## Reporting problems

If something goes wrong, open an [issue](../../issues/new/choose) and say which Reddit design you use (new or old) and what the panel's log says.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). To report a security problem, see [SECURITY.md](SECURITY.md).

## Building from source

There is nothing to build. The extension is plain JavaScript and CSS: load the repository folder with **Load unpacked** as described above.

## License

MIT. See [LICENSE](LICENSE) for details.
