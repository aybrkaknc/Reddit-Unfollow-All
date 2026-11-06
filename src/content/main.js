// Reddit Unfollow All - Başlangıç. Yüklenecek son parçadır: diğer parçaların tanımlarını kullanır.
'use strict';

async function init() {
    let saved = {};
    try {
        saved = await chrome.storage.local.get(['lang', 'whitelist', 'expectedSubscriptions', 'scale']);
    } catch (e) {
        console.error(e);
    }

    currentLang = I18N[saved.lang] ? saved.lang : detectLang();
    t = I18N[currentLang];
    if (Array.isArray(saved.whitelist)) {
        State.whitelist = new Set(saved.whitelist);
    }
    if (Number.isInteger(saved.expectedSubscriptions)) {
        State.expectedSubscriptions = saved.expectedSubscriptions;
    }
    State.scale = SCALES.includes(saved.scale) ? saved.scale : defaultScale();

    // Panel kapalı başlar; yalnızca araç çubuğu ikonundan gelindiyse açık gelir
    if (window.location.hash === OPEN_HASH) {
        State.isPanelOpen = true;
        history.replaceState(history.state, '', window.location.pathname + window.location.search);
    }

    injectUI();
    scanButtons();
    startObserver();
    syncLauncher();
    setTimeout(() => {
        State.launcherFallbackAllowed = true;
        syncLauncher();
    }, LAUNCHER_FALLBACK_MS);

    // Araç çubuğu ikonu ve klavye kısayolu
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (!message || message.type !== 'ruf-toggle') return;
        syncPanelWithPage();
        if (State.isOnTargetPage) togglePanel();
        sendResponse({ handled: State.isOnTargetPage });
    });

    // Sayfa yüklenmesi için süre tanıdıktan sonra hâlâ abonelik yoksa bildir
    setTimeout(() => {
        if (State.totalActions === 0 && !State.isRunning) warn(t.notFound);
    }, 4000);

    // Yavaş yüklenen sayfalarda yanlış alarm vermemek için yapı kontrolü gecikmeli başlar
    setTimeout(() => {
        State.healthChecksEnabled = true;
        checkPageHealth();
    }, 5000);

    // Pencere küçülürse panel ekranın içinde kalsın
    window.addEventListener('resize', keepPanelOnScreen);

    // İşlem sürerken sayfadan ayrılmadan önce tarayıcının uyarısını göster
    window.addEventListener('beforeunload', e => {
        if (!State.isRunning) return;
        e.preventDefault();
        e.returnValue = '';
    });
}

if (!window.__REDDIT_UNFOLLOW_ALL_LOADED__) {
    window.__REDDIT_UNFOLLOW_ALL_LOADED__ = true;
    init();
}
