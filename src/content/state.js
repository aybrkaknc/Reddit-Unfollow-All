// Reddit Unfollow All - Sabitler, uygulama durumu ve kalıcılık.
'use strict';

// Hız kademeleri: delay, iki abonelik arasındaki bekleme (ms)
const SPEEDS = [
    { level: 1, delay: 1500, label: 'slow' },
    { level: 2, delay: 800, label: 'normal' },
    { level: 3, delay: 400, label: 'fast' },
    { level: 4, delay: 200, label: 'turbo' }
];

const REPORT_URL = 'https://github.com/aybrkaknc/Reddit-Unfollow-All/issues/new';

// Reddit'in dili panelin dilinden farklı olabilir: iki başlık da her zaman aranır
const MANAGE_HEADINGS = ['manage communities', 'toplulukları yönet'];

// Araç çubuğu ikonu yeni sekmede sayfayı bu işaretle açar: panel açık gelir
const OPEN_HASH = '#ruf-open';

// Başlık bu süre içinde çıkmazsa yüzen düğme gösterilir
const LAUNCHER_FALLBACK_MS = 3000;

// Art arda bu kadar çıkış doğrulanamazsa işlem durdurulur
const MAX_UNCONFIRMED_STREAK = 5;

// Dil adları kendi dillerinde yazılır: yanlış dilde kalan kullanıcı da kendi dilini bulur
const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'tr', label: 'Türkçe' }
];

// Panel boyutu kademeleri. Seçim yapılmadıysa ekran boyutuna göre başlar.
const SCALES = [1, 1.25, 1.5, 1.75, 2];

// =============================================
// UYGULAMA DURUMU
// =============================================
const State = {
    isRunning: false,
    healthChecksEnabled: false,
    healthIssue: null,
    stickyHealthIssue: null,
    hiddenHealthIssues: new Set(),
    loggedHealthIssues: new Set(),
    expectedSubscriptions: null,
    scale: SCALES[0],
    isOnTargetPage: true,
    isPanelOpen: false,
    launcherFallbackAllowed: false,
    isRebuilding: false,
    showProgress: false,
    isFinished: false,
    isProcessing: false,
    timer: null,
    logs: [],
    lastLogMessage: '',
    isLogCollapsed: true,
    attemptedElements: new WeakSet(),
    attemptedKeys: new Set(),
    mode: 'leave',
    // Bu sayfa yüklemesinde çıkılanlar; yalnızca bellekte tutulur
    leftItems: [],
    rejoinTotal: 0,
    rejoinedCount: 0,
    rejoinFailedCount: 0,
    isMinimized: false,
    isSettingsOpen: false,
    isListOpen: false,
    currentIndex: 0,
    unsubscribedCount: 0,
    unconfirmedCount: 0,
    unconfirmedStreak: 0,
    keptCount: 0,
    totalActions: 0,
    delay: 800,
    buttons: [],
    whitelist: new Set()
};

// =============================================
// KALICILIK VE BEYAZ LİSTE ANAHTARLARI
// =============================================
function normalizeName(name) {
    return name.trim().replace(/^\/?r\//i, '').toLowerCase();
}

// Yer tutucu adlar sayfaya özeldir; '#' ile işaretlenir ve kaydedilmez.
function itemKey(item) {
    return item.placeholder ? `#${item.name}` : normalizeName(item.name);
}

function storageSet(values) {
    const onError = e => {
        console.error(e);
        warn(t.saveFailed);
    };
    try {
        chrome.storage.local.set(values).catch(onError);
    } catch (e) {
        onError(e);
    }
}

function saveWhitelist() {
    storageSet({ whitelist: [...State.whitelist].filter(key => !key.startsWith('#')) });
}
