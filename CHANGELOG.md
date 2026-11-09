# Changelog

All notable changes to this project are listed here, newest first.
The format follows [Keep a Changelog](https://keepachangelog.com/).

## [1.2.2] - 2026-11-09

### Removed

- `src/content.js`, an old single-file copy of the content script that the extension no longer loaded. It made the package larger and triggered extra warnings in Firefox's add-on checks.

## [1.2.1] - 2026-11-09

### Changed

- Firefox 142 or newer is now required. Older versions do not support the data collection setting that Mozilla asks for.

## [1.2.0] - 2026-11-09

### Added

- Firefox support (Firefox 128 or newer). The same zip loads in Chrome and Firefox.
- A settings page inside the panel, opened with the new gear button. The panel title changes to Settings with a back arrow, and the gear and refresh buttons hide. Press the back arrow or Esc to return.
- Panel size in the settings: makes the panel, its windows and the Unfollow All button larger, from 100% to 200%. The size starts from your screen size, so a 2560x1440 screen opens at 125%, and your choice is remembered on your device.

### Changed

- The panel uses Reddit's own typefaces, Reddit Sans for all text and Reddit Mono for the log, instead of Inter, Space Grotesk and JetBrains Mono. They are bundled with the extension under the SIL Open Font License.
- The panel opens by itself on the Manage communities page, so you no longer have to press Unfollow All to see it.
- The Unfollow All button next to the Manage communities heading now starts the run. It asks for confirmation first, the same as the Start button in the panel.
- The language switch, the speed and the Report button moved to the settings page. All the choices are shown side by side instead of changing with each press.
- The settings can't be opened during a run, so the speed can no longer change in the middle of one. To go slower, cancel and start again.

### Fixed

- The extension now works right after you reach the Manage communities page through Reddit's menus. Before, you had to reload the page once.
- The panel no longer grows past the top of the screen when you drag it up and open the log, the whitelist or the settings. It slides back into view, and it also stays on screen when you make the browser window smaller.
- When the panel gets smaller (minimize, closing the log or the whitelist), the title now always slides down toward the bottom edge. After you dragged the panel, closing the whitelist pulled the bottom edge up toward the title instead.
- On a short window, a large panel is no longer taller than the screen. Its content scrolls instead.

## [1.1.0] - 2026-11-06

### Added

- An **Unfollow All** button next to Reddit's Manage communities heading opens the panel. If the heading can't be found, the button floats in the bottom right corner.
- The toolbar icon and `Alt+Shift+U` open or close the panel. From other pages, they open your subscriptions page in a new tab with the panel open.
- A close (×) button on the panel, back after being removed in 1.0.1. It is hidden during a run, and the panel can always be reopened.

### Changed

- The panel no longer opens by itself when the page loads.
- Small text uses Inter and the log uses JetBrains Mono, both bundled with the extension under the SIL Open Font License. Titles and numbers keep Space Grotesk.
- The extension icon fills its whole canvas, so it looks larger in the toolbar.
- The panel and its windows show the extension's own logo instead of the Reddit logo. The language switch is a globe button to the left of the refresh button again.
- Reporting a problem moved from the panel title to a GitHub button next to the language button.

### Fixed

- The toolbar showed a puzzle piece because the icon files were JPEGs. They are now real PNGs in 16, 32, 48 and 128 px.

## [1.0.1] - 2026-11-06

### Added

- Your whitelist and language choice are remembered between visits (new `storage` permission, data stays on your device).
- The interface follows your Reddit display language until you choose one; the default is English.
- Subreddits loaded after the page opens are picked up automatically.
- Start asks for confirmation and shows how many subreddits will be left and kept.
- The run stops after 5 unconfirmed subreddits in a row, in case Reddit is limiting requests.
- Each run ends with a summary of subreddits left, kept and not confirmed.
- Undo: the ↶ button rejoins the subreddits you left, until you reload or leave the page.
- After Start, minimizing the panel shrinks it to a single line with the latest log message and an expand button.
- New messages for when everything is whitelisted, a subreddit is no longer on the page, or settings can't be saved.
- The browser warns you before you leave the page during a run.
- A warning appears if Reddit's page seems to have changed, with a Report button that opens a pre-filled GitHub issue. Nothing is sent unless you submit it.
- Hover over the panel title and click Report to file any other bug the same way.
- Messages and questions open in the extension's own window instead of the browser's default pop-ups.
- The log has a taller terminal-style view with a copy icon in its corner. It starts collapsed, opens when you press Start, and its whole title bar collapses or expands it.
- Project files: LICENSE, SECURITY, CONTRIBUTING, issue and pull request forms, release workflow.

### Changed

- A subreddit counts as left only after Reddit shows the change. Otherwise the log reports it as not confirmed.
- Pause and resume are replaced by Cancel, which stops the run and takes the place of Start while running.
- A more compact panel: speed is now a small badge next to Start that moves from 1x to 4x and back to 1x with each press, and the Kept counter opens the whitelist.
- The Reddit logo in the panel header now switches the language. It turns into a globe icon when you hover over it.
- Smooth transitions throughout the panel: minimizing, the whitelist, warnings, dialogs, counters and the log. The progress bar appears when you press Start. Animations are off if your system is set to reduce motion.
- The interface uses the Space Grotesk font, bundled with the extension under the SIL Open Font License.

### Removed

- The close (X) button, because the panel could not be reopened without reloading the page. Use minimize instead.
- The move icon. Drag the panel by its header instead.

### Fixed

- The panel hides when you move to another Reddit page and comes back when you return. Leaving the page during a run cancels it.
- The panel now opens on `reddit.com/subreddits` without a trailing slash, including `old.reddit.com`.
- On old Reddit, subreddits you have not joined are no longer listed as subscriptions, and a subscription shown in more than one place is counted once.
- Only a confirmation dialog opened by the extension's own click is confirmed.
- Subreddit names containing the word "subreddit" are no longer replaced with a placeholder.

## [1.0.0] - 2026-02-04

### Added

- Whitelist: choose the subreddits to keep, with search, Keep All and Keep None.
- Works on the current Reddit and on `old.reddit.com`.
- Four speeds, pause and resume.
- English and Turkish interface.
- Privacy policy.

### Changed

- Removed unused permissions for Chrome Web Store compliance.
