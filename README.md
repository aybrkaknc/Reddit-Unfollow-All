<div align="center">

<img src="icons/icon128.png" alt="" width="104">

# Reddit Unfollow All

**Bulk unfollow subreddits, and keep the ones you love.**

A Chrome and Firefox extension for the spring cleaning you do on Reddit every now and then.
Pick the subreddits to keep, press start, and it leaves all the others for you.

[![Download](https://img.shields.io/badge/Download-Extension_zip-2ea043?style=for-the-badge)](../../releases)

[![Platform](https://img.shields.io/badge/Browser-Chrome-0078D4)](https://chromewebstore.google.com/detail/reddit-unfollow-all/lecbgbpldemagjcdjdbifciecnhhgfhl)
![Platform](https://img.shields.io/badge/Browser-Firefox-FF7139)
![Version](https://img.shields.io/badge/version-1.2.1-7b3fb3)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

<br>

## Screenshots

<img src="screenshots/1280x800.png" alt="The Reddit Unfollow All panel on the Manage communities page" width="100%">

<img src="screenshots/redditunfollowall.gif" alt="Reddit Unfollow All leaving subreddits" width="100%">

## What you can do

| Area | What you can do |
|---|---|
| **Whitelist** | Tick the subreddits you want to stay subscribed to, for example r/Turkey or r/programming. Everything else is unfollowed. |
| **Search and filter** | Find a subreddit in the list before you start. Keep all or keep none with one click. |
| **Settings** | Press the gear button in the panel to choose the language, the speed from 1x to 4x, and the panel size up to 200%. Go slower if Reddit pushes back. The panel starts larger on big screens and remembers your size. |
| **Cancel** | Stop in the middle. Subreddits already left stay left. |
| **Undo** | Changed your mind? Press the ↶ button to rejoin the subreddits you left. It works until you reload or leave the page. |
| **Both Reddit designs** | Works on the current Reddit and on `old.reddit.com`. |
| **Two languages** | English and Turkish. |

## Getting started

The extension is not on the Chrome Web Store yet, so you load it by hand:

1. **Download** `reddit-unfollow-all-<version>.zip` from the [Releases page](../../releases) and extract it anywhere. (Or clone this repository.)
2. **Open** `chrome://extensions/` in Chrome and switch on **Developer mode** in the top right.
3. **Load it.** Press **Load unpacked** and choose the extracted folder.

   In Firefox, open `about:debugging#/runtime/this-firefox`, press **Load Temporary Add-on** and choose `manifest.json` in the extracted folder. Firefox removes a temporary add-on when it restarts.
4. **Use it.** Go to your subscriptions page (`reddit.com/subreddits` or your communities page). The panel opens by itself. Press **Unfollow All** next to the **Manage communities** heading to start: the extension first shows how many subreddits it will leave and how many it will keep, and only starts after you confirm.

You can also open or close the panel with the extension's toolbar icon or `Alt+Shift+U`. From any other page, these open your subscriptions page in a new tab with the panel ready.

Then:

1. **Review the list.** Press the **Kept** counter to see all your subscriptions.
2. **Pick what to keep.** Tick the subreddits that should stay. Your choices are saved on your device for next time.
3. **Start.** Press **Start**. It skips the ones you ticked.

> [!IMPORTANT]
> Unfollowing is done through Reddit's own buttons. You can only undo it from the panel until you reload or leave the page, so check your whitelist before you press Start.

## Requirements

- Google Chrome, or another Chromium-based browser that can load unpacked extensions.
- Or Firefox 142 or newer.
- A Reddit account that is signed in.

## Questions

**Does it send my data anywhere?**
No. Everything runs in your browser. See [PRIVACY.md](PRIVACY.md).

**The panel doesn't appear.**
Press **Unfollow All** on the page, the toolbar icon or `Alt+Shift+U`. If the button can't find the heading, it appears in the bottom right corner instead.

**`Alt+Shift+U` doesn't work.**
Chrome only assigns the shortcut on a fresh install, and not if another extension already uses it. Set it at `chrome://extensions/shortcuts`. In Firefox, open `about:addons`, press the gear button and choose **Manage Extension Shortcuts**.

**The panel warns that Reddit's page may have changed.**
The extension may not work until it is updated. Press **Report** to open a pre-filled issue on GitHub. You can read it before you send it, and it doesn't include your username or subreddits.

**It stops or skips some subreddits.**
Pick a slower speed and start again. Reddit can limit how fast you click.

## Reporting problems

If something goes wrong, open the panel's settings with the gear button and press **Report** to open a pre-filled form, or open an [issue](../../issues/new/choose) yourself and say which Reddit design you use (new or old) and what the panel's log says.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). To report a security problem, see [SECURITY.md](SECURITY.md).

## Building from source

There is nothing to build. The extension is plain JavaScript and CSS: load the repository folder with **Load unpacked** as described above.

## License

MIT. See [LICENSE](LICENSE) for details.
