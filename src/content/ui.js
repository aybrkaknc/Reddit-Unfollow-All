// Reddit Unfollow All - Panel arayüzü: animasyon, pencereler, panel, başlatıcı düğme, beyaz liste.
'use strict';

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
                <span class="title-main">
                    <span class="panel-logo">${LOGO_ICON}</span>
                    <span class="panel-title">${t.title}</span>
                </span>
                <span class="title-settings">
                    <span id="btn-settings-back" class="ctrl-btn" role="button" tabindex="0" title="${t.back}" aria-label="${t.back}">${BACK_ICON_SVG}</span>
                    <span class="settings-title">${t.settings}</span>
                </span>
            </h2>
            <span id="mini-log" class="mini-log"></span>
            <div class="window-controls">
                <span id="btn-settings" class="ctrl-btn settings-btn" role="button" tabindex="0" title="${t.settings}" aria-label="${t.settings}">${GEAR_ICON_SVG}</span>
                <span id="btn-refresh" class="ctrl-btn refresh-btn" title="Refresh">${REFRESH_ICON_SVG}</span>
                <span id="btn-minimize" class="ctrl-btn" title="${t.minimize}">${MINUS_ICON_SVG}</span>
                <span id="btn-close" class="ctrl-btn${State.isRunning ? ' is-hidden' : ''}" title="${t.close}">${CLOSE_ICON_SVG}</span>
            </div>
        </div>
        
        <div class="panel-content">
            <div id="settings-view" class="settings-view">
                <div class="settings-row">
                    <div class="settings-label">${t.language}</div>
                    <div id="seg-lang" class="segmented" role="group" aria-label="${t.language}"></div>
                </div>
                <div class="settings-row">
                    <div class="settings-label">${t.speed}</div>
                    <div id="seg-speed" class="segmented" role="group" aria-label="${t.speed}"></div>
                </div>
                <div class="settings-row">
                    <div class="settings-label">${t.scale}</div>
                    <div id="seg-scale" class="segmented" role="group" aria-label="${t.scale}"></div>
                </div>
                <button id="btn-report" class="btn btn-secondary settings-report">${GITHUB_ICON_SVG}${t.report}</button>
            </div>

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
    document.getElementById('btn-report').addEventListener('click', () => openIssueForm());
    onActivate(document.getElementById('btn-settings'), toggleSettings);
    onActivate(document.getElementById('btn-settings-back'), () => {
        closeSettings();
        document.getElementById('btn-settings').focus();
    });
    panel.addEventListener('keydown', e => {
        if (e.key !== 'Escape' || !State.isSettingsOpen) return;
        // Reddit'in klavye kısayollarına gitmesin
        e.stopPropagation();
        e.preventDefault();
        closeSettings();
        document.getElementById('btn-settings').focus();
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
    document.getElementById('btn-refresh').addEventListener('click', () => window.location.reload());

    buildSegmented('seg-lang', LANGUAGES, setLanguage);
    buildSegmented('seg-speed', SPEEDS.map(s => ({ value: s.delay, label: `${s.level}x`, title: t[s.label] })), setSpeed);
    buildSegmented('seg-scale', SCALES.map(s => ({ value: s, label: `${Math.round(s * 100)}%` })), setScale);
    markSegment('seg-lang', currentLang);
    applySpeed();
    applyScale();
    applySettingsOpen();
    renderRejoinButton();
    renderHealthBanner();

    makeDraggable(panel);
    new ResizeObserver(keepPanelOnScreen).observe(panel);

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

// span düğmeler klavyeyle de çalışır
function onActivate(element, action) {
    element.addEventListener('click', action);
    element.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action();
        }
    });
}

// =============================================
// AYARLAR
// =============================================
// İşlem sürerken ayarlar açılmaz; açıkken dişli geri gibi çalışır
function toggleSettings() {
    if (State.isRunning) return;
    // Küçültülmüş panelde dişli, paneli ayarlar açık olarak genişletir
    const wasMinimized = State.isMinimized;
    State.isSettingsOpen = wasMinimized || !State.isSettingsOpen;
    anchorPanelToBottom();
    if (wasMinimized) {
        State.isMinimized = false;
        applyMinimized();
    }
    applySettingsOpen();
    // Dişli gizlendi: odak panelin içinde kalsın ki Esc çalışsın
    if (State.isSettingsOpen) document.getElementById('btn-settings-back').focus();
}

function closeSettings() {
    // Geri dönerken panel alttan sabit kalsın
    anchorPanelToBottom();
    State.isSettingsOpen = false;
    applySettingsOpen();
}

// Açılınca başlık "Settings" olur, dişli ve yenile gizlenir. Başlık solarak değişir.
// Ayarlar sağdan sola kayarak gelir; geri dönünce ana içerik soldan gelir ve panel yüksekliği akıcı değişir.
const PAGE_SLIDE_MS = 340;

function applySettingsOpen() {
    const panel = document.getElementById('reddit-unfollow-panel');
    const changed = panel.classList.contains('settings-open') !== State.isSettingsOpen;
    const fromHeight = changed ? getComputedStyle(panel).height : null;
    panel.classList.toggle('settings-open', State.isSettingsOpen);
    document.getElementById('btn-settings').setAttribute('aria-expanded', State.isSettingsOpen);
    if (!changed) return;

    playAnimation(panel.querySelector(State.isSettingsOpen ? '.title-settings' : '.title-main'), [
        { opacity: 0, transform: 'translateY(4px)' },
        { opacity: 1, transform: 'none' }
    ], { duration: 220 });

    if (State.isSettingsOpen) {
        playAnimation(document.getElementById('settings-view'), [
            { opacity: 0, transform: 'translateX(100%)' },
            { opacity: 1, transform: 'none' }
        ], { duration: PAGE_SLIDE_MS });
    } else {
        panel.querySelectorAll('.panel-content > :not(.settings-view)').forEach(element => {
            playAnimation(element, [
                { opacity: 0, transform: 'translateX(-30%)' },
                { opacity: 1, transform: 'none' }
            ], { duration: PAGE_SLIDE_MS });
        });
    }

    // Yeni yükseklik ölçülünce panel alttan sabit olduğu için üst kenar akıcı kayar.
    // Panelde başka geçiş sürüyorsa (küçültmeden açılış gibi) CSS'e bırakılır.
    const toHeight = getComputedStyle(panel).height;
    if (fromHeight && fromHeight !== toHeight && panel.getAnimations().length === 0) {
        playAnimation(panel, [{ height: fromHeight }, { height: toHeight }], { duration: PAGE_SLIDE_MS });
    }
}

// Tüm seçenekleri yan yana gösteren düğme dizisi; seçili olan aria-pressed ile işaretlenir
function buildSegmented(id, options, onSelect) {
    const group = document.getElementById(id);
    options.forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'segment';
        button.dataset.value = option.value;
        button.textContent = option.label;
        if (option.title) button.title = option.title;
        button.addEventListener('click', () => onSelect(option.value));
        group.append(button);
    });
}

function markSegment(id, value) {
    document.querySelectorAll(`#${id} .segment`).forEach(button => {
        button.setAttribute('aria-pressed', button.dataset.value === String(value));
    });
}

function setLanguage(lang) {
    if (lang === currentLang) return;
    switchLanguage();
    // Panel yeniden kuruldu: odak kaybolmasın, Esc çalışmaya devam etsin
    document.querySelector('#seg-lang [aria-pressed="true"]').focus();
}

// Seçili hız State.delay'den okunur
function applySpeed() {
    markSegment('seg-speed', State.delay);
}

function setSpeed(delay) {
    if (delay === State.delay) return;
    State.delay = delay;
    applySpeed();
    const speed = SPEEDS.find(s => s.delay === delay);
    log(t.speedSet.replace('{n}', `${speed.level}x`));
}

// Referans ekran 1920x1080: büyük ekranda panel ekrana oranla aynı boyutta kalır.
// Kademe aşağı yuvarlanır, küçük ekranda %100'ün altına inmez.
function defaultScale() {
    const ratio = Math.min(window.screen.width / 1920, window.screen.height / 1080);
    return SCALES.filter(scale => scale <= ratio).pop() || SCALES[0];
}

// --ruf-scale kök öğede durur: panel, pencereler ve başlatıcı düğme aynı değeri okur
function applyScale() {
    document.documentElement.style.setProperty('--ruf-scale', State.scale);
    markSegment('seg-scale', State.scale);
}

// Panel sağ alt köşesinden sabitlenir; yeni boyutu ekrana sığacak kadar kaydırılır
function anchorPanelForScale(ratio) {
    const panel = document.getElementById('reddit-unfollow-panel');
    const rect = panel.getBoundingClientRect();
    const right = window.innerWidth - rect.right;
    const bottom = window.innerHeight - rect.bottom;
    panel.style.right = `${Math.max(0, Math.min(right, window.innerWidth - rect.width * ratio))}px`;
    panel.style.bottom = `${Math.max(0, Math.min(bottom, window.innerHeight - rect.height * ratio))}px`;
    panel.style.left = 'auto';
    panel.style.top = 'auto';
}

// Panel büyüyünce (log, liste, ayarlar, boyut) ekranın dışına taşarsa içeri kaydırılır.
// Üst ve sol kenar önceliklidir: başlık sürüklenebilir kalmalı. Sürükleme sırasında karışılmaz.
function keepPanelOnScreen() {
    const panel = document.getElementById('reddit-unfollow-panel');
    if (!panel || panel.classList.contains('ruf-dragging')
        || panel.classList.contains('ruf-closed') || panel.classList.contains('ruf-off-page')) return;
    const rect = panel.getBoundingClientRect();
    if (!rect.width) return;
    const margin = 8;
    let dy = 0;
    let dx = 0;
    if (rect.bottom > window.innerHeight - margin) dy = window.innerHeight - margin - rect.bottom;
    if (rect.top + dy < margin) dy = margin - rect.top;
    if (rect.right > window.innerWidth - margin) dx = window.innerWidth - margin - rect.right;
    if (rect.left + dx < margin) dx = margin - rect.left;
    if (!dx && !dy) return;

    const style = getComputedStyle(panel);
    const hasTop = panel.style.top && panel.style.top !== 'auto';
    const hasLeft = panel.style.left && panel.style.left !== 'auto';
    if (dy) {
        if (hasTop) panel.style.top = `${panel.offsetTop + dy}px`;
        else panel.style.bottom = `${parseFloat(style.bottom) - dy}px`;
    }
    if (dx) {
        if (hasLeft) panel.style.left = `${panel.offsetLeft + dx}px`;
        else panel.style.right = `${parseFloat(style.right) - dx}px`;
    }
}

function setScale(scale) {
    if (scale === State.scale) return;
    anchorPanelForScale(scale / State.scale);
    State.scale = scale;
    applyScale();
    storageSet({ scale });
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

function setSettingsEnabled(enabled) {
    const btn = document.getElementById('btn-settings');
    btn.classList.toggle('is-disabled', !enabled);
    btn.setAttribute('aria-disabled', !enabled);
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
    // Yeniden açılınca ana sayfa görünür
    closeSettings();
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
    // Küçülünce başlık alt kenara doğru daralsın: panel alt kenardan sabitlenir
    anchorPanelToBottom();
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

// Beyaz liste yukarı doğru kayarak açılır, aşağı kayarak kapanır.
// height: auto CSS ile geçiş yapamadığı için açık yükseklik ölçülüp animasyonla oynatılır.
// Opaklık ve görünürlük geçişi CSS'te kalır.
let whitelistAnimation = null;

const WHITELIST_HIDDEN_FRAME = {
    height: '0px', paddingTop: '0px', paddingBottom: '0px',
    marginBottom: '0px', borderWidth: '0px', transform: 'translateY(14px)'
};

// Açık haldeki ölçüler; kutu o an açık sınıfta olmalı
function measureWhitelistOpenFrame(container) {
    const style = getComputedStyle(container);
    return {
        height: style.height, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom,
        marginBottom: style.marginBottom, borderWidth: style.borderTopWidth, transform: 'none'
    };
}

function toggleWhitelistView() {
    if (State.isRunning) return;
    // Panel alttan sabit kalsın: liste yukarı doğru açılır
    anchorPanelToBottom();
    State.isListOpen = !State.isListOpen;
    const container = document.getElementById('whitelist-container');

    // Yarım kalan animasyon iptal edilir ki ölçüm gerçek boyutu versin
    if (whitelistAnimation) whitelistAnimation.cancel();

    if (State.isListOpen) {
        container.classList.remove('hidden');
        renderWhitelist();
    }
    const openFrame = measureWhitelistOpenFrame(container);
    if (!State.isListOpen) container.classList.add('hidden');

    const frames = State.isListOpen ? [WHITELIST_HIDDEN_FRAME, openFrame] : [openFrame, WHITELIST_HIDDEN_FRAME];
    const animation = playAnimation(container, frames, { duration: 320 });
    whitelistAnimation = animation;
    if (animation) animation.onfinish = () => { if (whitelistAnimation === animation) whitelistAnimation = null; };

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
        // Bırakılınca alt kenardan sabitlenir: panel küçülürken başlık alt sınıra doğru kayar,
        // büyürken yukarı açılır (liste, log, ayarlar ve küçültme aynı yönde davranır)
        anchorPanelToBottom();
    }
}
