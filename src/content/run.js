// Reddit Unfollow All - Sayaçlar ve log; çıkış ve geri katılma akışı.
'use strict';

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
    setSettingsEnabled(false);
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
    setSettingsEnabled(true);
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
    setSettingsEnabled(false);
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
    setSettingsEnabled(true);
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
    setSettingsEnabled(true);
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
