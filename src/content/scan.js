// Reddit Unfollow All - Abonelikleri tarama, sayfa yapısı kontrolü ve sayfa gözlemi.
'use strict';

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

// Old Reddit satırından subreddit adını ve kimliğini çıkarır. Adımlar sırayla denenir,
// ilk bulan kazanır. Ad bulunamazsa name null döner.
function resolveOldRedditName(btn, index) {
    let name = null;
    let id = `old-${index}`;

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

    return { name, id };
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
        const { name: resolved, id } = resolveOldRedditName(btn, i);
        let name = resolved;

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
        closeSettings();
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
