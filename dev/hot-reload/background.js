/**
 * Hot reload helper (development only).
 * Polls dev/watch.js. When files change, it reloads the unpacked extension and
 * the Reddit tabs the extension runs on.
 */
const WATCH_URL = 'http://127.0.0.1:35729/';
const TARGET_NAME = 'Reddit Unfollow All';
const TAB_PATTERNS = [
    '*://*.reddit.com/subreddits',
    '*://*.reddit.com/subreddits/*',
    '*://*.reddit.com/user/*/communities',
    '*://*.reddit.com/user/*/communities/*'
];
const POLL_MS = 1000;

let lastVersion = null;
let isPolling = false;

async function reloadTarget() {
    const extensions = await chrome.management.getAll();
    const target = extensions.find(e =>
        e.name === TARGET_NAME && e.installType === 'development' && e.enabled);
    if (!target) {
        console.warn(`Unpacked, enabled "${TARGET_NAME}" not found.`);
        return;
    }

    // Turning an unpacked extension off and on reads its files from disk again
    await chrome.management.setEnabled(target.id, false);
    await chrome.management.setEnabled(target.id, true);

    const tabs = await chrome.tabs.query({ url: TAB_PATTERNS });
    await Promise.all(tabs.map(tab => chrome.tabs.reload(tab.id)));
    console.log(`Reloaded the extension and ${tabs.length} tab(s).`);
}

async function poll() {
    if (isPolling) return;
    isPolling = true;
    try {
        // Calling an extension API keeps this service worker from going idle
        await chrome.runtime.getPlatformInfo();
        const response = await fetch(WATCH_URL, { cache: 'no-store' });
        const { version } = await response.json();
        if (lastVersion !== null && version !== lastVersion) await reloadTarget();
        lastVersion = version;
    } catch (e) {
        // dev/watch.js is not running. Keep trying.
    } finally {
        isPolling = false;
    }
}

// The alarm restarts polling if Chrome has stopped the service worker anyway
chrome.alarms.create('hot-reload-keepalive', { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(poll);
setInterval(poll, POLL_MS);
poll();
