/* FRIDRIX — site scripts */
(function () {
    'use strict';

    /* ---------- Header state + mobile menu ---------- */
    const header = document.querySelector('.site-header');
    const floatCta = document.querySelector('.float-cta');
    const orderSection = document.getElementById('order');

    function onScroll() {
        const y = window.scrollY;
        if (header) header.classList.toggle('is-scrolled', y > 20);
        if (floatCta) {
            let show = y > window.innerHeight * 0.7;
            if (orderSection) {
                const r = orderSection.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) show = false;
            }
            floatCta.classList.toggle('is-visible', show);
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const burger = document.querySelector('.burger');
    const mobileMenu = document.getElementById('mobileMenu');
    function setMenu(open) {
        document.body.classList.toggle('menu-open', open);
        if (burger) {
            burger.setAttribute('aria-expanded', String(open));
            burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
        }
    }
    if (burger && mobileMenu) {
        burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
        mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    }

    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

    /* ---------- Portfolio: modes ---------- */
    const modeTabs = document.querySelectorAll('.mode-tab');
    const modeSections = document.querySelectorAll('[data-mode-section]');

    function showAllCards(scope) {
        scope.querySelectorAll('.project-card, .app-card-item').forEach(card => {
            const wrapper = card.closest('.project-card-link') || card;
            wrapper.style.display = '';
            card.classList.remove('hidden');
        });
    }

    function switchMode(mode) {
        modeTabs.forEach(tab => {
            const active = tab.dataset.mode === mode;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', String(active));
        });
        modeSections.forEach(section => {
            const match = section.dataset.modeSection === mode;
            section.style.display = match ? '' : 'none';
            if (!match) return;
            const btns = section.querySelectorAll('.filter-btn');
            btns.forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
            showAllCards(section);
        });
    }

    if (modeTabs.length) {
        modeTabs.forEach(tab => tab.addEventListener('click', () => switchMode(tab.dataset.mode)));
        const fromHash = (location.hash || '').replace('#', '');
        const valid = Array.from(modeTabs).some(t => t.dataset.mode === fromHash);
        switchMode(valid ? fromHash : 'desktop');
    }

    /* ---------- Portfolio: filters ---------- */
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            const filterSection = button.closest('[data-mode-section]');
            if (!filterSection) return;
            const mode = filterSection.dataset.modeSection;
            filterSection.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            const filter = button.dataset.filter;
            document.querySelectorAll(`.projects[data-mode-section="${mode}"]`).forEach(sec => {
                sec.querySelectorAll('.project-card, .app-card-item').forEach(card => {
                    const wrapper = card.closest('.project-card-link') || card;
                    const show = filter === 'all' || card.dataset.category === filter;
                    wrapper.style.display = show ? '' : 'none';
                    card.classList.toggle('hidden', !show);
                });
            });
        });
    });

    /* ---------- Portfolio: project budgets from product.js ---------- */
    (function injectProjectPrices() {
        if (typeof products === 'undefined') return;
        const idFrom = href => {
            try { return new URL(href, location.href).searchParams.get('id'); } catch (e) { return null; }
        };
        document.querySelectorAll('a.project-card-link[href*="product.html?id="]').forEach(link => {
            const id = idFrom(link.getAttribute('href'));
            const p = id && products[id];
            if (!p || p.hidePriceBadge || !p.price) return;
            const info = link.querySelector('.project-card-info');
            if (!info || info.querySelector('.project-price-badge')) return;
            const el = document.createElement('div');
            el.className = 'project-price-badge';
            el.textContent = p.price;
            info.appendChild(el);
        });
        document.querySelectorAll('.app-card-item .app-card-info a[href*="product.html?id="]').forEach(a => {
            const id = idFrom(a.getAttribute('href'));
            const p = id && products[id];
            if (!p || p.hidePriceBadge || !p.price) return;
            const info = a.closest('.app-card-info');
            if (!info || info.querySelector('.app-price')) return;
            const el = document.createElement('div');
            el.className = 'app-price';
            el.textContent = p.price;
            info.appendChild(el);
        });
    })();

    /* ---------- Order form ---------- */
    const contactForm = document.getElementById('contactForm');
    const messageBox = document.getElementById('message');
    const statusEl = document.getElementById('formStatus');

    function prefillOrder(text) {
        if (!messageBox) return;
        messageBox.value = text;
        const target = document.getElementById('order');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const nameInput = document.getElementById('name');
        if (nameInput) setTimeout(() => nameInput.focus({ preventScroll: true }), 700);
    }

    document.querySelectorAll('[data-order]').forEach(btn => {
        btn.addEventListener('click', e => {
            if (!messageBox) return;
            e.preventDefault();
            prefillOrder(`Здравствуйте! Интересует услуга «${btn.dataset.order}».\n\nО задаче: `);
        });
    });

    // Support old links like contact.html?type=landing&price=80000
    const params = new URLSearchParams(location.search);
    const typeNames = {
        landing: 'Лендинг', corporate: 'Корпоративный сайт', ecommerce: 'Интернет-магазин',
        app: 'Приложение', motion: 'Моушн-дизайн', identity: 'Айдентика'
    };
    if (messageBox && params.get('type')) {
        const t = typeNames[params.get('type')] || params.get('type');
        const price = parseInt(params.get('price'), 10);
        messageBox.value = `Здравствуйте! Интересует проект: ${t}.` + (price ? `\nОриентировочный бюджет по калькулятору: ${price.toLocaleString('ru-RU')} ₽.` : '') + '\n\nО задаче: ';
    }

    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = document.getElementById('name');
            const contact = document.getElementById('contact');
            const missing = [name, contact, messageBox].filter(el => el && !el.value.trim());
            if (missing.length) {
                if (statusEl) statusEl.textContent = 'Заполните имя, контакт и пару слов о задаче.';
                missing[0].focus();
                return;
            }
            const subject = `Заявка с сайта: ${name.value.trim()}`;
            const body = `Имя: ${name.value.trim()}\nКонтакт: ${contact.value.trim()}\n\n${messageBox.value.trim()}`;
            window.location.href = `mailto:hello@fridrix.design?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            if (statusEl) statusEl.textContent = 'Открываю почтовый клиент с готовым письмом. Если он не открылся — напишите в Telegram.';
        });
    }

    /* ---------- Price calculator ---------- */
    const calc = document.getElementById('price-calculator');
    const totalEl = document.getElementById('totalPrice');
    const orderBtn = document.getElementById('order-btn');

    if (calc && totalEl) {
        const base = { landing: 80000, corporate: 120000, ecommerce: 180000, app: 150000, motion: 50000, identity: 70000 };
        const mult = { basic: 0.8, standard: 1, premium: 1.4 };
        const addonPrice = { seo: 15000, copywriting: 10000, admin: 25000 };
        const compNames = { basic: 'Базовый (MVP)', standard: 'Стандарт', premium: 'Премиум' };
        const addonNames = { seo: 'базовая SEO', copywriting: 'копирайтинг', admin: 'админ-панель / CMS', rush: 'срочно' };
        let current = { price: 0, type: 'landing', complexity: 'standard', addons: [] };

        let shown = 0;
        function animateTo(value) {
            const from = shown;
            const start = performance.now();
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const dur = reduce ? 0 : 450;
            function tick(now) {
                const t = dur ? Math.min(1, (now - start) / dur) : 1;
                const eased = 1 - Math.pow(1 - t, 3);
                shown = Math.round(from + (value - from) * eased);
                totalEl.textContent = shown.toLocaleString('ru-RU') + ' ₽';
                if (t < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        }

        function calculate() {
            const fd = new FormData(calc);
            const type = fd.get('projectType');
            const complexity = fd.get('complexity') || 'standard';
            const addons = fd.getAll('addon');
            let price = (base[type] || 0) * (mult[complexity] || 1);
            addons.forEach(a => { price += addonPrice[a] || 0; });
            if (addons.includes('rush')) price *= 1.3;
            price = Math.round(price / 1000) * 1000;
            current = { price, type, complexity, addons };
            animateTo(price);
        }

        calc.addEventListener('change', calculate);
        calculate();

        if (orderBtn) {
            orderBtn.addEventListener('click', e => {
                if (!messageBox) return;
                e.preventDefault();
                const extra = current.addons.length ? `\nДополнительно: ${current.addons.map(a => addonNames[a]).join(', ')}.` : '';
                prefillOrder(`Здравствуйте! Интересует проект: ${typeNames[current.type]}, объём «${compNames[current.complexity]}».${extra}\nОриентировочный бюджет по калькулятору: ${current.price.toLocaleString('ru-RU')} ₽.\n\nО задаче: `);
            });
        }
    }
})();
