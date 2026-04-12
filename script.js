// tsParticles Configuration
// Mobile detection for performance optimization
const isMobile = window.innerWidth <= 768;


tsParticles.load("tsparticles", {
    fpsLimit: 40,
    fullScreen: {
        enable: true
    },
    particles: {
        number: {
            value: isMobile ? 15 : 30,
            density: {
                enable: false
            }
        },
        color: {
            value: "#ffffff"
        },
        shape: {
            type: "circle"
        },
        opacity: {
            value: 0.85,
            random: false,
            animation: {
                enable: false
            }
        },
        size: {
            value: { min: 1.2, max: 3 },
            random: true,
            animation: {
                enable: false
            }
        },
        links: {
            enable: true,
            distance: isMobile ? 150 : 250,
            color: "#ff0000",
            opacity: 1,
            width: isMobile ? 2 : 3,
            shadow: {
                enable: false,
                color: "#ff0000",
                blur: 0
            }
        },
        move: {
            enable: true,
            speed: 0.6,
            direction: "none",
            random: false,
            straight: false,
            outModes: {
                default: "out"
            },
            bounce: false,
            attract: {
                enable: false
            }
        }
    },
    interactivity: {
        detectOn: "canvas",
        events: {
            onHover: {
                enable: false
            },
            onClick: {
                enable: false
            },
            resize: false
        },
        modes: {
            grab: {
                distance: 400,
                links: {
                    opacity: 1
                }
            },
            bubble: {
                distance: 400,
                size: 40,
                duration: 2,
                opacity: 8,
                speed: 3
            },
            repulse: {
                distance: 200,
                duration: 0.4
            },
            push: {
                quantity: 4
            },
            remove: {
                quantity: 8
            }
        }
    },
    detectRetina: false,
    background: {
        color: {
            value: "#000000"
        }
    }
}).then(container => {
    console.log("tsParticles loaded successfully");

    // Particles initialized once - no dynamic updates or refresh calls

}).catch(error => {
    console.error("Error loading tsParticles:", error);
});

function getMenuTree() {
    const stored = localStorage.getItem('menuTree');
    if (stored) { try { return JSON.parse(stored); } catch {} }
    return [
        { id: 'home', title: 'Home' },
        {
            id: 'projects', title: 'Projects',
            children: [
                { id: 'projects-frankybird', title: 'FrankyBird' },
                { id: 'projects-shooter', title: 'Shooter' },
                { id: 'projects-zlap', title: 'Zlap' }
            ]
        },
        {
            id: 'websites', title: 'Websites',
            children: [
                { id: 'websites-dedenkarbeider', title: 'Dedenkarbeider' },
                { id: 'websites-klispoel', title: 'Klispoel' }
            ]
        },
        { id: 'home-assistant', title: 'Home Assistant' },
        { id: 'info', title: 'Info' },
        { id: 'editor', title: 'Editor' }
    ];
}

function applyMenuOrder() {
    const tree = getMenuTree();
    const menuList = document.querySelector('.menu-list');
    if (!menuList) return;
    const lis = Array.from(menuList.querySelectorAll(':scope > li'));
    const ordered = [];
    tree.forEach(item => {
        const li = lis.find(el => el.querySelector(`[data-page="${item.id}"]`));
        if (li) ordered.push(li);
    });
    lis.forEach(li => { if (!ordered.includes(li)) ordered.push(li); });
    ordered.forEach(li => menuList.appendChild(li));
}

function initSubmenu() {
    const submenuEl = document.getElementById('submenu');
    if (!submenuEl || submenuEl.dataset.initialized) return;
    submenuEl.dataset.initialized = 'true';

    document.querySelector('.side-menu')?.addEventListener('click', (e) => {
        const item = e.target.closest('.menu-item');
        if (!item) return;
        const pageId = item.dataset.page;
        const tree = getMenuTree();
        const node = tree.find(n => n.id === pageId);
        if (node?.children?.length) {
            if (submenuEl.dataset.parent === pageId && submenuEl.style.display !== 'none') {
                submenuEl.style.display = 'none';
                submenuEl.dataset.parent = '';
                return;
            }
            submenuEl.innerHTML = node.children
                .map(c => `<a class="submenu-item" data-page="${c.id}" href="#${c.id}">${c.title}</a>`)
                .join('');
            submenuEl.dataset.parent = pageId;
            const rect = item.getBoundingClientRect();
            submenuEl.style.left = (rect.left + rect.width / 2) + 'px';
            submenuEl.style.right = 'auto';
            submenuEl.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
            submenuEl.style.transform = 'translateX(-50%)';
            submenuEl.style.display = 'flex';
        } else {
            submenuEl.style.display = 'none';
            submenuEl.dataset.parent = '';
        }
    });

    submenuEl.addEventListener('click', (e) => {
        const item = e.target.closest('.submenu-item');
        if (!item) return;
        e.preventDefault();
        submenuEl.style.display = 'none';
        submenuEl.dataset.parent = '';
        window.location.hash = item.dataset.page;
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.side-menu') && !e.target.closest('#submenu')) {
            submenuEl.style.display = 'none';
        }
    }, true);
}

document.addEventListener('DOMContentLoaded', () => {
    const titleEl = document.querySelector('.main-title');
    applyMenuOrder();
    initSubmenu();

    let pageEls = Array.from(document.querySelectorAll('.page'));
    const menuItems = Array.from(document.querySelectorAll('.menu-item'));
    const menuEl = document.querySelector('.side-menu');
    const centerEl = document.querySelector('.center-content');

    if (!titleEl) return;

    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const rand = (min, max) => min + Math.random() * (max - min);

    const isMobile = (() => {
        const mq = window.matchMedia?.('(max-width: 768px)');
        if (mq && mq.matches) return true;
        if ((navigator.maxTouchPoints || 0) > 0) return true;
        return window.innerWidth <= 768;
    })();

    const splitText = (text) => {
        const normalized = (text ?? '').replace(/\s+/g, ' ').trimEnd();
        return Array.from(normalized);
    };

    const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let activeScrambleStops = [];
    const activeScrambles = new Map();

    const startScrambleTicker = (scrambleEl, { updateMs = 55 } = {}) => {
        if (!scrambleEl) return () => {};
        activeScrambles.set(scrambleEl, { updateMs, lastUpdate: -Infinity });
        return () => {
            activeScrambles.delete(scrambleEl);
            scrambleEl.textContent = '';
        };
    };

    const createLetterWrap = (ch, introDelayMs = null) => {
        const wrap = document.createElement('span');
        wrap.className = 'letter-wrap';

        const letter = document.createElement('span');
        letter.className = 'letter' + (ch === ' ' ? ' letter-space' : '');

        const charEl = document.createElement('span');
        charEl.className = 'letter-char';
        charEl.textContent = ch === ' ' ? '\u00A0' : ch;

        const scrambleEl = document.createElement('span');
        scrambleEl.className = 'letter-scramble';
        scrambleEl.textContent = '';

        if (typeof introDelayMs === 'number') {
            letter.style.animation = `letterIn 900ms cubic-bezier(0.2, 0.9, 0.2, 1) ${introDelayMs}ms forwards`;
            letter.addEventListener('animationend', () => {
                letter.style.opacity = '1';
            }, { once: true });
        } else {
            letter.style.opacity = '1';
        }

        letter.appendChild(charEl);
        letter.appendChild(scrambleEl);
        wrap.appendChild(letter);
        return { wrap, letter, charEl, scrambleEl };
    };

    // Cache character widths to stabilize spacing during morphs
    const __charWidthCache = new Map();
    const measureCharWidth = (ch) => {
        const key = ch || '\u00A0';
        if (__charWidthCache.has(key)) return __charWidthCache.get(key);
        const probeWrap = document.createElement('span');
        probeWrap.className = 'letter-wrap';
        const probe = document.createElement('span');
        probe.className = 'letter';
        const probeChar = document.createElement('span');
        probeChar.className = 'letter-char';
        probeChar.textContent = key;
        probe.appendChild(probeChar);
        probeWrap.appendChild(probe);
        probeWrap.style.position = 'absolute';
        probeWrap.style.visibility = 'hidden';
        probeWrap.style.pointerEvents = 'none';
        probeWrap.style.whiteSpace = 'pre';
        titleEl.appendChild(probeWrap);
        const w = probeWrap.getBoundingClientRect().width;
        probeWrap.remove();
        __charWidthCache.set(key, w);
        return w;
    };

    let titleWraps = [];
    let titleLetters = [];

    const buildTitle = (text, { intro = false } = {}) => {
        if (isMobile) {
            titleEl.textContent = text || '';
            titleWraps = [];
            titleLetters = [];
            return;
        }
        const chars = splitText(text);
        titleEl.textContent = '';
        titleWraps = [];
        titleLetters = [];

        for (let i = 0; i < chars.length; i++) {
            const delay = intro ? (i * 22 + rand(0, 35)) : null;
            const { wrap, letter } = createLetterWrap(chars[i], delay);
            titleEl.appendChild(wrap);
            titleWraps.push(wrap);
            titleLetters.push(letter);
        }
    };

    const animateExitClone = (wrapEl) => {
        const rect = wrapEl.getBoundingClientRect();
        const clone = wrapEl.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.margin = '0';
        clone.style.pointerEvents = 'none';
        clone.style.zIndex = '4';
        clone.style.opacity = '1';
        clone.style.transform = 'translate3d(0, 0, 0)';
        clone.style.transition = 'transform 450ms ease, opacity 450ms ease';
        document.body.appendChild(clone);

        requestAnimationFrame(() => {
            clone.style.opacity = '0';
            clone.style.transform = 'translate3d(0, -10px, 0)';
        });

        window.setTimeout(() => {
            clone.remove();
        }, 520);
    };

    let activeMorphToken = 0;
    let activeMorphRaf = 0;

    const morphTitleTo = (newTitle, { firstRectsOverride = null } = {}) => {
        // New simple morph: per-letter scramble to target, no opacity/blur
        if (window.innerWidth <= 768) {
            activeMorphToken += 1;
            cancelAnimationFrame(activeMorphRaf);
            for (const stop of activeScrambleStops) stop();
            activeScrambleStops = [];
            titleEl.textContent = newTitle || '';
            return;
        }

        activeMorphToken += 1;
        const token = activeMorphToken;

        cancelAnimationFrame(activeMorphRaf);
        for (const stop of activeScrambleStops) stop();
        activeScrambleStops = [];

        const oldWraps = Array.from(titleEl.querySelectorAll('.letter-wrap'));
        const oldLen = oldWraps.length;
        const newChars = splitText(newTitle);

        // Fade out excess wraps with stagger instead of removing immediately
        if (oldLen > newChars.length) {
            const fadeOutDuration = 320;
            const fadeOutStagger = 45;
            for (let i = newChars.length; i < oldLen; i++) {
                const wrap = oldWraps[i];
                const letter = wrap.querySelector('.letter');
                if (letter) {
                    const delayOffset = (i - newChars.length) * fadeOutStagger;
                    letter.style.transition = `opacity ${fadeOutDuration}ms ease-out`;
                    setTimeout(() => {
                        if (token === activeMorphToken) {
                            letter.style.opacity = '0';
                        }
                    }, delayOffset);
                    setTimeout(() => {
                        if (token === activeMorphToken) {
                            wrap.remove();
                        }
                    }, delayOffset + fadeOutDuration);
                }
            }
        }

        // Ensure enough wraps for new text
        const afterTrimWraps = Array.from(titleEl.querySelectorAll('.letter-wrap'));
        for (let i = afterTrimWraps.length; i < newChars.length; i++) {
            const { wrap } = createLetterWrap(' ', null);
            titleEl.appendChild(wrap);
        }

        const finalWraps = Array.from(titleEl.querySelectorAll('.letter-wrap'));
        // Clear any previous width locks before starting
        finalWraps.forEach((w) => { w.style.width = ''; });

        // Remove title scale animation to avoid any global shift
        try {
            titleEl.style.transform = 'scale(1)';
        } catch (e) { /* noop */ }

        // Per-letter alphabet glide to target with stagger and ease-in-out timing
        const minDelay = 60;     // minimal delay between steps (fastest in middle)
        const extraDelay = 200;  // additional delay applied near the ends
        const staggerMs = 90;    // start delay per index to avoid all starting at once

        // Reduce letter transitions for longer titles
        const titleLen = newChars.length;
        const stepReduction = titleLen > 14 ? 0.35 : titleLen > 10 ? 0.55 : titleLen > 7 ? 0.75 : 1;

        const ALPHA_LOWER = 'abcdefghijklmnopqrstuvwxyz';
        const ALPHA_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const DIGITS = '0123456789';

        const pickSetFor = (ch) => {
            if (ALPHA_LOWER.includes(ch)) return ALPHA_LOWER;
            if (ALPHA_UPPER.includes(ch)) return ALPHA_UPPER;
            if (DIGITS.includes(ch)) return DIGITS;
            return null;
        };

        let pending = 0;
        finalWraps.forEach((wrap, i) => {
            if (token !== activeMorphToken) return;
            const letter = wrap.querySelector('.letter');
            const charEl = wrap.querySelector('.letter-char');
            const current = (charEl && charEl.textContent) ? charEl.textContent : ' ';
            const target = newChars[i] === undefined ? '\u00A0' : (newChars[i] === ' ' ? '\u00A0' : newChars[i]);

            if (letter) letter.style.opacity = '1';
            // Smooth width adjustments
            wrap.style.transition = 'width 140ms ease';

            // Spaces or identical chars: no animation
            if (target === '\u00A0' || current === target) {
                if (charEl) charEl.textContent = target;
                // Lock to stable width (current/target) just in case
                const wLock = measureCharWidth(target);
                wrap.style.width = `${wLock.toFixed(2)}px`;
                return;
            }

            const set = pickSetFor(target);
            if (!set) {
                // Non-alphanumeric: set directly after small stagger
                wrap.style.width = `${measureCharWidth(current).toFixed(2)}px`;
                setTimeout(() => {
                    if (token === activeMorphToken && charEl) {
                        charEl.textContent = target;
                        // switch lock to exact target width until finalize cleanup
                        wrap.style.width = `${measureCharWidth(target).toFixed(2)}px`;
                    }
                }, i * staggerMs);
                return;
            }

            let startIdx = set.indexOf(current);
            if (startIdx < 0) {
                // Start from first character of the target's set
                startIdx = 0;
            }
            const targetIdx = set.indexOf(target);
            // Apply step reduction for longer titles to make animation faster
            const rawSteps = (targetIdx - startIdx + set.length) % set.length;
            const steps = Math.max(1, Math.round(rawSteps * stepReduction));

            // Staggered start per index
            setTimeout(() => {
                if (token !== activeMorphToken) return;
                pending += 1;
                // Start width at current char width; update every step to glide size too
                wrap.style.width = `${measureCharWidth(current).toFixed(2)}px`;
                let count = 0;
                let idx = startIdx;
                const stepOnce = () => {
                    if (token !== activeMorphToken) { return; }
                    if (count >= steps) {
                        charEl.textContent = target;
                        // switch lock to exact target width until finalize cleanup
                        wrap.style.width = `${measureCharWidth(target).toFixed(2)}px`;
                        pending -= 1;
                        return;
                    }
                    idx = (idx + 1) % set.length;
                    charEl.textContent = set[idx];
                    // Update width to current stepped character
                    wrap.style.width = `${measureCharWidth(set[idx]).toFixed(2)}px`;
                    count += 1;
                    const f = count / Math.max(1, steps); // 0..1
                    const delay = minDelay + extraDelay * (4 * Math.pow(f - 0.5, 2)); // slow->fast->slow
                    setTimeout(stepOnce, delay);
                };
                stepOnce();
            }, i * staggerMs);
        });

        // Rebuild motion state after DOM updates so idle motion stays coherent
        titleEl.offsetWidth;
        rebuildMotionState();
        requestAnimationFrame(() => {
            computeLetterNormals();
            for (const d of letterData) {
                if (Number.isFinite(d.tnx)) d.nx = d.tnx;
                if (Number.isFinite(d.tny)) d.ny = d.tny;
            }
        });

        // Note: we keep per-letter wrap widths locked to their final measured value.
        // On the next morph start, we clear widths before animating, so there is no visible jump.
    };

    const updateHomeCenterShift = () => {
        if (isMobile) {
            document.body.style.setProperty('--home-center-shift', '0px');
            return;
        }
        const isHome = document.body.classList.contains('is-home');

        if (!isHome) {
            document.body.style.setProperty('--home-center-shift', '0px');
            return;
        }

        const getTranslateY = (el) => {
            if (!el) return 0;
            const t = window.getComputedStyle(el).transform;
            if (!t || t === 'none') return 0;

            const m3 = t.match(/^matrix3d\((.+)\)$/);
            if (m3) {
                const parts = m3[1].split(',').map((p) => parseFloat(p.trim()));
                return Number.isFinite(parts[13]) ? parts[13] : 0;
            }

            const m2 = t.match(/^matrix\((.+)\)$/);
            if (m2) {
                const parts = m2[1].split(',').map((p) => parseFloat(p.trim()));
                return Number.isFinite(parts[5]) ? parts[5] : 0;
            }

            return 0;
        };

        const titleRect = titleEl.getBoundingClientRect();
        const currentCenterY = titleRect.top + titleRect.height / 2;

        const desiredCenterY = window.innerHeight / 2;
        const delta = clamp(desiredCenterY - currentCenterY, -window.innerHeight, window.innerHeight);

        const currentShiftY = getTranslateY(centerEl);
        const nextShiftY = clamp(currentShiftY + delta, -window.innerHeight, window.innerHeight);
        document.body.style.setProperty('--home-center-shift', `${nextShiftY.toFixed(2)}px`);
    };

    const setActivePage = (pageId) => {
        for (const el of pageEls) {
            el.hidden = (el.dataset.page !== pageId);
        }
    };

    const resetPageSlideState = () => {
        if (!pageContainerEl) return;
        pageContainerEl.classList.remove('is-transitioning');
        for (const el of pageEls) {
            el.classList.remove('page-slide-in', 'page-slide-out', 'page-slide-play');
        }
    };

    const PAGE_SLIDE_DURATION_MS = 2000;

    let pageTransitionToken = 0;
    const runPageSlideTransition = (prevPageId, nextPageId) => {
        if (!pageContainerEl) {
            setActivePage(nextPageId);
            return;
        }

        pageContainerEl.style.setProperty('--page-slide-duration', `${PAGE_SLIDE_DURATION_MS}ms`);
        pageContainerEl.style.setProperty('--page-slide-top', window.getComputedStyle(pageContainerEl).paddingTop || '0px');

        const currentEl = pageEls.find((p) => p.dataset.page === prevPageId);
        const nextEl = pageEls.find((p) => p.dataset.page === nextPageId);
        if (!nextEl) {
            setActivePage(nextPageId);
            return;
        }

        if (!currentEl || currentEl === nextEl) {
            setActivePage(nextPageId);
            return;
        }

        const token = ++pageTransitionToken;

        currentEl.classList.remove('page-slide-in', 'page-slide-out', 'page-slide-play');
        nextEl.classList.remove('page-slide-in', 'page-slide-out', 'page-slide-play');

        // Zet slide richting VOORDAT we classes toevoegen
        setPageSlideVector(prevPageId, nextPageId);

        currentEl.hidden = false;
        nextEl.hidden = false;

        // Forceer browser reflow zodat CSS variabelen worden toegepast
        void pageContainerEl.offsetWidth;

        currentEl.classList.add('page-slide-out');
        nextEl.classList.add('page-slide-in');
        pageContainerEl.classList.add('is-transitioning');

        // Dubbele RAF voor betrouwbare animatie start
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (token !== pageTransitionToken) return;
                currentEl.classList.add('page-slide-play');
                nextEl.classList.add('page-slide-play');
            });
        });

        window.setTimeout(() => {
            if (token !== pageTransitionToken) return;
            setActivePage(nextPageId);
            currentEl.classList.remove('page-slide-out', 'page-slide-play');
            nextEl.classList.remove('page-slide-in', 'page-slide-play');
            pageContainerEl.classList.remove('is-transitioning');
        }, PAGE_SLIDE_DURATION_MS + 120);
    };

    const refreshPageEls = () => {
        pageEls = Array.from(document.querySelectorAll('.page'));
    };

    const pageTitleOverrides = new Map();
    const detailOrderIndex = new Map();

    const getMenuPageFor = (pageId) => {
        if (typeof pageId !== 'string') return 'home';
        if (pageId.startsWith('projects-')) return 'projects';
        if (pageId.startsWith('websites-')) return 'websites';
        return pageId;
    };

    const menuOrderIndex = new Map(menuItems.map((m, i) => [m.dataset.page, i]));

    // tsParticles background is now perfectly fixed via CSS - no transforms needed

    const getPageDepth = (pageId) => {
        if (typeof pageId !== 'string') return 0;
        if (pageId.startsWith('projects-')) return 1;
        if (pageId.startsWith('websites-')) return 1;
        return 0;
    };

    const setPageSlideVector = (prevPageId, nextPageId) => {
        if (!pageContainerEl) return;

        const AMP_X = '100vw';
        const AMP_Y = '140vh';
        const signed = (amp, sign) => `${sign < 0 ? '-' : ''}${amp}`;

        const prevMenu = getMenuPageFor(prevPageId);
        const nextMenu = getMenuPageFor(nextPageId);
        const prevDepth = getPageDepth(prevPageId);
        const nextDepth = getPageDepth(nextPageId);

        let axis = 'x';
        let sign = 1;

        if (prevMenu === nextMenu && prevDepth !== nextDepth) {
            axis = 'y';
            sign = nextDepth > prevDepth ? -1 : 1;
        } else if (prevMenu === nextMenu && prevDepth === 1 && nextDepth === 1) {
            const prevIdx = detailOrderIndex.get(prevPageId);
            const nextIdx = detailOrderIndex.get(nextPageId);
            if (Number.isFinite(prevIdx) && Number.isFinite(nextIdx) && prevIdx !== nextIdx) {
                axis = 'y';
                sign = nextIdx > prevIdx ? -1 : 1;
            }
        } else {
            const prevI = menuOrderIndex.get(prevMenu) ?? 0;
            const nextI = menuOrderIndex.get(nextMenu) ?? 0;
            sign = nextI > prevI ? -1 : 1;
            axis = 'x';
        }

        if (axis === 'x') {
            pageContainerEl.style.setProperty('--page-slide-in-x', signed(AMP_X, -sign));
            pageContainerEl.style.setProperty('--page-slide-in-y', '0px');
            pageContainerEl.style.setProperty('--page-slide-out-x', signed(AMP_X, sign));
            pageContainerEl.style.setProperty('--page-slide-out-y', '0px');
            return;
        }

        pageContainerEl.style.setProperty('--page-slide-in-x', '0px');
        pageContainerEl.style.setProperty('--page-slide-in-y', signed(AMP_Y, -sign));
        pageContainerEl.style.setProperty('--page-slide-out-x', '0px');
        pageContainerEl.style.setProperty('--page-slide-out-y', signed(AMP_Y, sign));
    };

    const setActiveMenu = (pageId) => {
        const menuPage = getMenuPageFor(pageId);
        for (const item of menuItems) {
            item.classList.toggle('is-active', item.dataset.page === menuPage);
        }
    };

    const getTitleForPage = (pageId) => {
        const overridden = pageTitleOverrides.get(pageId);
        if (overridden) return overridden;
        const item = menuItems.find((m) => m.dataset.page === pageId);
        return (item?.dataset.title || item?.textContent || '').trim() || 'RedubbledD.com';
    };

    const getPageFromHash = () => {
        const raw = (window.location.hash || '').replace('#', '').trim();
        const pageId = raw || 'home';
        return pageEls.some((p) => p.dataset.page === pageId) ? pageId : 'home';
    };

    let activePage = null;
    let ignoreNextHashChange = false;

    const navigateTo = (pageId, { morph = true, updateHash = false } = {}) => {
        if (activePage === pageId) return;

        resetPageSlideState();

        const prevPage = activePage;
        activePage = pageId;

        document.body.classList.toggle('is-home', pageId === 'home');
        document.body.classList.toggle('is-info', pageId === 'info');

        const canSlide = !!prevPage && prevPage !== 'home' && pageId !== 'home' && !document.body.classList.contains('is-booting');
        const ENABLE_PAGE_SLIDE = false;
        if (ENABLE_PAGE_SLIDE && canSlide) runPageSlideTransition(prevPage, pageId);
        else setActivePage(pageId);

        setActiveMenu(pageId);

        // Background navigation effects removed - background is now perfectly fixed

        const title = getTitleForPage(pageId);
        if (morph) morphTitleTo(title);
        else buildTitle(title, { intro: true });

        requestAnimationFrame(() => {
            updateHomeCenterShift();
            if (typeof measureMenuCenters === 'function') {
                measureMenuCenters();
                window.setTimeout(() => {
                    measureMenuCenters();
                }, 1640);
            }
        });

        if (updateHash) {
            ignoreNextHashChange = true;
            window.location.hash = `#${pageId}`;
            window.setTimeout(() => {
                ignoreNextHashChange = false;
            }, 0);
        }
    };

    const pageContainerEl = document.querySelector('.page-container');

    const slugify = (s) => {
        return String(s || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-+|-+$)/g, '');
    };

    const portfolio = {
        projects: [
            {
                id: 'frankybird',
                title: 'FrankyBird',
                isGame: true,
                gameFile: '/Games/FrankyBird/FrankyBird.swf',
                images: [
                    "img's/Projects/FrankyBird/frankybird v0.1.png",
                    "img's/Projects/FrankyBird/frankybirdv0.2.png"
                ]
            },
            {
                id: 'shooter',
                title: 'Shooter',
                isGame: true,
                gameFile: '/Games/Shooter/Shooter.swf',
                images: [
                    "img's/Projects/Shooter/shooter1.jpg",
                    "img's/Projects/Shooter/shooter2.png",
                    "img's/Projects/Shooter/shooterOld.png"
                ]
            },
            {
                id: 'zlap',
                title: 'Zlap',
                images: [
                    "img's/Projects/Zlap/Zlap.botz.png"
                ]
            }
        ],
        websites: [
            {
                id: 'dedenkarbeider',
                title: 'Dedenkarbeider',
                websiteUrl: 'https://dedenkarbeider.nl/',
                images: [
                    "img's/Sites/Dedenkarbeider/cobanHome.png",
                    "img's/Sites/Dedenkarbeider/coban1.jpg"
                ]
            },
            {
                id: 'klispoel',
                title: 'Klispoel',
                websiteUrl: 'https://www.klispoel.nl/',
                images: [
                    "img's/Sites/Klispoel/home.png",
                    "img's/Sites/Klispoel/waterkers.png"
                ]
            }
        ]
    };

    window.pageContent = window.pageContent || {};

    const loadScriptTag = (src) => {
        return new Promise((resolve) => {
            const el = document.createElement('script');
            el.src = src;
            el.async = false;
            el.onload = () => resolve(true);
            el.onerror = () => resolve(false);
            document.head.appendChild(el);
        });
    };

    const loadContentScript = async (pageId) => {
        const base = `content/${pageId}.js`;
        const cb = `${base}?v=${Date.now()}`;
        const ok = await loadScriptTag(cb);
        if (ok) return true;
        return await loadScriptTag(base);
    };

    const renderSimplePage = (pageId) => {
        const section = pageEls.find((p) => p.dataset.page === pageId);
        if (!section) return;
        
        // Check localStorage first for editor-saved content, then fallback to window.pageContent
        let html = localStorage.getItem(`pageContent_${pageId}`);
        if (!html && window.pageContent && typeof window.pageContent[pageId] === 'string') {
            html = window.pageContent[pageId];
        }
        
        section.innerHTML = html || '';
    };

    const renderSiteNotice = () => {
        const noticeEl = document.querySelector('.site-notice');
        if (!noticeEl) return;
        
        // Check localStorage first for editor-saved content, then fallback to window.pageContent
        let html = localStorage.getItem('pageContent_home');
        if (!html && window.pageContent && typeof window.pageContent.home === 'string') {
            html = window.pageContent.home;
        }
        
        if (!html) return;
        noticeEl.innerHTML = html;
    };

    const DEFAULT_DETAIL_HTML = '<p>Test tekst: hier komt straks een korte beschrijving van het project/website, de gebruikte technieken en wat de bedoeling was.</p><p>Test tekst: dit is een tweede alinea om te laten zien hoe langere content eruit ziet op de detailpagina.</p>';

    const ensureDetailPage = ({ pageId, title, images, gameFile, websiteUrl, backToPageId, backToLabel }) => {
        if (!pageContainerEl) return;
        if (pageEls.some((p) => p.dataset.page === pageId)) return;

        const section = document.createElement('section');
        section.className = 'page';
        section.dataset.page = pageId;
        section.hidden = true;

        const detail = document.createElement('div');
        detail.className = 'portfolio-detail';

        const back = document.createElement('a');
        back.className = 'portfolio-back';
        back.href = `#${backToPageId}`;
        back.textContent = backToLabel;
        back.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(backToPageId, { morph: true, updateHash: true });
        });

        detail.appendChild(back);

        if (gameFile) {
            const gameContainer = document.createElement('div');
            gameContainer.className = 'game-container';
            gameContainer.style.width = '100%';
            gameContainer.style.maxWidth = '900px';
            gameContainer.style.margin = '2rem auto';
            gameContainer.style.borderRadius = '14px';
            gameContainer.style.overflow = 'hidden';
            gameContainer.style.border = '1px solid rgba(255, 255, 255, 0.10)';
            gameContainer.style.background = 'rgba(0, 0, 0, 0.5)';

            // Game-specific sizing
            if (pageId.includes('frankybird')) {
                gameContainer.style.width = '500px';
                gameContainer.style.height = '667px';
                gameContainer.style.margin = '2rem auto';
            } else if (pageId.includes('shooter')) {
                gameContainer.style.width = '925px';
                gameContainer.style.height = '650px';
                gameContainer.style.margin = '2rem auto';
            }

            const embed = document.createElement('embed');
            embed.src = gameFile;
            embed.type = 'application/x-shockwave-flash';
            embed.width = '100%';
            embed.height = '100%';
            embed.style.display = 'block';

            gameContainer.appendChild(embed);
            detail.appendChild(gameContainer);

            // Auto-load game by clicking on the game container (external click)
            // This triggers Ruffle's click handler on the embed
            setTimeout(() => {
                try {
                    const rect = gameContainer.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    // Create and dispatch click event on the game container
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        clientX: centerX,
                        clientY: centerY
                    });

                    gameContainer.dispatchEvent(clickEvent);
                } catch (e) {
                    // Silently fail if click doesn't work
                }
            }, 3000);
        }

        // Always show gallery/images (for both games and regular projects)
        const gallery = document.createElement('div');
        gallery.className = 'portfolio-gallery';

        for (const srcRaw of images || []) {
            let imageElement;

            if (websiteUrl) {
                // Wrap image in a link for websites
                const link = document.createElement('a');
                link.href = websiteUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.style.cursor = 'pointer';

                const img = document.createElement('img');
                img.src = encodeURI(srcRaw);
                img.alt = title;
                img.loading = 'lazy';
                img.decoding = 'async';
                img.style.cursor = 'pointer';

                link.appendChild(img);
                imageElement = link;
            } else {
                // Regular image for projects
                const img = document.createElement('img');
                img.src = encodeURI(srcRaw);
                img.alt = title;
                img.loading = 'lazy';
                img.decoding = 'async';
                imageElement = img;
            }

            gallery.appendChild(imageElement);
        }

        if (images && images.length > 0) {
            detail.appendChild(gallery);
        }

        const text = document.createElement('div');
        text.className = 'portfolio-text';
        const customHtml = localStorage.getItem(`pageContent_${pageId}`) || (window.pageContent && typeof window.pageContent[pageId] === 'string' ? window.pageContent[pageId] : '');
        text.innerHTML = customHtml || DEFAULT_DETAIL_HTML;

        detail.appendChild(text);
        section.appendChild(detail);
        pageContainerEl.appendChild(section);

        pageTitleOverrides.set(pageId, title);
    };

    const renderOverview = ({ pageId, heading, items }) => {
        const section = pageEls.find((p) => p.dataset.page === pageId);
        if (!section) return;

        section.textContent = '';

        const wrap = document.createElement('div');
        wrap.className = 'portfolio-overview';

        // Only add intro content from window.pageContent, NOT a separate h2 heading
        // The intro content is displayed in portfolio-text, no duplicate heading needed
        const introHtml = localStorage.getItem(`pageContent_${pageId}`) || (window.pageContent && typeof window.pageContent[pageId] === 'string' ? window.pageContent[pageId] : '');
        if (introHtml) {
            const intro = document.createElement('div');
            intro.className = 'portfolio-text';
            intro.innerHTML = introHtml;
            wrap.appendChild(intro);
        }

        const grid = document.createElement('div');
        grid.className = 'portfolio-grid';

        for (const it of items) {
            const card = document.createElement('a');
            card.className = 'portfolio-card';
            card.href = `#${it.pageId}`;

            const img = document.createElement('img');
            img.className = 'portfolio-thumb';
            img.src = encodeURI(it.preview);
            img.alt = it.title;
            img.loading = 'lazy';
            img.decoding = 'async';

            const name = document.createElement('div');
            name.className = 'portfolio-name';
            name.textContent = it.title;

            card.appendChild(img);
            card.appendChild(name);
            card.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(it.pageId, { morph: true, updateHash: true });
            });

            grid.appendChild(card);
        }

        wrap.appendChild(grid);
        section.appendChild(wrap);
    };

    // NOTE: renderOverview creates portfolio cards with titles from items array.
    // The heading (h2) is created ONCE at the top. Card titles come from it.title only.
    // Do NOT add heading text to cards - they should only show individual item titles.
    // If duplicate titles appear, check that heading is not being added to card names.

    const buildPortfolioPages = () => {
        const projectItems = portfolio.projects.map((p) => {
            const pageId = `projects-${slugify(p.id || p.title)}`;
            ensureDetailPage({
                pageId,
                title: p.title,
                images: p.images,
                gameFile: p.gameFile,
                backToPageId: 'projects',
                backToLabel: 'Back to Projects'
            });
            return {
                pageId,
                title: p.title,
                preview: (p.images && p.images[0]) ? p.images[0] : ''
            };
        });

        const websiteItems = portfolio.websites.map((w) => {
            const pageId = `websites-${slugify(w.id || w.title)}`;
            ensureDetailPage({
                pageId,
                title: w.title,
                images: w.images,
                websiteUrl: w.websiteUrl,
                backToPageId: 'websites',
                backToLabel: 'Back to Websites'
            });
            return {
                pageId,
                title: w.title,
                preview: (w.images && w.images[0]) ? w.images[0] : ''
            };
        });

        refreshPageEls();

        renderOverview({
            pageId: 'projects',
            heading: 'Projects',
            items: projectItems
        });

        renderOverview({
            pageId: 'websites',
            heading: 'Websites',
            items: websiteItems
        });
    };


    let menuHideY = 0;
    let menuHideYTarget = 0;

    if (isMobile) {
        document.body.style.setProperty('--menu-hide-y', '0px');
        if (menuEl) menuEl.classList.remove('is-hidden');
    }

    if (menuEl && !isMobile) {
        let lastY = window.scrollY || 0;
        let lastT = 0;

        let maxHide = 0;
        const topRevealY = 40;

        const recomputeMaxHide = () => {
            const rect = menuEl.getBoundingClientRect();
            maxHide = Math.max(0, rect.height + 80);
        };

        recomputeMaxHide();
        window.addEventListener('resize', recomputeMaxHide);

        const setHiddenState = (targetPx) => {
            const limit = maxHide || 0;
            menuHideYTarget = clamp(targetPx, 0, limit);
            menuEl.classList.toggle('is-hidden', menuHideYTarget > (limit * 0.6));
        };

        setHiddenState(0);

        const tickMenuHide = (now) => {
            const dt = Math.min(64, Math.max(0, now - lastT));
            lastT = now;

            const lerpT = 1 - Math.pow(0.0012, dt);
            menuHideY = lerp(menuHideY, menuHideYTarget, lerpT);
            document.body.style.setProperty('--menu-hide-y', `${menuHideY.toFixed(2)}px`);
            requestAnimationFrame(tickMenuHide);
        };
        requestAnimationFrame((t) => {
            lastT = t;
            tickMenuHide(t);
        });

        window.addEventListener('scroll', () => {
            const y = window.scrollY || 0;
            const dy = y - lastY;
            lastY = y;

            if (y <= topRevealY) {
                setHiddenState(0);
                return;
            }

            if (dy > 2) {
                setHiddenState(maxHide);
            } else if (dy < -2) {
                setHiddenState(0);
            }
        }, { passive: true });
    }

    for (const item of menuItems) {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            item.classList.add('is-clicked');
            window.setTimeout(() => item.classList.remove('is-clicked'), 180);

            const pageId = item.dataset.page || 'home';
            navigateTo(pageId, { morph: true, updateHash: true });
        });
    }

    window.addEventListener('hashchange', () => {
        if (ignoreNextHashChange) return;
        navigateTo(getPageFromHash(), { morph: true, updateHash: false });
    });

    let letterData = [];
    let letterByEl = new Map();

    const computeLetterNormals = () => {
        if (isMobile) return;
        if (!letterData.length) return;

        const groupRect = titleEl.getBoundingClientRect();
        const cx = groupRect.left + groupRect.width / 2;
        const cy = groupRect.top + groupRect.height / 2;
        const rx = Math.max(1, groupRect.width / 2);
        const ry = Math.max(1, groupRect.height / 2);

        for (const d of letterData) {
            const rect = d.el.getBoundingClientRect();
            const sx = rect.left + rect.width / 2;
            const sy = rect.top + rect.height / 2;

            const dx = (sx - cx) / rx;
            const dy = (sy - cy) / ry;

            d.tnx = clamp(dx, -1, 1);
            d.tny = clamp(dy, -1, 1);
            if (!Number.isFinite(d.nx)) d.nx = d.tnx;
            if (!Number.isFinite(d.ny)) d.ny = d.tny;
        }
    };

    const rebuildMotionState = () => {
        if (isMobile) return;
        const prev = letterByEl;
        titleLetters = Array.from(titleEl.querySelectorAll('.letter'));
        letterData = titleLetters.map((el, i) => {
            const existing = prev.get(el);
            if (existing) {
                return {
                    ...existing,
                    el,
                    i
                };
            }

            return {
                el,
                i,
                nx: 0,
                ny: 0,
                tnx: 0,
                tny: 0,
                depth: rand(0.85, 1.35),
                ampX: rand(2.6, 6.0),
                ampY: rand(2.6, 6.0),
                freqX: rand(0.32, 0.95),
                freqY: rand(0.32, 0.95),
                phaseX: rand(0, Math.PI * 2),
                phaseY: rand(0, Math.PI * 2),
                scaleBase: 1 + rand(-0.03, 0.06),
                scaleAmp: rand(0.012, 0.026),
                mix: 0
            };
        });

        letterByEl = new Map(letterData.map((d) => [d.el, d]));

        requestAnimationFrame(() => {
            computeLetterNormals();
        });
    };

    // Wait a tick so layout is stable (desktop only)
    if (!isMobile) {
        requestAnimationFrame(() => {
            computeLetterNormals();
        });
        window.addEventListener('resize', () => {
            computeLetterNormals();
            updateHomeCenterShift();
            measureMenuCenters();
        });
    }

    let targetMx = 0;
    let targetMy = 0;
    let mx = 0;
    let my = 0;

    const menuNodes = menuItems.map((a) => a.closest('li') || a);
    const menuData = menuNodes.map((node, i) => {
        return {
            node,
            i,
            x: 0,
            y: 0,
            baseCx: 0,
            baseCy: 0,
            ampX: rand(0.6, 2.0),
            ampY: rand(0.35, 1.35),
            freqX: rand(0.55, 1.05),
            freqY: rand(0.55, 1.05),
            phaseX: rand(0, Math.PI * 2),
            phaseY: rand(0, Math.PI * 2)
        };
    });

    const measureMenuCenters = () => {
        for (const d of menuData) {
            const rect = d.node.getBoundingClientRect();
            d.baseCx = (rect.left + rect.width / 2) - d.x;
            d.baseCy = (rect.top + rect.height / 2) - d.y;
        }
    };

    requestAnimationFrame(() => {
        measureMenuCenters();
    });

    let pointerTX = window.innerWidth / 2;
    let pointerTY = window.innerHeight / 2;
    let pointerX = pointerTX;
    let pointerY = pointerTY;
    let hasPointer = false;

    window.addEventListener('pointermove', (e) => {
        if (isMobile) return;
        pointerTX = e.clientX;
        pointerTY = e.clientY;
    });

    const isLargeScreen = window.innerWidth > 1400;
    let lastLetterUpdateFrame = 0;
    const letterUpdateInterval = isLargeScreen ? 3 : 1;

    const animate = (nowMs) => {
        if (isMobile) return;
        const t = nowMs * 0.001;

        // Lerp mouse influence so it feels smooth and subtle
        mx = lerp(mx, targetMx, 0.08);
        my = lerp(my, targetMy, 0.08);

        const mousePx = 22;
        const shouldUpdateLetters = (lastLetterUpdateFrame++ % letterUpdateInterval) === 0;

        if (shouldUpdateLetters) {
            for (const d of letterData) {
                d.mix = lerp(d.mix ?? 1, 1, 0.06);
                d.el.style.transform = `translate3d(0, 0, 0) scale(1)`;
            }
        }

        if (activeScrambles.size && !isLargeScreen) {
            for (const [el, st] of activeScrambles) {
                if (nowMs - st.lastUpdate > st.updateMs) {
                    st.lastUpdate = nowMs;
                    const idx = Math.floor(rand(0, SCRAMBLE_CHARS.length));
                    el.textContent = SCRAMBLE_CHARS[idx];
                }
            }
        }

        const maxDist = 520;

        if (!hasPointer) {
            for (const d of menuData) {
                let tx = 0;
                let ty = 0;

                if (!isLargeScreen) {
                    tx += Math.sin(t * (1.25 * d.freqX) + d.phaseX) * d.ampX;
                    ty += Math.cos(t * (1.15 * d.freqY) + d.phaseY) * d.ampY;
                }

                tx = clamp(tx, -30, 30);
                ty = clamp(ty, -20, 20);

                d.x = lerp(d.x, tx, 0.065);
                d.y = lerp(d.y, ty, 0.065);
                d.node.style.transform = `translate3d(${d.x.toFixed(2)}px, ${d.y.toFixed(2)}px, 0) scale(1)`;
            }

            requestAnimationFrame(animate);
            return;
        }

        // Smooth pointer to avoid jitter when the mouse is almost still.
        pointerX = lerp(pointerX, pointerTX, 0.14);
        pointerY = lerp(pointerY, pointerTY, 0.14);

        // On large screens, skip complex pointer tracking every other frame
        if (isLargeScreen && Math.floor(nowMs / 16) % 2 === 1) {
            requestAnimationFrame(animate);
            return;
        }

        let closest = -1;
        let second = -1;
        let closestDist = Infinity;
        let secondDist = Infinity;

        const info = menuData.map((d) => {
            const cx = d.baseCx + d.x;
            const cy = d.baseCy + d.y + menuHideY;
            const dx = pointerX - cx;
            const dy = pointerY - cy;
            const dist = Math.max(1, Math.hypot(dx, dy));

            return { d, dx, dy, dist };
        });

        for (let i = 0; i < info.length; i++) {
            const dist = info[i].dist;
            if (dist < closestDist) {
                secondDist = closestDist;
                second = closest;
                closestDist = dist;
                closest = i;
            } else if (dist < secondDist) {
                secondDist = dist;
                second = i;
            }
        }

        let attract1Mult = 1;
        let attract2Mult = 0;
        let repel2Mult = 1;

        if (closest !== -1 && second !== -1) {
            const delta = Math.max(0, secondDist - closestDist);
            const ratio = secondDist / Math.max(1, closestDist);
            const tieByDelta = clamp(1 - (delta / 140), 0, 1);
            const tieByRatio = clamp(1 - ((ratio - 1) / 0.22), 0, 1);
            const tieStrength = Math.min(tieByDelta, tieByRatio);

            // If mouse is between two items, split attraction between them.
            // When there's a clear winner: closest attracts (100%), second repels.
            attract2Mult = 0.5 * tieStrength;
            attract1Mult = 1 - attract2Mult;
            repel2Mult = 1 - tieStrength;
        }

        for (let i = 0; i < info.length; i++) {
            const { d, dx, dy, dist } = info[i];

            let tx = 0;
            let ty = 0;
            let scale = 1;

            if (hasPointer) {
                const nd = clamp(dist / maxDist, 0, 1);
                const closePow = Math.pow(1 - nd, 1.95);
                const ux = dx / dist;
                const uy = dy / dist;

                const isClosest = i === closest;
                const isSecond = i === second;

                if (isClosest) {
                    const attract = closePow * attract1Mult;
                    tx += ux * attract * 22;
                    ty += uy * attract * 12;
                    scale += attract * 0.085;
                } else if (isSecond) {
                    const attract = closePow * attract2Mult;
                    const repel = closePow * repel2Mult;

                    if (attract > 0) {
                        tx += ux * attract * 22;
                        ty += uy * attract * 12;
                        scale += attract * 0.08;
                    }

                    if (repel > 0) {
                        tx += (-ux) * repel * 18;
                        ty += (-uy) * repel * 10;
                        scale -= repel * 0.03;
                    }
                }
            }

            const driftScale = hasPointer ? 0.35 : 1;
            if (!isLargeScreen) {
                tx += Math.sin(t * (1.25 * d.freqX) + d.phaseX) * (d.ampX * driftScale);
                ty += Math.cos(t * (1.15 * d.freqY) + d.phaseY) * (d.ampY * driftScale);
            }

            tx = clamp(tx, -30, 30);
            ty = clamp(ty, -20, 20);

            d.x = lerp(d.x, tx, 0.065);
            d.y = lerp(d.y, ty, 0.065);

            const s = clamp(scale, 0.93, 1.09);
            d.node.style.transform = `translate3d(${d.x.toFixed(2)}px, ${d.y.toFixed(2)}px, 0) scale(${s.toFixed(3)})`;
        }

        requestAnimationFrame(animate);
    };

    const boot = async () => {
        window.setTimeout(() => {
            document.body.classList.remove('is-booting');
        }, 2500);

        const basePageIds = pageEls.map((p) => p.dataset.page).filter(Boolean);
        const projectPageIds = portfolio.projects.map((p) => `projects-${slugify(p.id || p.title)}`);
        const websitePageIds = portfolio.websites.map((w) => `websites-${slugify(w.id || w.title)}`);
        const contentPageIds = Array.from(new Set([...basePageIds, ...projectPageIds, ...websitePageIds]))
            .filter(pid => pid !== 'editor'); // Exclude editor page from content script loading

        for (const pid of contentPageIds) {
            await loadContentScript(pid);
        }

        buildPortfolioPages();

        renderSimplePage('home');
        renderSimplePage('home-assistant');
        renderSimplePage('info');
        renderSiteNotice();

        const pageId = getPageFromHash();
        navigateTo(pageId, { morph: false, updateHash: false });
        rebuildMotionState();

        if (document.fonts?.ready) {
            try {
                await document.fonts.ready;
            } catch {}
        }

        requestAnimationFrame(() => {
            updateHomeCenterShift();
            requestAnimationFrame(() => {
                updateHomeCenterShift();
                document.body.classList.remove('is-booting');
            });
        });

        requestAnimationFrame(animate);

        // Scroll detection: go to Projects when scrolling down on home page
        let lastScrollY = 0;
        let hasNavigatedFromHome = false;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const isScrollingDown = currentScrollY > lastScrollY;

            if (activePage === 'home' && isScrollingDown && currentScrollY > 50 && !hasNavigatedFromHome) {
                // Navigate to Projects as soon as user scrolls down
                hasNavigatedFromHome = true;
                navigateTo('projects', { morph: true, updateHash: true });
            }

            // Reset flag when back on home
            if (activePage === 'home') {
                hasNavigatedFromHome = false;
            }

            lastScrollY = currentScrollY;
        }, { passive: true });
    };

    boot();

    // Content Editor functionality - added without modifying existing code
    initializeContentEditor();
    
    // Refresh pageEls to include the editor page in the routing system
    refreshPageEls();
});

// Content Editor Implementation
function initializeContentEditor() {
    // Initialize Quill editor when editor page is accessed
    let quill = null;
let gjsEditor = null;
    let currentEditingPage = 'home';
    
    const loadSavedContent = () => {
        // Load all saved content from localStorage into window.pageContent
        const pages = ['home', 'projects', 'websites', 'home-assistant', 'info', 'projects-frankybird', 'projects-shooter', 'websites-dedenkarbeider', 'websites-klispoel'];
        
        pages.forEach(pageId => {
            const savedContent = localStorage.getItem(`pageContent_${pageId}`);
            if (savedContent) {
                if (!window.pageContent) {
                    window.pageContent = {};
                }
                window.pageContent[pageId] = savedContent;
            }
        });
    };
    
    // Load saved content from localStorage on page load
    loadSavedContent();
    
    const initGrapesEditor = () => {
        if (!window.grapesjs) return;
        if (gjsEditor) return;

        const editor = grapesjs.init({
            container: '#gjs',
            height: '100vh',
            storageManager: false,
            components: `
                <section style="padding:40px; color:white;">
                    <h1>Test Editor</h1>
                    <p>Als je dit ziet werkt alles</p>
                </section>
            `
        });

        editor.BlockManager.add('section', {
            label: 'Section',
            content: `<section style="padding:40px;"><h2>Section</h2><p>Text...</p></section>`
        });

        editor.BlockManager.add('text', {
            label: 'Text',
            content: '<p>Double click to edit text</p>'
        });

        editor.BlockManager.add('image', {
            label: 'Image',
            content: '<img src="https://via.placeholder.com/300" style="max-width:100%;"/>'
        });

        editor.BlockManager.add('button', {
            label: 'Button',
            content: `<button style="padding:10px 20px;">Klik</button>`
        });

        editor.BlockManager.add('2-columns', {
            label: '2 Col',
            content: `<div style="display:flex;gap:10px"><div style="flex:1"><p>Kolom 1</p></div><div style="flex:1"><p>Kolom 2</p></div></div>`
        });

        editor.BlockManager.add('3-columns', {
            label: '3 Col',
            content: `<div style="display:flex;gap:10px"><div style="flex:1"><p>Kolom 1</p></div><div style="flex:1"><p>Kolom 2</p></div><div style="flex:1"><p>Kolom 3</p></div></div>`
        });

        function insertAtCursor(content) {
            const sel = editor.getSelected();
            if (sel && sel.components) {
                sel.append(content);
            } else {
                editor.getWrapper().append(content);
            }
        }

        editor.Panels.addButton('options', {
            id: 'file-browser',
            label: 'FILES',
            command: async () => {
                const [imgFiles, swfFiles] = await Promise.all([
                    fetch('/api/files').then(r => r.json()).catch(() => []),
                    fetch('/api/swf').then(r => r.json()).catch(() => [])
                ]);
                const all = [
                    ...imgFiles.map(f => ({ path: f, label: f.split('/').pop(), isSwf: false })),
                    ...swfFiles.map(f => ({ path: `/Games/${f}`, label: f.split('/').pop(), isSwf: true }))
                ];
                if (!all.length) { alert('Geen bestanden gevonden.'); return; }

                const overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99998;';

                const modal = document.createElement('div');
                modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a1a;border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:20px;z-index:99999;width:380px;max-width:90vw;max-height:70vh;display:flex;flex-direction:column;gap:10px;';

                const header = document.createElement('div');
                header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;flex-shrink:0;';
                const modalTitle = document.createElement('strong');
                modalTitle.textContent = 'Bestanden';
                modalTitle.style.color = '#fff';
                const closeBtn = document.createElement('button');
                closeBtn.textContent = '\u2715';
                closeBtn.style.cssText = 'background:none;border:none;color:#fff;cursor:pointer;font-size:1rem;';
                closeBtn.onclick = () => overlay.remove();
                header.appendChild(modalTitle);
                header.appendChild(closeBtn);

                const fileList = document.createElement('div');
                fileList.style.cssText = 'overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:4px;';

                all.forEach(({ path, label, isSwf }) => {
                    const item = document.createElement('div');
                    item.style.cssText = 'padding:6px 10px;cursor:pointer;border-radius:4px;color:#fff;font-size:0.85rem;background:rgba(255,255,255,0.05);word-break:break-all;';
                    item.textContent = (isSwf ? '\uD83C\uDFAE ' : '\uD83D\uDDBC ') + label;
                    item.onmouseenter = () => { item.style.background = 'rgba(255,0,0,0.2)'; };
                    item.onmouseleave = () => { item.style.background = 'rgba(255,255,255,0.05)'; };
                    item.onclick = () => {
                        if (path.endsWith('.swf')) {
                            insertAtCursor(`<embed src="${path}" width="600" height="400">`);
                        } else {
                            insertAtCursor(`<img src="${path}" />`);
                        }
                        overlay.remove();
                    };
                    fileList.appendChild(item);
                });

                modal.appendChild(header);
                modal.appendChild(fileList);
                overlay.appendChild(modal);
                overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
                document.body.appendChild(overlay);
            }
        });

        editor.Commands.add('make-link', {
            run(editor) {
                const selected = editor.getSelected();
                if (!selected) { alert('Selecteer eerst iets'); return; }
                const url = prompt('Enter URL');
                if (!url) return;

                if (selected.get('tagName') === 'a') {
                    selected.addAttributes({ href: url });
                    return;
                }

                const parent = selected.parent();
                if (!parent) return;

                const idx = parent.components().indexOf(selected);
                const outerHtml = selected.toHTML();
                selected.remove();
                parent.components().add(`<a href="${url}">${outerHtml}</a>`, { at: idx });
            }
        });
        editor.Commands.add('smart-link', {
            run(editor) {
                const selected = editor.getSelected();
                if (!selected) { alert('Selecteer eerst iets'); return; }
                const url = prompt('Enter URL');
                if (!url) return;

                if (selected.getName() === 'a') {
                    selected.addAttributes({ href: url });
                    return;
                }

                const style = selected.getStyle();

                const link = editor.DomComponents.addComponent({
                    tagName: 'a',
                    attributes: { href: url, target: '_blank' },
                    style: { display: 'inline-block', width: 'auto' }
                });

                selected.replaceWith(link);
                link.append(selected);

                selected.setStyle(style);
                selected.addStyle({ width: selected.getStyle().width || 'auto' });

                editor.select(link);
            }
        });

        document.getElementById('editor-loading')?.remove();

        setTimeout(() => {
            editor.refresh();
            editor.runCommand('open-blocks');
            const lastPage = localStorage.getItem('lastEditedPage') || 'home';
            const sel = document.getElementById('page-select');
            if (sel) sel.value = lastPage;
            loadPageIntoEditor(lastPage);
        }, 200);

        setTimeout(() => {
            const blocksContainer = document.querySelector('.gjs-blocks-c');
            if (!blocksContainer) return;
            const urlBlock = document.createElement('div');
            urlBlock.className = 'gjs-block';
            urlBlock.title = 'URL / Smart Link';
            urlBlock.style.cursor = 'pointer';
            urlBlock.innerHTML = '<svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg><div class="gjs-block-label">URL</div>';
            urlBlock.addEventListener('click', () => editor.runCommand('smart-link'));
            blocksContainer.appendChild(urlBlock);
        }, 600);

        editor.on('update', updateAddButtonPosition);

        buildMenuOrderUI();
        gjsEditor = editor;
    };

    const buildMenuOrderUI = () => {
        if (document.getElementById('menu-order-ui')) return;
        const editorSection = document.querySelector('.page[data-page="editor"]');
        if (!editorSection) return;

        let editTree = JSON.parse(JSON.stringify(getMenuTree()));

        const container = document.createElement('div');
        container.id = 'menu-order-ui';
        container.style.cssText = 'margin:20px 0;padding:15px;background:rgba(255,255,255,0.05);border-radius:8px;color:white;';

        const hint = document.createElement('p');
        hint.style.cssText = 'font-size:0.8rem;color:rgba(255,255,255,0.5);margin:0 0 10px;';
        hint.textContent = '↓ in submenu  ↑ uit submenu  ←→ volgorde';
        const treeEl = document.createElement('div');
        treeEl.className = 'menu-editor';
        treeEl.id = 'menu-editor';

        const mkBtn = (text, title, disabled, onClick) => {
            const b = document.createElement('button');
            b.textContent = text;
            b.title = title;
            b.style.padding = '1px 7px';
            b.disabled = disabled;
            b.addEventListener('click', onClick);
            return b;
        };

        const render = () => {
            treeEl.innerHTML = '';
            editTree.forEach((item, idx) => {
                const row = document.createElement('div');
                row.className = 'menu-editor-item';

                const lbl = document.createElement('span');
                lbl.className = 'menu-editor-item-label';
                lbl.textContent = item.title;
                row.appendChild(lbl);

                const ctrlRow = document.createElement('div');
                ctrlRow.className = 'menu-editor-item-controls';
                ctrlRow.appendChild(mkBtn('←', 'Naar links', idx === 0, () => { [editTree[idx-1], editTree[idx]] = [editTree[idx], editTree[idx-1]]; render(); }));
                ctrlRow.appendChild(mkBtn('→', 'Naar rechts', idx === editTree.length - 1, () => { [editTree[idx], editTree[idx+1]] = [editTree[idx+1], editTree[idx]]; render(); }));
                ctrlRow.appendChild(mkBtn('↓', 'In submenu (vorige item)', idx === 0, () => {
                    const removed = editTree.splice(idx, 1)[0];
                    const parent = editTree[idx - 1];
                    if (!parent.children) parent.children = [];
                    parent.children.push({ id: removed.id, title: removed.title });
                    render();
                }));
                row.appendChild(ctrlRow);

                if (item.children?.length) {
                    const childrenEl = document.createElement('div');
                    childrenEl.className = 'menu-editor-children';
                    item.children.forEach((child, cidx) => {
                        const cr = document.createElement('div');
                        cr.style.cssText = 'display:flex;align-items:center;gap:4px;padding:2px 0;';
                        const cl = document.createElement('span');
                        cl.textContent = child.title;
                        cl.style.flex = '1';
                        cr.appendChild(cl);
                        cr.appendChild(mkBtn('↑', 'Omhoog', cidx === 0, () => { [item.children[cidx-1], item.children[cidx]] = [item.children[cidx], item.children[cidx-1]]; render(); }));
                        cr.appendChild(mkBtn('↓', 'Omlaag', cidx === item.children.length - 1, () => { [item.children[cidx], item.children[cidx+1]] = [item.children[cidx+1], item.children[cidx]]; render(); }));
                        cr.appendChild(mkBtn('↑', 'Uit submenu', false, () => { item.children.splice(cidx, 1); editTree.splice(idx + 1, 0, { id: child.id, title: child.title }); render(); }));
                        childrenEl.appendChild(cr);
                    });
                    row.appendChild(childrenEl);
                }

                treeEl.appendChild(row);
            });
        };
        render();
        const collapseEl = document.createElement('div');
        collapseEl.style.display = 'none';
        collapseEl.appendChild(hint);
        collapseEl.appendChild(treeEl);

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Sla structuur op';
        saveBtn.style.cssText = 'margin-top:12px;padding:8px 16px;display:block;';
        saveBtn.addEventListener('click', () => {
            localStorage.setItem('menuTree', JSON.stringify(editTree));
            applyMenuOrder();
            initSubmenu();
            console.log('Menu structuur opgeslagen');
        });
        collapseEl.appendChild(saveBtn);

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'toggle-menu-editor';
        toggleBtn.textContent = 'Menu Structuur';
        toggleBtn.style.cssText = 'margin-bottom:8px;padding:6px 14px;cursor:pointer;';
        toggleBtn.addEventListener('click', () => {
            collapseEl.style.display = collapseEl.style.display === 'none' ? 'block' : 'none';
        });
        container.appendChild(toggleBtn);
        container.appendChild(collapseEl);

        const gjsEl = document.getElementById('gjs');
        if (gjsEl) editorSection.insertBefore(container, gjsEl);
        else editorSection.appendChild(container);
    };

    const loadPageIntoEditor = (pageId) => {
        if (!gjsEditor) return;
        currentEditingPage = pageId;
        const content = localStorage.getItem(`pageContent_${pageId}`)
            || window.pageContent?.[pageId]
            || '<h1>Empty page</h1>';
        gjsEditor.setComponents(content);
        setTimeout(createAddButton, 150);
    };

    const createAddButton = () => {
        let btn = document.getElementById('add-section-btn');
        if (btn) return;

        btn = document.createElement('button');
        btn.id = 'add-section-btn';
        btn.innerText = '+ Sectie';
        btn.style.cssText = 'position:absolute;left:50%;transform:translateX(-50%);z-index:9999;padding:10px 20px;cursor:pointer;';

        const gjsEl = document.querySelector('#gjs');
        if (gjsEl) gjsEl.appendChild(btn);

        btn.onclick = () => {
            const comp = gjsEditor.addComponents(`
                <section style="padding:40px;">
                    <h2>Nieuwe sectie</h2>
                    <p>Typ hier...</p>
                </section>
            `)[0];
            gjsEditor.select(comp);
            setTimeout(() => {
                gjsEditor.runCommand('core:component-text-edit');
            }, 100);
        };
    };

    const updateAddButtonPosition = () => {
        const btn = document.getElementById('add-section-btn');
        const canvas = document.querySelector('.gjs-cv-canvas');
        if (!btn || !canvas) return;
        btn.style.top = canvas.scrollHeight + 'px';
    };
    
    const saveContent = () => {
        if (!gjsEditor) return;

        const pageId = document.getElementById('page-select').value;
        const html = gjsEditor.getHtml();
        const css = gjsEditor.getCss();

        const fullContent = `<style>${css}</style>${html}`;

        localStorage.setItem(`pageContent_${pageId}`, fullContent);
        localStorage.setItem('lastEditedPage', pageId);

        if (!window.pageContent) window.pageContent = {};
        window.pageContent[pageId] = fullContent;

        const section = document.querySelector(`.page[data-page="${pageId}"]`);
        if (section) section.innerHTML = fullContent;

        if (pageId === 'home') {
            const notice = document.querySelector('.site-notice');
            if (notice) notice.innerHTML = fullContent;
        }

        console.log('Saved:', pageId);
    };
    
    // Initialize editor immediately when DOM is ready if on editor page
    const checkAndInitEditor = () => {
        const editorContainer = document.getElementById('gjs');
        const editorPage = document.querySelector('.page[data-page="editor"]');
        
        if (editorContainer && editorPage && !editorPage.hidden && window.grapesjs) {
            console.log('Editor page is visible, initializing GrapesJS...');
            initGrapesEditor();
        }
    };
    
    // Debug: Check GrapesJS availability
    console.log('Checking GrapesJS availability...');
    console.log('window.grapesjs exists:', !!window.grapesjs);
    console.log('Editor container exists:', !!document.getElementById('gjs'));
    
    // Check immediately
    setTimeout(checkAndInitEditor, 100);
    
    // Also try after a longer delay in case CDN is slow
    setTimeout(() => {
        console.log('Second check - GrapesJS available:', !!window.grapesjs);
        if (!gjsEditor && window.grapesjs) {
            checkAndInitEditor();
        }
    }, 2000);
    
    // Event listeners
    document.addEventListener('click', (e) => {
        if (e.target.matches('.menu-item[data-page="editor"]')) {
            setTimeout(() => checkAndInitEditor(), 500);
        }
        if (e.target.id === 'save-content') {
            saveContent();
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.id === 'page-select') {
            loadPageIntoEditor(e.target.value);
        }
    });
}

// ── Hidden Command Console ────────────────────────────────────────────────────
(function () {
    const consoleEl = document.getElementById('cmd-console');
    const outputEl  = document.getElementById('cmd-output');
    const inputEl   = document.getElementById('cmd-input');

    window.isLoggedIn = false;
    let realInput = '';

    function getEditorNavItem() {
        const link = document.querySelector('.menu-item[data-page="editor"]');
        return link ? link.closest('li') : null;
    }

    function setEditorVisible(visible) {
        const navItem = getEditorNavItem();
        if (navItem) navItem.style.display = visible ? '' : 'none';
    }

    setEditorVisible(false);

    function printLine(text, type) {
        const line = document.createElement('div');
        line.textContent = text;
        const colors = { error: '#ff4444', success: '#00ff00', info: '#00ffcc', warning: '#ffaa00', input: '#ffffff' };
        line.style.color = colors[type] || (type && type.startsWith('#') ? type : '#00ff00');
        outputEl.appendChild(line);
        outputEl.scrollTop = outputEl.scrollHeight;
    }

    const validPages = ['home','projects','websites','home-assistant','info','editor',
                        'frankybird','shooter','zlap','dedenkarbeider','klispoel'];

    function echoCommand(raw) {
        const parts = raw.trim().split(/\s+/);
        if (parts[0].toLowerCase() === 'login') {
            const user  = parts[1] || '';
            const stars = parts[2] ? '*'.repeat(parts[2].length) : '';
            printLine('> login ' + user + ' ' + stars, 'input');
        } else {
            printLine('> ' + raw, 'input');
        }
    }

    function normalize(str) {
        return str.toLowerCase().replace(/[^a-z]/g, '');
    }

    function goToPage(page) {
        const p = page.toLowerCase();
        if (['home','projects','websites','home-assistant','info','editor'].includes(p)) {
            window.location.hash = '#' + p;
        } else {
            window.location.hash = '#projects-' + p;
        }
    }

    function handleCommand(raw) {
        const parts = raw.trim().split(/\s+/);
        const cmd   = parts[0].toLowerCase();
        const args  = parts.slice(1);

        echoCommand(raw);

        if (cmd === 'help') {
            printLine('Available commands:', 'info');
            printLine('go <page>          → navigate to page', 'info');
            printLine('cd <page>          → same as go', 'info');
            printLine('background white   → clean mode', 'info');
            printLine('clear              → clear console', 'info');
            return;
        }

        if (cmd === 'commands') {
            printLine('admin', 'success');
            return;
        }

        if (cmd === 'admin') {
            printLine('nah ur not.', 'error');
            return;
        }

        if (cmd === 'waar') {
            printLine('yeah bro.', 'success');
            return;
        }

        if (cmd === 'test') {
            printLine('Test command works ✅', 'success');
            return;
        }

        if (cmd === 'login') {
            const user = args[0];
            const pass = args[1];
            if (user === 'redubbledd' && pass === 'Lollolownz1@#') {
                window.isLoggedIn = true;
                setEditorVisible(true);
                printLine('Login successful.', 'success');
            } else {
                printLine('Invalid login.', 'error');
            }
            return;
        }

        if (cmd === 'logout') {
            window.isLoggedIn = false;
            setEditorVisible(false);
            printLine('Logged out.', 'warning');
            return;
        }

        if (cmd === 'background') {
            const color = args[0];
            if (color === 'white') {
                document.body.style.background = '#ffffff';
                document.body.style.color = '#000000';
                document.querySelectorAll('*').forEach(el => { el.style.color = '#000000'; });
                const particles = document.getElementById('tsparticles');
                if (particles) particles.style.display = 'none';
                printLine('Background set to white.', 'success');
            } else if (color) {
                document.body.style.background = color;
                printLine('Background set to: ' + color, 'success');
            } else {
                printLine('Usage: background <color>', 'error');
            }
            return;
        }

        if (cmd === 'go' || cmd === 'cd') {
            const page = args[0];
            if (!page) {
                printLine('Usage: go <page>', 'error');
                return;
            }
            if (!validPages.includes(page.toLowerCase())) {
                printLine('Page not found: ' + page, 'error');
                return;
            }
            goToPage(page);
            printLine('Navigating to ' + page + '...', 'success');
            return;
        }

        if (cmd === 'clear') {
            outputEl.innerHTML = '';
            return;
        }

        if (normalize(cmd) === 'redubbledd') {
            printLine('Cool.', 'success');
            return;
        }

        printLine('Onbekend commando: "' + cmd + '" — typ help voor een lijst.', 'error');
    }

    function updateDisplay() {
        const parts = realInput.split(/\s+/);
        if (parts[0] === 'login') {
            const username = parts[1] || '';
            const password = parts.slice(2).join(' ');
            const masked = password ? '*'.repeat(password.length) : '';
            inputEl.value = ('login ' + username + ' ' + masked).trim();
        } else {
            inputEl.value = realInput;
        }
    }

    function openConsole() {
        consoleEl.style.display = 'flex';
        realInput = '';
        inputEl.value = '';
        inputEl.focus();
    }

    function closeConsole() {
        consoleEl.style.display = 'none';
        inputEl.blur();
    }

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Backquote') {
            e.preventDefault();
            e.stopPropagation();
            consoleEl.style.display === 'none' ? openConsole() : closeConsole();
            return false;
        }
        if (e.key === 'Escape') {
            closeConsole();
        }
    });

    inputEl.addEventListener('keydown', (e) => {
        if (e.code === 'Backquote') { e.preventDefault(); e.stopPropagation(); return false; }
        e.preventDefault();

        if (e.key === 'Backspace') {
            realInput = realInput.slice(0, -1);
            updateDisplay();
        } else if (e.key === 'Enter') {
            const val = realInput.trim();
            if (val) handleCommand(val);
            realInput = '';
            inputEl.value = '';
        } else if (e.key === 'Escape') {
            closeConsole();
        } else if (e.key.length === 1) {
            realInput += e.key;
            updateDisplay();
        }
    });

    window.addEventListener('hashchange', () => {
        if (!window.isLoggedIn && window.location.hash === '#editor') {
            window.location.hash = '#home';
        }
    });
})();
