/**
 * Background Service Worker
 * Kurulum kayıtları ile araç çubuğu ikonu ve klavye kısayolunu yönetir.
 */
const SUBSCRIPTIONS_URL = 'https://www.reddit.com/subreddits#ruf-open';

// Sekmede panel yoksa (başka site veya eklentinin yüklenmediği Reddit sayfası) sayfayı yeni sekmede açar
async function togglePanel(tab) {
    try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'ruf-toggle' });
        if (response && response.handled) return;
    } catch {
        // Bu sekmede içerik betiği yok
    }
    await chrome.tabs.create({ url: SUBSCRIPTIONS_URL });
}

chrome.action.onClicked.addListener(togglePanel);

chrome.commands.onCommand.addListener((command, tab) => {
    if (command === 'toggle-panel') togglePanel(tab);
});

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('[Reddit Unfollow All] Eklenti kuruldu.');
    } else if (details.reason === 'update') {
        console.log(`[Reddit Unfollow All] Eklenti güncellendi: v${chrome.runtime.getManifest().version}`);
    }
});
