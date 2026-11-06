/**
 * Reddit Unfollow All - Content Script
 * Sayfada çalışan ana mantık. Panel enjeksiyonu, beyaz liste ve buton işlemleri.
 */
(function () {
    'use strict';

    // =============================================
    // ÇOKLAMA KONTROLÜ (Extension birden fazla çalışmasın)
    // =============================================
    if (window.__REDDIT_UNFOLLOW_ALL_LOADED__) return;
    window.__REDDIT_UNFOLLOW_ALL_LOADED__ = true;

    // =============================================
    // DİL ÇEVİRİLERİ (i18n)
    // =============================================
    const I18N = {
        tr: {
            title: "Reddit Unfollow All",
            total: "TOPLAM",
            done: "ÇIKILAN",
            kept: "KORUNAN",
            start: "BAŞLAT",
            cancel: "İPTAL ET",
            whitelist: "BEYAZ LİSTE",
            speed: "Hız Seçimi",
            slow: "Yavaş",
            normal: "Normal",
            fast: "Hızlı",
            turbo: "Turbo",
            ready: "Sistem hazır. Butonlar aranıyor...",
            found: "Sistem: {n} adet abonelik bulundu.",
            notFound: "Abonelik bulunamadı. Giriş yaptığınızdan emin olun; yaptıysanız Reddit sayfası değişmiş olabilir.",
            confirmStart: "{n} subreddit'ten çıkılacak, {k} tanesi korunacak. Sayfayı yenileyene kadar geri alabilirsiniz. Devam edilsin mi?",
            allKept: "Tüm subreddit'ler beyaz listede. Çıkılacak abonelik yok.",
            rateLimited: "Durduruldu: Reddit istekleri sınırlıyor olabilir. Birkaç dakika bekleyin veya daha yavaş bir hız seçin.",
            summary: "Sonuç: {x} çıkıldı, {y} korundu, {z} doğrulanamadı.",
            retryHint: "Doğrulanamayanları yeniden denemek için sayfayı yenileyin.",
            gone: "Atlandı: {s} artık sayfada değil.",
            saveFailed: "Ayarlar kaydedilemedi.",
            speedSet: "Hız: {n}",
            report: "Sorunu bildir",
            hideWarning: "Gizle",
            health: {
                'no-elements': "Reddit sayfası değişmiş olabilir, eklenti çalışmayabilir. Giriş yapmadıysanız önce giriş yapın.",
                'state-unreadable': "Reddit sayfası değişmiş olabilir: abonelikler okunamıyor, eklenti çalışmayabilir.",
                'names-unreadable': "Subreddit adları okunamıyor, beyaz liste doğru çalışmayabilir. Başlatmadan önce listeyi kontrol edin.",
                'not-confirmed': "Çıkışlar doğrulanamadı. Reddit istekleri sınırlıyor veya sayfası değişmiş olabilir."
            },
            started: "İşlem başlatıldı...",
            cancelled: "İşlem iptal edildi.",
            success: "Çıkıldı: {s}",
            skipped: "Korundu: {s}",
            error: "Hata: Bir butona tıklanamadı, atlanıyor.",
            notConfirmed: "Doğrulanamadı: {s}",
            completed: "✅ İşlem tamamlandı!",
            reloadConfirm: "Tüm işlemler bitti. Sayfayı yenileyerek kontrol etmek ister misiniz?",
            reloadLosesUndo: "Sayfayı yenilerseniz çıktığınız subreddit'lere buradan geri katılamazsınız.",
            rejoin: "Çıkılanlara geri katıl",
            rejoinAction: "Geri katıl",
            confirmRejoin: "{n} subreddit'e geri katılınacak. Devam edilsin mi?",
            rejoinStarted: "Geri katılma başlatıldı...",
            rejoined: "Geri katılındı: {s}",
            rejoinSummary: "Sonuç: {x} subreddit'e geri katılındı, {z} doğrulanamadı.",
            ok: "Tamam",
            dismiss: "Vazgeç",
            reload: "Yenile",
            logTitle: "Log",
            copy: "Kopyala",
            copied: "Kopyalandı",
            copyFailed: "Kopyalanamadı",
            collapse: "Daralt",
            expand: "Genişlet",
            minimize: "Küçült",
            close: "Kapat",
            searchPlaceholder: "Ara...",
            selectAll: "Tümünü Koru",
            deselectAll: "Hiçbirini Koruma",
            langSwitch: "Switch to English"
        },
        en: {
            title: "Reddit Unfollow All",
            total: "TOTAL",
            done: "DONE",
            kept: "KEPT",
            start: "START",
            cancel: "CANCEL",
            whitelist: "WHITELIST",
            speed: "Speed Select",
            slow: "Slow",
            normal: "Normal",
            fast: "Fast",
            turbo: "Turbo",
            ready: "System ready. Scanning buttons...",
            found: "System: {n} subscriptions found.",
            notFound: "No subscriptions found. Make sure you're logged in; if you are, Reddit's page may have changed.",
            confirmStart: "Leave {n} subreddits and keep {k}? You can undo this until you reload the page.",
            allKept: "All subreddits are on your whitelist. Nothing to leave.",
            rateLimited: "Stopped: Reddit may be limiting requests. Wait a few minutes or choose a slower speed.",
            summary: "Result: {x} left, {y} kept, {z} not confirmed.",
            retryHint: "Reload the page to retry the ones not confirmed.",
            gone: "Skipped: {s} is no longer on the page.",
            saveFailed: "Couldn't save your settings.",
            speedSet: "Speed: {n}",
            report: "Report",
            hideWarning: "Hide",
            health: {
                'no-elements': "Reddit's page may have changed, so this extension may not work. If you're logged out, log in first.",
                'state-unreadable': "Reddit's page may have changed: subscriptions can't be read, so this extension may not work.",
                'names-unreadable': "Subreddit names can't be read, so the whitelist may not work correctly. Check the list before you start.",
                'not-confirmed': "Leaving couldn't be confirmed. Reddit may be limiting requests or its page may have changed."
            },
            started: "Process started...",
            cancelled: "Process cancelled.",
            success: "Left: {s}",
            skipped: "Kept: {s}",
            error: "Error: Could not click button, skipping.",
            notConfirmed: "Not confirmed: {s}",
            completed: "✅ Process completed!",
            reloadConfirm: "All processes finished. Would you like to reload the page to check?",
            reloadLosesUndo: "If you reload, you can't rejoin the subreddits you left from here.",
            rejoin: "Rejoin the subreddits you left",
            rejoinAction: "Rejoin",
            confirmRejoin: "Rejoin {n} subreddits?",
            rejoinStarted: "Rejoining...",
            rejoined: "Rejoined: {s}",
            rejoinSummary: "Result: {x} rejoined, {z} not confirmed.",
            ok: "OK",
            dismiss: "Not now",
            reload: "Reload",
            logTitle: "Log",
            copy: "Copy",
            copied: "Copied",
            copyFailed: "Copy failed",
            collapse: "Collapse",
            expand: "Expand",
            minimize: "Minimize",
            close: "Close",
            searchPlaceholder: "Search...",
            selectAll: "Keep All",
            deselectAll: "Keep None",
            langSwitch: "Türkçe'ye geç"
        }
    };

    // Varsayılan: İngilizce. init() kayıtlı seçimi veya Reddit dilini uygular.
    let currentLang = 'en';
    let t = I18N[currentLang];

    function detectLang() {
        const raw = document.documentElement.lang || navigator.language || '';
        return raw.toLowerCase().startsWith('tr') ? 'tr' : 'en';
    }

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

    // =============================================
    // LOGO
    // =============================================
    // Eklentinin kendi logosu; 48 px dosya 20 px'te yüksek çözünürlüklü ekranda da net kalır
    const LOGO_ICON = `<img src="${chrome.runtime.getURL('icons/icon48.png')}" width="20" height="20" alt="" draggable="false">`;

    const COPY_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`;
    const GLOBE_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20"/></svg>`;
    // Pencere düğmeleri: aynı boyut ve çizgi kalınlığı, yazı tipine bağlı değil
    const CTRL_SVG_OPEN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
    const REFRESH_ICON_SVG = `${CTRL_SVG_OPEN}<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`;
    const MINUS_ICON_SVG = `${CTRL_SVG_OPEN}<path d="M5 12h14"/></svg>`;
    const PLUS_ICON_SVG = `${CTRL_SVG_OPEN}<path d="M5 12h14M12 5v14"/></svg>`;
    const CLOSE_ICON_SVG = `${CTRL_SVG_OPEN}<path d="M18 6 6 18M6 6l12 12"/></svg>`;
    const GITHUB_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`;
    const CHECK_ICON_SVG =`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
    const FAIL_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`;

    // =============================================
    // ANİMASYON
    // =============================================
    // Dil değişiminde panel yeniden kurulurken ve hareket azaltma açıkken oynatılmaz.
    // Oynatılmadıysa null döner.
    function playAnimation(element, keyframes, options) {
        if (State.isRebuilding || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
        return element.animate(keyframes, { easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', ...options });
    }

    function bumpAnimation(element, scale, color = null) {
        const peak = { transform: `scale(${scale})` };
        if (color) peak.color = color;
        playAnimation(element, [{ transform: 'scale(1)' }, peak, { transform: 'scale(1)' }], { duration: 260 });
    }

    // =============================================
    // UYARI PENCERESİ (alert/confirm yerine)
    // =============================================
    // Sonuç: onaylandıysa true. dismissLabel verilmezse tek düğmeli bilgi penceresidir.
    // role="alertdialog": Reddit onay penceresi aramasına (div[role="dialog"]) takılmaz.
    function showDialog(message, { confirmLabel = t.ok, dismissLabel = null } = {}) {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'ruf-dialog-overlay';

            const box = document.createElement('div');
            box.className = 'ruf-dialog';
            box.setAttribute('role', 'alertdialog');
            box.setAttribute('aria-modal', 'true');
            box.setAttribute('aria-label', t.title);

            const title = document.createElement('div');
            title.className = 'ruf-dialog-title';
            title.innerHTML = LOGO_ICON;
            title.append(t.title);

            const text = document.createElement('p');
            text.className = 'ruf-dialog-message';
            text.textContent = message;

            const actions = document.createElement('div');
            actions.className = 'ruf-dialog-actions';

            let isClosed = false;
            const close = result => {
                if (isClosed) return;
                isClosed = true;
                resolve(result);
                overlay.style.pointerEvents = 'none';
                const fadeOut = playAnimation(overlay, [{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' });
                if (!fadeOut) {
                    overlay.remove();
                    return;
                }
                fadeOut.onfinish = () => overlay.remove();
                fadeOut.oncancel = () => overlay.remove();
            };

            const buttons = [];
            if (dismissLabel) {
                const dismissBtn = document.createElement('button');
                dismissBtn.className = 'ruf-dialog-btn';
                dismissBtn.textContent = dismissLabel;
                dismissBtn.addEventListener('click', () => close(false));
                buttons.push(dismissBtn);
            }
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'ruf-dialog-btn ruf-dialog-btn-primary';
            confirmBtn.textContent = confirmLabel;
            confirmBtn.addEventListener('click', () => close(true));
            buttons.push(confirmBtn);

            overlay.addEventListener('keydown', e => {
                // Reddit'in klavye kısayollarına gitmesin
                e.stopPropagation();
                if (e.key === 'Escape') {
                    close(false);
                } else if (e.key === 'Tab') {
                    e.preventDefault();
                    const next = buttons.indexOf(document.activeElement) + 1;
                    buttons[next % buttons.length].focus();
                }
            });

            actions.append(...buttons);
            box.append(title, text, actions);
            overlay.append(box);
            document.body.append(overlay);
            // Geri alınamaz işlemde Enter yanlışlıkla onaylamasın: odak ilk düğmede
            buttons[0].focus();
        });
    }

    // =============================================
    // UI PANEL ENJEKSİYONU
    // =============================================
    function injectUI() {
        const panel = document.createElement('div');
        panel.id = 'reddit-unfollow-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h2>
                    <span class="panel-logo">${LOGO_ICON}</span>
                    <span class="panel-title">${t.title}</span>
                </h2>
                <span id="mini-log" class="mini-log"></span>
                <div class="window-controls">
                    <span id="btn-github" class="ctrl-btn" role="button" tabindex="0" title="${t.report}" aria-label="${t.report}">${GITHUB_ICON_SVG}</span>
                    <span id="btn-lang" class="ctrl-btn lang-btn" role="button" tabindex="0" title="${t.langSwitch}" aria-label="${t.langSwitch}">${GLOBE_ICON_SVG}</span>
                    <span id="btn-refresh" class="ctrl-btn refresh-btn" title="Refresh">${REFRESH_ICON_SVG}</span>
                    <span id="btn-minimize" class="ctrl-btn" title="${t.minimize}">${MINUS_ICON_SVG}</span>
                    <span id="btn-close" class="ctrl-btn${State.isRunning ? ' is-hidden' : ''}" title="${t.close}">${CLOSE_ICON_SVG}</span>
                </div>
            </div>
            
            <div class="panel-content">
                <div id="health-banner" class="health-banner is-hidden" role="alert">
                    <div id="health-text" class="health-text"></div>
                    <div class="health-actions">
                        <button id="btn-health-report" class="health-btn">${t.report}</button>
                        <button id="btn-health-hide" class="health-btn">${t.hideWarning}</button>
                    </div>
                </div>

                <div class="stat-block${State.showProgress ? ' has-progress' : ''}">
                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-label">${t.total}</div>
                        <div id="stat-total" class="stat-value">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">${t.done}</div>
                        <div id="stat-done" class="stat-value">0</div>
                    </div>
                    <!-- button değil: sitenin düğme stilleri kartın içeriğini etkilemesin -->
                    <div id="btn-review" class="stat-card stat-card-action" role="button" tabindex="0" title="${t.whitelist}" aria-expanded="${State.isListOpen}">
                        <div class="stat-label">${t.kept}</div>
                        <div id="stat-kept" class="stat-value">0</div>
                    </div>
                </div>

                <div class="progress-container">
                    <div id="progress-bar"></div>
                </div>
                </div>

                <!-- Whitelist Container (Hidden by Default) -->
                <div id="whitelist-container" class="whitelist-container hidden">
                    <div class="whitelist-header">
                        <input type="text" id="whitelist-search" class="whitelist-search" placeholder="${t.searchPlaceholder}" />
                        <div class="whitelist-actions">
                            <button id="btn-select-all" class="btn btn-small">${t.selectAll}</button>
                            <button id="btn-deselect-all" class="btn btn-small">${t.deselectAll}</button>
                        </div>
                    </div>
                    <div id="whitelist-list" class="whitelist-list">
                        <!-- Items will be rendered here -->
                    </div>
                </div>

                <div class="start-group">
                    <button id="btn-start" class="btn btn-primary">${t.start}</button>
                    <button id="btn-cancel" class="btn btn-secondary is-hidden" disabled>${t.cancel}</button>
                    <button id="btn-rejoin" class="btn btn-secondary rejoin-btn is-hidden"></button>
                    <button id="btn-speed" class="btn btn-secondary speed-badge"></button>
                </div>

                <div class="log-section">
                    <div id="log-terminal" class="log-terminal">
                        <div class="log-header">
                            <span class="log-title">${t.logTitle}</span>
                            <span id="btn-toggle-log" class="ctrl-btn"></span>
                        </div>
                        <div id="log-area" class="log-area"></div>
                        <button id="btn-copy-log" class="log-copy-btn" title="${t.copy}" aria-label="${t.copy}">${COPY_ICON_SVG}</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Event Listeners
        document.getElementById('btn-start').addEventListener('click', startUnfollowing);
        document.getElementById('btn-cancel').addEventListener('click', cancelRun);
        document.getElementById('btn-rejoin').addEventListener('click', startRejoin);
        document.getElementById('btn-copy-log').addEventListener('click', copyLog);
        document.getElementById('btn-health-report').addEventListener('click', () => openIssueForm(State.healthIssue));
        document.getElementById('btn-health-hide').addEventListener('click', () => {
            State.hiddenHealthIssues.add(State.healthIssue);
            renderHealthBanner();
        });
        panel.querySelector('.log-header').addEventListener('click', () => {
            State.isLogCollapsed = !State.isLogCollapsed;
            applyLogCollapsed();
        });
        const githubBtn = document.getElementById('btn-github');
        githubBtn.addEventListener('click', () => openIssueForm());
        githubBtn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openIssueForm();
            }
        });
        document.getElementById('btn-minimize').addEventListener('click', toggleMinimize);
        document.getElementById('btn-close').addEventListener('click', closePanel);
        const reviewCard = document.getElementById('btn-review');
        reviewCard.addEventListener('click', toggleWhitelistView);
        reviewCard.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleWhitelistView();
            }
        });
        document.getElementById('btn-select-all').addEventListener('click', selectAll);
        document.getElementById('btn-deselect-all').addEventListener('click', deselectAll);
        document.getElementById('whitelist-search').addEventListener('input', applyFilter);
        const langBtn = document.getElementById('btn-lang');
        langBtn.addEventListener('click', switchLanguage);
        langBtn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                switchLanguage();
            }
        });
        document.getElementById('btn-refresh').addEventListener('click', () => window.location.reload());

        // Her tıklama hızı bir kademe artırır, en hızlıdan sonra başa döner
        document.getElementById('btn-speed').addEventListener('click', () => {
            const current = SPEEDS.findIndex(s => s.delay === State.delay);
            const next = SPEEDS[(current + 1) % SPEEDS.length];
            State.delay = next.delay;
            applySpeed();
            bumpAnimation(document.getElementById('btn-speed'), 1.12);
            log(t.speedSet.replace('{n}', `${next.level}x`));
        });
        applySpeed();
        renderRejoinButton();
        renderHealthBanner();

        makeDraggable(panel);

        // Dil düğmesi küçültülmüş panelde de erişilebilir; küçük hali koru
        applyMinimized();
        applyPanelOpen();

        // Dil değişiminde panel yeniden kurulur; kayıtlar korunur
        applyLogCollapsed();
        if (State.logs.length === 0) {
            log(t.ready);
        } else {
            State.logs.forEach(renderLogLine);
        }
    }

    // Rozet seçili hızı gösterir; hız State.delay'den okunur
    function applySpeed() {
        const speed = SPEEDS.find(s => s.delay === State.delay);
        const badge = document.getElementById('btn-speed');
        badge.textContent = `${speed.level}x`;
        badge.title = `${t.speed}: ${t[speed.label]}`;
        badge.setAttribute('aria-label', badge.title);
    }

    // İşlem sürerken aynı yerde İptal, diğer zamanlarda Başlat görünür
    function setRunControls(isRunning) {
        const cancelBtn = document.getElementById('btn-cancel');
        if (isRunning) {
            // Başlat'a ilk basışta belirir ve son durumuyla kalır
            State.showProgress = true;
            document.querySelector('.stat-block').classList.add('has-progress');
        }
        document.getElementById('btn-start').classList.toggle('is-hidden', isRunning);
        cancelBtn.classList.toggle('is-hidden', !isRunning);
        cancelBtn.disabled = !isRunning;
        document.getElementById('btn-review').setAttribute('aria-disabled', isRunning);
        document.getElementById('btn-close').classList.toggle('is-hidden', isRunning);
        renderRejoinButton();
        applyMinimized();
    }

    // Yalnızca geri alınacak bir şey varken ve işlem sürmüyorken görünür
    function renderRejoinButton() {
        const btn = document.getElementById('btn-rejoin');
        const count = State.leftItems.length;
        btn.classList.toggle('is-hidden', count === 0 || State.isRunning);
        if (count === 0) return;
        btn.textContent = `↶ ${count}`;
        btn.title = t.rejoin;
        btn.setAttribute('aria-label', `${t.rejoin}: ${count}`);
    }

    // Sürüklenen panel üstten konumlanır; log yukarı açılsın diye alta sabitlenir
    function anchorPanelToBottom() {
        const panel = document.getElementById('reddit-unfollow-panel');
        if (!panel.style.top || panel.style.top === 'auto') return;
        panel.style.bottom = `${window.innerHeight - panel.getBoundingClientRect().bottom}px`;
        panel.style.top = 'auto';
    }

    function applyLogCollapsed() {
        anchorPanelToBottom();
        const btn = document.getElementById('btn-toggle-log');
        document.getElementById('log-terminal').classList.toggle('collapsed', State.isLogCollapsed);
        btn.textContent = '▸';
        btn.title = State.isLogCollapsed ? t.expand : t.collapse;
    }

    async function copyLog() {
        const btn = document.getElementById('btn-copy-log');
        try {
            await navigator.clipboard.writeText(State.logs.join('\n'));
            btn.innerHTML = CHECK_ICON_SVG;
            btn.title = t.copied;
        } catch (e) {
            console.error(e);
            btn.innerHTML = FAIL_ICON_SVG;
            btn.title = t.copyFailed;
        }
        setTimeout(() => {
            const current = document.getElementById('btn-copy-log');
            if (current) {
                current.innerHTML = COPY_ICON_SVG;
                current.title = t.copy;
            }
        }, 1500);
    }

    function setLangButtonEnabled(enabled) {
        document.getElementById('btn-lang').classList.toggle('is-disabled', !enabled);
    }

    function switchLanguage() {
        if (State.isRunning) return;

        currentLang = currentLang === 'en' ? 'tr' : 'en';
        t = I18N[currentLang];
        storageSet({ lang: currentLang });

        // Re-render the panel
        const oldPanel = document.getElementById('reddit-unfollow-panel');
        const panelPosition = oldPanel ? oldPanel.style.cssText : '';
        if (oldPanel) oldPanel.remove();

        State.isRebuilding = true;
        injectUI();
        document.getElementById('reddit-unfollow-panel').style.cssText = panelPosition;

        // Restore state to UI
        if (State.totalActions > 0) {
            updateUI();
            if (State.isListOpen) {
                document.getElementById('whitelist-container').classList.remove('hidden');
                renderWhitelist();
            }
        }
        State.isRebuilding = false;

        // Re-scan to populate list
        if (!State.isFinished) scanButtons(true);
    }

    // =============================================
    // PANELİ AÇMA / KAPAMA
    // =============================================
    function applyPanelOpen() {
        document.getElementById('reddit-unfollow-panel').classList.toggle('ruf-closed', !State.isPanelOpen);
        const launcher = document.getElementById('ruf-launcher');
        if (launcher) {
            launcher.classList.toggle('ruf-launcher-covered', State.isPanelOpen);
            launcher.setAttribute('aria-expanded', State.isPanelOpen);
        }
    }

    function openPanel() {
        State.isPanelOpen = true;
        State.isMinimized = false;
        applyPanelOpen();
        applyMinimized();
    }

    // İşlem sürerken veya bir soru açıkken panel kapanmaz: ilerleme ve iptal görünür kalmalı
    function closePanel() {
        if (State.isRunning || document.querySelector('.ruf-dialog-overlay')) return;
        State.isPanelOpen = false;
        applyPanelOpen();
    }

    function togglePanel() {
        if (State.isPanelOpen && !State.isMinimized) {
            closePanel();
        } else {
            openPanel();
        }
    }

    // Reddit'in sol menüsünde de aynı adda bağlantı olabilir: yalnızca başlık sayılır
    function findManageHeading() {
        const isMatch = text => MANAGE_HEADINGS.includes(text.trim().replace(/\s+/g, ' ').toLowerCase());
        const heading = [...document.querySelectorAll('h1, h2, h3, [role="heading"]')]
            .find(el => isMatch(el.textContent));
        if (heading) return heading;

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const excluded = 'a, button, nav, aside, script, style, reddit-sidebar-nav, #left-sidebar, #reddit-unfollow-panel, .ruf-dialog-overlay';
        while (walker.nextNode()) {
            const parent = walker.currentNode.parentElement;
            if (isMatch(walker.currentNode.nodeValue) && parent && !parent.closest(excluded)) return parent;
        }
        return null;
    }

    function createLauncher() {
        const launcher = document.createElement('button');
        launcher.id = 'ruf-launcher';
        launcher.type = 'button';
        launcher.className = 'ruf-launcher';
        launcher.textContent = 'Unfollow All';
        launcher.setAttribute('aria-haspopup', 'dialog');
        launcher.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            togglePanel();
        });
        return launcher;
    }

    // Düğme başlığın içine eklenir; başlık yoksa ve süre dolduysa köşede yüzer
    function syncLauncher() {
        let launcher = document.getElementById('ruf-launcher');
        if (!State.isOnTargetPage) {
            if (launcher) launcher.remove();
            return;
        }
        if (launcher && !launcher.classList.contains('ruf-launcher-floating')) return;

        const heading = findManageHeading();
        if (!heading && !State.launcherFallbackAllowed) return;
        if (!launcher) launcher = createLauncher();
        launcher.classList.toggle('ruf-launcher-floating', !heading);
        const parent = heading || document.body;
        if (launcher.parentElement !== parent) parent.append(launcher);
        applyPanelOpen();
    }

    function toggleMinimize() {
        State.isMinimized = !State.isMinimized;
        applyMinimized();
    }

    // İşlem sürerken küçültülen panel tek satırlık log ve genişletme düğmesine iner.
    // İşlem bitince (iptal dahil) güncel işlem varmış izlenimi vermemesi için normal küçük hale döner.
    function applyMinimized() {
        const panel = document.getElementById('reddit-unfollow-panel');
        const btn = document.getElementById('btn-minimize');
        panel.classList.toggle('minimized', State.isMinimized);
        panel.classList.toggle('log-mini', State.isMinimized && State.isRunning);
        btn.innerHTML = State.isMinimized ? PLUS_ICON_SVG : MINUS_ICON_SVG;
        btn.title = State.isMinimized ? t.expand : t.minimize;
        updateMiniLog();
    }

    function updateMiniLog() {
        const miniLog = document.getElementById('mini-log');
        if (miniLog.textContent === State.lastLogMessage) return;
        miniLog.textContent = State.lastLogMessage;
        miniLog.title = State.lastLogMessage;
        if (document.getElementById('reddit-unfollow-panel').classList.contains('log-mini')) {
            playAnimation(miniLog, [
                { opacity: 0.2, transform: 'translateY(3px)' },
                { opacity: 1, transform: 'none' }
            ], { duration: 180 });
        }
    }

    function toggleWhitelistView() {
        if (State.isRunning) return;
        State.isListOpen = !State.isListOpen;
        const container = document.getElementById('whitelist-container');
        if (State.isListOpen) {
            container.classList.remove('hidden');
            renderWhitelist();
        } else {
            container.classList.add('hidden');
        }
        document.getElementById('btn-review').setAttribute('aria-expanded', State.isListOpen);
    }

    function renderWhitelist() {
        const listEl = document.getElementById('whitelist-list');
        listEl.innerHTML = '';

        State.buttons.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'whitelist-row';
            row.dataset.name = item.name.toLowerCase();

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `keep-${index}`;
            checkbox.className = 'keep-checkbox';
            checkbox.checked = State.whitelist.has(itemKey(item));
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    State.whitelist.add(itemKey(item));
                } else {
                    State.whitelist.delete(itemKey(item));
                }
                saveWhitelist();
                updateUI();
            });

            const label = document.createElement('label');
            label.htmlFor = `keep-${index}`;
            label.textContent = item.name;

            row.appendChild(checkbox);
            row.appendChild(label);
            listEl.appendChild(row);
        });

        applyFilter();
    }

    function applyFilter() {
        const query = document.getElementById('whitelist-search').value.toLowerCase();
        const rows = document.querySelectorAll('.whitelist-row');
        rows.forEach(row => {
            if (row.dataset.name.includes(query)) {
                row.style.display = 'flex';
            } else {
                row.style.display = 'none';
            }
        });
    }

    function selectAll() {
        State.buttons.forEach(item => State.whitelist.add(itemKey(item)));
        saveWhitelist();
        renderWhitelist();
        updateUI();
    }

    function deselectAll() {
        State.whitelist.clear();
        saveWhitelist();
        renderWhitelist();
        updateUI();
    }

    function makeDraggable(el) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = el.querySelector('.panel-header');
        if (header) header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            // Pencere düğmeleri sürükleme başlatmaz
            if (e.target.closest('.ctrl-btn')) return;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            el.style.transition = 'none';
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            if (pos1 !== 0 || pos2 !== 0) {
                el.classList.add('ruf-dragging');
            }
            pos3 = e.clientX;
            pos4 = e.clientY;
            el.style.top = (el.offsetTop - pos2) + "px";
            el.style.left = (el.offsetLeft - pos1) + "px";
            el.style.bottom = 'auto';
            el.style.right = 'auto';
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            el.classList.remove('ruf-dragging');
            el.style.transition = '';
        }
    }

    // =============================================
    // BUTON TARAMA
    // =============================================
    function shredditSignals(btn) {
        const type = btn.getAttribute('button-type');
        let text = false;
        if (btn.shadowRoot) {
            const innerBtn = btn.shadowRoot.querySelector('button');
            if (innerBtn) {
                const label = (innerBtn.innerText || '').trim().toLowerCase();
                text = label.includes('katıldı') || label.includes('joined');
            }
        }
        return { subscribed: btn.hasAttribute('subscribed'), type: type === 'joined' || type === 'member', text };
    }

    function isShredditJoined(btn) {
        const signals = shredditSignals(btn);
        return signals.subscribed || signals.type || signals.text;
    }

    // Bu sayfa yüklemesinde tıklananlar: yeniden tıklamak aboneliği geri açabilir
    function wasAttempted(item) {
        return State.attemptedElements.has(item.element)
            || (!item.placeholder && State.attemptedKeys.has(itemKey(item)));
    }

    function markAttempted(item) {
        State.attemptedElements.add(item.element);
        if (!item.placeholder) State.attemptedKeys.add(itemKey(item));
    }

    function scanButtons(forceLog = false) {
        let found = [];

        // Shreddit Custom Element
        const shredditButtons = document.querySelectorAll('shreddit-join-button');
        shredditButtons.forEach(btn => {
            if (isShredditJoined(btn)) {
                const attrName = btn.getAttribute('name');
                const name = attrName || `r/subreddit_${found.length + 1}`;
                const id = btn.getAttribute('subreddit-id') || `idx-${found.length}`;
                found.push({ element: btn, name, id, placeholder: !attrName });
            }
        });

        // Old Reddit (Klasik & Sidebar)
        // .active: sadece abone olunan satırlarda "leave" seçeneği aktiftir
        const oldReddit = document.querySelectorAll('a.option.remove.active');
        oldReddit.forEach((btn, i) => {
            let name = null;
            let id = `old-${i}`;

            // 1. Sidebar/Liste Yapısı (fancy-toggle-button) - EN GÜVENİLİR
            const fancySpan = btn.closest('.fancy-toggle-button');
            if (fancySpan) {
                // data-sr_name attribute'unu doğrudan oku (dataset camelCase sorunu olabilir)
                const srName = fancySpan.getAttribute('data-sr_name');
                if (srName) {
                    name = srName;
                } else {
                    // Option A: En yakın <li> elementine çık ve orada .title ara
                    const listItem = btn.closest('li');
                    if (listItem) {
                        const titleLink = listItem.querySelector('a.title');
                        if (titleLink) {
                            name = titleLink.textContent.trim();
                        }
                    } else if (fancySpan.parentElement) {
                        // Fallback: li bulunamazsa parent'a bak
                        const titleLink = fancySpan.parentElement.querySelector('a.title');
                        if (titleLink) {
                            name = titleLink.textContent.trim();
                        }
                    }
                }
            }

            // 2. ".thing" elementi üzerinden (data-subreddit attribute)
            if (!name) {
                const thing = btn.closest('.thing');
                if (thing) {
                    if (thing.dataset.subreddit) {
                        name = thing.dataset.subreddit;
                    }
                    if (thing.dataset.fullname) {
                        id = thing.dataset.fullname;
                    }

                    // Thing içindeki başlık linki
                    if (!name) {
                        const infoLink = thing.querySelector('a.subreddit-info, a.title');
                        if (infoLink) {
                            const href = infoLink.getAttribute('href') || '';
                            const match = href.match(/\/r\/([^\/]+)/);
                            name = match ? match[1] : infoLink.textContent.trim();
                        }
                    }
                }
            }

            // 3. ".subreddit-info" veya ".entry .subreddit" içinden
            if (!name) {
                const entry = btn.closest('.entry');
                if (entry) {
                    const subredditLink = entry.querySelector('.subreddit');
                    if (subredditLink) {
                        name = subredditLink.textContent.trim();
                    }
                }
            }

            // 4. Sidebar Görünümü (Eski fallback)
            if (!name) {
                const side = btn.closest('.side');
                if (side) {
                    const sideTitle = side.querySelector('.redditname a');
                    if (sideTitle) {
                        name = sideTitle.textContent.trim();
                    }
                }
            }

            // 5. Sayfa Başlığı
            if (!name) {
                const headerName = document.querySelector('.pagename a');
                if (headerName) {
                    name = headerName.textContent.trim();
                }
            }

            // 6. Temizleme ve Numaralandırma
            // Sayfa başlığı ("subreddits") gerçek ad değildir; "r/subreddit_tips" gibi adlar korunur
            const placeholder = !name || /^(my )?subreddit('ler|s)?$/i.test(name);
            if (placeholder) {
                name = `r/subreddit_${i + 1}`;
            }

            found.push({ element: btn, name, id, placeholder });
        });

        // Old reddit aynı aboneliği hem ana listede hem kenar çubuğunda gösterebilir
        const seen = new Set();
        found = found.filter(item => {
            const key = itemKey(item);
            if (seen.has(key) || wasAttempted(item)) return false;
            seen.add(key);
            return true;
        });

        const changed = found.length !== State.totalActions;
        State.buttons = found;
        State.totalActions = found.length;
        updateUI();

        if (forceLog || changed) {
            log(t.found.replace('{n}', State.totalActions));
        }
        if (forceLog && State.totalActions === 0) {
            warn(t.notFound);
        }
        if (changed && State.isListOpen) {
            renderWhitelist();
        }
        if (found.length > 0 && !State.isRunning) {
            saveExpectedSubscriptions(found.length);
        }
        checkPageHealth();
    }

    // =============================================
    // SAYFA YAPISI KONTROLÜ (FAILSAFE)
    // =============================================
    // Son bilinen abonelik sayısı: 0 ise boş sayfa normaldir (her şeyden çıkılmıştır)
    function saveExpectedSubscriptions(count) {
        if (State.expectedSubscriptions === count) return;
        State.expectedSubscriptions = count;
        storageSet({ expectedSubscriptions: count });
    }

    function isOldReddit() {
        return window.location.hostname.startsWith('old.');
    }

    function pageCounts() {
        return {
            shreddit: document.querySelectorAll('shreddit-join-button').length,
            toggles: document.querySelectorAll('.fancy-toggle-button').length,
            removeLinks: document.querySelectorAll('a.option.remove').length,
            found: State.buttons.length,
            unnamed: State.buttons.filter(item => item.placeholder).length
        };
    }

    function detectHealthIssue() {
        if (State.stickyHealthIssue) return State.stickyHealthIssue;
        if (isOldReddit() && !document.body.classList.contains('loggedin')) return null;

        const counts = pageCounts();
        const mayBeEmpty = State.expectedSubscriptions === 0;

        if (counts.shreddit === 0 && counts.toggles === 0) {
            return mayBeEmpty ? null : 'no-elements';
        }
        const onCommunities = window.location.pathname.includes('/communities');
        const noneJoined = onCommunities && counts.shreddit > 0
            && ![...document.querySelectorAll('shreddit-join-button')].some(isShredditJoined);
        if (!mayBeEmpty && noneJoined) return 'state-unreadable';
        if (counts.toggles > 0 && counts.removeLinks === 0) return 'state-unreadable';
        if (counts.found > 0 && counts.unnamed * 2 >= counts.found) return 'names-unreadable';
        return null;
    }

    function checkPageHealth() {
        if (!State.healthChecksEnabled || State.isRunning || !State.isOnTargetPage) return;
        const issue = detectHealthIssue();
        if (issue === State.healthIssue) return;
        State.healthIssue = issue;
        renderHealthBanner();
        if (issue && !State.loggedHealthIssues.has(issue)) {
            State.loggedHealthIssues.add(issue);
            warn(t.health[issue]);
        }
    }

    function renderHealthBanner() {
        const issue = State.healthIssue;
        const isShown = issue && !State.hiddenHealthIssues.has(issue);
        document.getElementById('health-banner').classList.toggle('is-hidden', !isShown);
        if (isShown) document.getElementById('health-text').textContent = t.health[issue];
    }

    // Kullanıcı formu görür ve kendisi gönderir. Kullanıcı adı, tam adres, subreddit
    // adları ve log satırları (abonelik adları içerir) bilerek eklenmez.
    // issue verilmezse genel hata bildirimidir: açıklama alanlarını kullanıcı doldurur.
    function openIssueForm(issue = null) {
        const page = window.location.pathname.includes('/communities') ? 'communities' : 'subreddits';
        const counts = pageCounts();
        const browser = (navigator.userAgent.match(/Chrome\/[\d.]+/) || ['unknown'])[0];
        const params = new URLSearchParams({
            template: 'bug_report.yml',
            title: issue ? `Possible Reddit page change: ${issue}` : 'Bug: ',
            version: chrome.runtime.getManifest().version,
            design: isOldReddit() ? 'old.reddit.com' : 'Current Reddit',
            logs: [
                `warning: ${State.healthIssue || 'none'}`,
                `page: ${page}`,
                `browser: ${browser}`,
                ...Object.entries(counts).map(([name, value]) => `${name}: ${value}`)
            ].join('\n')
        });
        if (issue) {
            params.set('steps', `Opened the ${page} page with the extension installed.`);
            params.set('expected', 'The extension finds my subscriptions and can leave them.');
            params.set('actual', `The extension showed the warning "${issue}".`);
        }
        window.open(`${REPORT_URL}?${params}`, '_blank', 'noopener');
    }

    function isTargetPage() {
        const path = window.location.pathname;
        return /^\/subreddits(\/|$)/.test(path) || /^\/user\/[^/]+\/communities(\/|$)/.test(path);
    }

    // Yeni Reddit sayfa yenilemeden gezinir: eklenti sayfası dışında panel gizlenir
    function syncPanelWithPage() {
        const onTarget = isTargetPage();
        if (onTarget === State.isOnTargetPage) return;
        State.isOnTargetPage = onTarget;
        document.getElementById('reddit-unfollow-panel').classList.toggle('ruf-off-page', !onTarget);

        if (onTarget) {
            // Eski sayfanın butonları gitti; yeniden taramaya izin ver
            State.isFinished = false;
        } else {
            cancelRun();
            // Çıkılanların düğmeleri bu sayfayla birlikte gitti
            State.leftItems = [];
            renderRejoinButton();
            const dialog = document.querySelector('.ruf-dialog-overlay');
            if (dialog) dialog.remove();
        }
    }

    function startObserver() {
        let pending = null;
        let launcherPending = null;
        const observer = new MutationObserver(mutations => {
            syncPanelWithPage();
            if (!launcherPending) {
                launcherPending = setTimeout(() => {
                    launcherPending = null;
                    syncLauncher();
                }, 500);
            }
            if (pending || !State.isOnTargetPage || State.isRunning || State.isFinished) return;
            const panel = document.getElementById('reddit-unfollow-panel');
            if (panel && mutations.every(m => panel.contains(m.target))) return;
            pending = setTimeout(() => {
                pending = null;
                if (State.isOnTargetPage && !State.isRunning && !State.isFinished) scanButtons();
            }, 500);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function setStat(id, value) {
        const element = document.getElementById(id);
        if (element.textContent === String(value)) return;
        element.textContent = value;
        bumpAnimation(element, 1.25, '#FF4500');
    }

    function updateUI() {
        setStat('stat-total', State.buttons.filter(item => !wasAttempted(item)).length);
        setStat('stat-done', State.unsubscribedCount);
        setStat('stat-kept', State.buttons.filter(item => State.whitelist.has(itemKey(item))).length);

        const goal = State.mode === 'rejoin' ? State.rejoinTotal : State.totalActions;
        const progress = goal > 0 ? Math.min((State.currentIndex / goal) * 100, 100) : 0;
        document.getElementById('progress-bar').style.width = `${progress}%`;
    }

    function log(message) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const text = `[${time}] ${message}`;
        State.logs.push(text);
        State.lastLogMessage = message;
        renderLogLine(text);
        updateMiniLog();
    }

    // Log daraltılmış olsa da kullanıcının görmesi gereken mesajlar için
    function warn(message) {
        log(message);
        if (State.isLogCollapsed) {
            State.isLogCollapsed = false;
            applyLogCollapsed();
        }
    }

    function logSummary() {
        log(t.summary
            .replace('{x}', State.unsubscribedCount)
            .replace('{y}', State.keptCount)
            .replace('{z}', State.unconfirmedCount));
        if (State.unconfirmedCount > 0) log(t.retryHint);
    }

    function recordUnconfirmed() {
        State.unconfirmedCount++;
        State.unconfirmedStreak++;
    }

    // Ekranda en yeni üstte; kopyalanan metin eskiden yeniye sıralı
    function renderLogLine(text) {
        const line = document.createElement('div');
        line.textContent = text;
        document.getElementById('log-area').prepend(line);
        playAnimation(line, [
            { opacity: 0, transform: 'translateY(-4px)' },
            { opacity: 1, transform: 'none' }
        ], { duration: 180 });
    }

    async function startUnfollowing() {
        // Önceki çalıştırmadan kalan eski butonlarla başlamamak için her seferinde tara
        State.isFinished = false;
        scanButtons();
        if (State.totalActions === 0) {
            await showDialog(t.notFound);
            return;
        }

        const leaveCount = State.buttons.filter(item => !State.whitelist.has(itemKey(item))).length;
        if (leaveCount === 0) {
            await showDialog(t.allKept);
            return;
        }
        const confirmText = t.confirmStart
            .replace('{n}', leaveCount)
            .replace('{k}', State.totalActions - leaveCount);
        // Gizlenmiş olsa da gösterilir: işlem geri alınamaz
        const message = State.healthIssue ? `${t.health[State.healthIssue]}\n\n${confirmText}` : confirmText;
        if (!await showDialog(message, { confirmLabel: t.start, dismissLabel: t.dismiss })) return;

        State.stickyHealthIssue = null;
        State.healthIssue = null;
        renderHealthBanner();
        State.isRunning = true;
        State.currentIndex = 0;
        State.unsubscribedCount = 0;
        State.unconfirmedCount = 0;
        State.unconfirmedStreak = 0;
        State.keptCount = 0;
        setRunControls(true);
        setLangButtonEnabled(false);
        State.isLogCollapsed = false;
        applyLogCollapsed();

        updateUI();
        log(t.started);
        scheduleNext(0);
    }

    function scheduleNext(ms) {
        clearTimeout(State.timer);
        State.timer = setTimeout(processNext, ms);
    }

    function cancelRun() {
        if (!State.isRunning) return;
        State.isRunning = false;
        clearTimeout(State.timer);
        document.getElementById('btn-cancel').disabled = true;
        // İşlenen bir öğe varsa bitince processNext tamamlar
        if (!State.isProcessing) finishCancel();
    }

    function finishCancel(message = t.cancelled) {
        if (State.mode === 'rejoin') {
            finishRejoin(message);
            return;
        }
        State.currentIndex = 0;
        setLangButtonEnabled(true);
        setRunControls(false);
        scanButtons();
        saveExpectedSubscriptions(State.totalActions + State.unconfirmedCount);
        warn(message);
        logSummary();
    }

    function simulateClick(element) {
        ['mousedown', 'mouseup', 'click'].forEach(eventType => {
            element.dispatchEvent(new MouseEvent(eventType, { bubbles: true, cancelable: true, view: window }));
        });
    }

    // Shreddit'te sinyallerin hepsi çıkıştan sonra değişmeyebilir (örn. button-type):
    // tıklamadan önce "abone" diyen herhangi bir sinyalin değişmesi yeterlidir.
    function hasLeft(item, before) {
        const el = item.element;
        if (!document.body.contains(el)) return true;
        if (el.tagName.toLowerCase() === 'shreddit-join-button') {
            const now = shredditSignals(el);
            return (before.subscribed && !now.subscribed)
                || (before.type && !now.type)
                || (before.text && !now.text);
        }
        return !el.classList.contains('active');
    }

    // Sadece tıklamadan sonra açılan dialog'daki onay butonuna basar
    function confirmNewDialog(dialogsBefore) {
        for (const dialog of document.querySelectorAll('div[role="dialog"]')) {
            if (dialogsBefore.has(dialog)) continue;
            for (const modalBtn of dialog.querySelectorAll('button')) {
                const text = (modalBtn.innerText || '').toLowerCase();
                if (text.includes('leave') || text.includes('ayrıl') || text.includes('yes') || text.includes('evet')) {
                    simulateClick(modalBtn);
                    return true;
                }
            }
        }
        return false;
    }

    // Çıkış gerçekleşene kadar en fazla timeoutMs bekler; gerekirse onay penceresini onaylar
    function waitForLeave(item, dialogsBefore, before) {
        let confirmed = false;
        return waitUntil(() => hasLeft(item, before), () => {
            if (!confirmed) confirmed = confirmNewDialog(dialogsBefore);
        });
    }

    async function waitUntil(check, onTick = () => {}, timeoutMs = 3000) {
        const stepMs = 100;
        for (let waited = 0; waited < timeoutMs; waited += stepMs) {
            await new Promise(r => setTimeout(r, stepMs));
            onTick();
            if (check()) return true;
        }
        return check();
    }

    function isShredditButton(element) {
        return element.tagName.toLowerCase() === 'shreddit-join-button';
    }

    function shredditClickTarget(element) {
        const innerBtn = element.shadowRoot && element.shadowRoot.querySelector('button');
        return innerBtn || element;
    }

    // Old Reddit'te çıkış ve katılma aynı kutuda iki ayrı bağlantıdır
    function rejoinClickTarget(element) {
        if (isShredditButton(element)) return shredditClickTarget(element);
        const box = element.closest('.fancy-toggle-button') || element.parentElement;
        return box && box.querySelector('a.option.add');
    }

    // hasLeft'in tersi: abone sinyallerinden en az biri yeniden açılmalıdır.
    // Çıkıştan sonra değişmeden kalan sinyal (örn. button-type) kanıt sayılmaz.
    function hasRejoined(element, before) {
        if (isShredditButton(element)) {
            const now = shredditSignals(element);
            return (!before.subscribed && now.subscribed)
                || (!before.type && now.type)
                || (!before.text && now.text);
        }
        return element.classList.contains('active');
    }

    async function startRejoin() {
        if (State.isRunning || State.leftItems.length === 0) return;
        const message = t.confirmRejoin.replace('{n}', State.leftItems.length);
        if (!await showDialog(message, { confirmLabel: t.rejoinAction, dismissLabel: t.dismiss })) return;
        if (State.isRunning || State.leftItems.length === 0) return;

        State.mode = 'rejoin';
        State.isRunning = true;
        State.currentIndex = 0;
        State.rejoinTotal = State.leftItems.length;
        State.rejoinedCount = 0;
        State.rejoinFailedCount = 0;
        State.unconfirmedStreak = 0;
        setRunControls(true);
        setLangButtonEnabled(false);
        State.isLogCollapsed = false;
        applyLogCollapsed();

        updateUI();
        log(t.rejoinStarted);
        scheduleNext(0);
    }

    // Öğe denemeden önce listeden çıkar: doğrulanamayana yeniden basmak
    // gerçekleşmiş bir katılımı geri çevirebilir.
    async function processRejoin() {
        if (State.leftItems.length === 0) {
            State.isRunning = false;
            finishRejoin();
            return;
        }

        const item = State.leftItems.shift();
        const label = item.name.substring(0, 25);
        State.isProcessing = true;
        try {
            const target = document.body.contains(item.element) ? rejoinClickTarget(item.element) : null;
            if (!document.body.contains(item.element)) {
                log(t.gone.replace('{s}', label));
            } else if (!target) {
                recordRejoinFailure(label);
            } else {
                const before = isShredditButton(item.element) ? shredditSignals(item.element) : null;
                simulateClick(target);
                if (await waitUntil(() => hasRejoined(item.element, before))) {
                    State.rejoinedCount++;
                    State.unconfirmedStreak = 0;
                    State.unsubscribedCount = Math.max(0, State.unsubscribedCount - 1);
                    State.attemptedElements.delete(item.element);
                    if (!item.placeholder) State.attemptedKeys.delete(itemKey(item));
                    log(t.rejoined.replace('{s}', label));
                } else {
                    recordRejoinFailure(label);
                }
            }
        } catch (e) {
            State.rejoinFailedCount++;
            State.unconfirmedStreak++;
            log(t.error);
            console.error(e);
        }
        State.isProcessing = false;
        State.currentIndex++;
        updateUI();

        if (!State.isRunning) {
            finishRejoin(t.cancelled);
            return;
        }
        if (State.unconfirmedStreak >= MAX_UNCONFIRMED_STREAK) {
            State.isRunning = false;
            finishRejoin(t.rateLimited);
            return;
        }
        scheduleNext(State.delay);
    }

    function recordRejoinFailure(label) {
        State.rejoinFailedCount++;
        State.unconfirmedStreak++;
        log(t.notConfirmed.replace('{s}', label));
    }

    function finishRejoin(message = null) {
        State.mode = 'leave';
        State.currentIndex = 0;
        State.isFinished = false;
        setLangButtonEnabled(true);
        setRunControls(false);
        scanButtons();
        saveExpectedSubscriptions(State.totalActions + State.unconfirmedCount);
        if (message) warn(message);
        log(t.rejoinSummary
            .replace('{x}', State.rejoinedCount)
            .replace('{z}', State.rejoinFailedCount));
    }

    async function processNext() {
        if (!State.isRunning || State.isProcessing) return;

        if (State.mode === 'rejoin') {
            await processRejoin();
            return;
        }

        if (State.currentIndex < State.totalActions) {
            const item = State.buttons[State.currentIndex];

            // Whitelist Kontrolü
            if (State.whitelist.has(itemKey(item))) {
                log(t.skipped.replace('{s}', item.name.substring(0, 25)));
                State.keptCount++;
                State.currentIndex++;
                updateUI();
                scheduleNext(100);
                return;
            }

            State.isProcessing = true;
            if (document.body.contains(item.element)) {
                try {
                    const dialogsBefore = new Set(document.querySelectorAll('div[role="dialog"]'));
                    const isShreddit = isShredditButton(item.element);
                    const before = isShreddit ? shredditSignals(item.element) : null;

                    simulateClick(isShreddit ? shredditClickTarget(item.element) : item.element);

                    markAttempted(item);

                    if (await waitForLeave(item, dialogsBefore, before)) {
                        State.unsubscribedCount++;
                        State.unconfirmedStreak = 0;
                        State.leftItems.push(item);
                        log(t.success.replace('{s}', item.name.substring(0, 25)));
                    } else {
                        recordUnconfirmed();
                        log(t.notConfirmed.replace('{s}', item.name.substring(0, 25)));
                        console.warn('[Reddit Unfollow All] Not confirmed', item.name, {
                            before,
                            now: isShreddit ? shredditSignals(item.element) : null,
                            html: item.element.outerHTML.substring(0, 500)
                        });
                    }
                } catch (e) {
                    recordUnconfirmed();
                    log(t.error);
                    console.error(e);
                }
            } else {
                log(t.gone.replace('{s}', item.name.substring(0, 25)));
            }

            State.isProcessing = false;
            if (!State.isRunning) {
                finishCancel();
                return;
            }
            if (State.unconfirmedStreak >= MAX_UNCONFIRMED_STREAK) {
                State.isRunning = false;
                State.stickyHealthIssue = 'not-confirmed';
                finishCancel(t.rateLimited);
                return;
            }
            State.currentIndex++;
            updateUI();
            scheduleNext(State.delay);
        } else {
            complete();
        }
    }

    function complete() {
        State.isRunning = false;
        State.isFinished = true;
        setLangButtonEnabled(true);
        log(t.completed);
        logSummary();
        setRunControls(false);
        saveExpectedSubscriptions(State.keptCount + State.unconfirmedCount);

        setTimeout(async () => {
            if (State.isRunning || !State.isOnTargetPage) return;
            const message = State.leftItems.length > 0
                ? `${t.reloadConfirm}\n\n${t.reloadLosesUndo}`
                : t.reloadConfirm;
            if (await showDialog(message, { confirmLabel: t.reload, dismissLabel: t.dismiss })) {
                window.location.reload();
            }
        }, 1500);
    }

    async function init() {
        let saved = {};
        try {
            saved = await chrome.storage.local.get(['lang', 'whitelist', 'expectedSubscriptions']);
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

        // İşlem sürerken sayfadan ayrılmadan önce tarayıcının uyarısını göster
        window.addEventListener('beforeunload', e => {
            if (!State.isRunning) return;
            e.preventDefault();
            e.returnValue = '';
        });
    }

    init();

})();
