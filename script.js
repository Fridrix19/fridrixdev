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
        document.querySelectorAll('a.app-card-item[href*="product.html?id="]').forEach(a => {
            const id = idFrom(a.getAttribute('href'));
            const p = id && products[id];
            if (!p || p.hidePriceBadge || !p.price) return;
            const info = a.querySelector('.app-card-info');
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

    const TG_URL = 'https://t.me/fridrix_order';

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(() => true, () => fallbackCopy(text));
        }
        return Promise.resolve(fallbackCopy(text));
    }
    function fallbackCopy(text) {
        try {
            const ta = document.createElement('textarea');
            ta.value = text; ta.setAttribute('readonly', '');
            ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch (e) { return false; }
    }

    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = document.getElementById('name');
            const missing = [name, messageBox].filter(el => el && !el.value.trim());
            if (missing.length) {
                if (statusEl) statusEl.textContent = 'Напишите имя и пару слов о задаче.';
                missing[0].focus();
                return;
            }
            const text = `Здравствуйте! Меня зовут ${name.value.trim()}.\n\n${messageBox.value.trim()}`;
            // open the chat synchronously so popup blockers allow it
            const win = window.open(TG_URL, '_blank');
            if (win) { try { win.opener = null; } catch (err) { /* ignore */ } }
            copyText(text).then(ok => {
                if (statusEl) {
                    statusEl.textContent = ok
                        ? 'Текст заявки скопирован. Вставьте его в чат Telegram и отправьте.'
                        : 'Не получилось скопировать автоматически — выделите текст в поле «Задача» и отправьте его в Telegram.';
                }
            });
            if (!win) window.location.href = TG_URL;
        });
    }

    /* ---------- Price calculator ----------
       Price = hours × rate. Hours = base + volume × hours per unit + add-ons.
       Every project type has its own unit of volume and its own add-ons. */
    const calc = document.getElementById('price-calculator');
    const totalEl = document.getElementById('totalPrice');
    const orderBtn = document.getElementById('order-btn');

    if (calc && totalEl) {
        const RATE = 2000;          // ₽ per hour
        const HOURS_PER_DAY = 6;    // focused hours in a working day
        const RUSH = 1.3;

        const plural = (n, one, few, many) => {
            const m10 = n % 10, m100 = n % 100;
            if (m10 === 1 && m100 !== 11) return one;
            if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
            return many;
        };
        const fmtH = h => {
            const v = Math.round(h * 10) / 10;
            return v.toLocaleString('ru-RU') + ' ч';
        };
        const rub = v => v.toLocaleString('ru-RU') + ' ₽';

        // perUnit: hours added per unit of volume instead of a fixed amount
        const TYPES = {
            landing: {
                name: 'Лендинг',
                base: 23, baseText: 'структура, прототип, дизайн-концепция, адаптив, формы заявок, запуск',
                unit: ['блок', 'блока', 'блоков'], volumeName: 'Блоков на странице',
                min: 4, max: 16, step: 1, value: 7, perUnit: 3,
                unitText: 'дизайн и вёрстка одного блока: первый экран, преимущества, кейсы, тарифы, FAQ',
                addons: [
                    { id: 'copy', label: 'Тексты под ключ', perUnit: 1 },
                    { id: 'anim', label: 'Сложная анимация: GSAP, сцены на скролле', hours: 8 },
                    { id: 'cms', label: 'Редактирование через CMS: Tilda, WordPress или headless', hours: 8 },
                    { id: 'quiz', label: 'Квиз или калькулятор на странице', hours: 6 },
                    { id: 'lang', label: 'Вторая языковая версия', perUnit: 1 },
                    { id: 'seo', label: 'Базовая SEO, Метрика и цели', hours: 4 }
                ]
            },
            corporate: {
                name: 'Корпоративный сайт',
                base: 20, baseText: 'структура, дизайн-система, шапка и подвал, адаптив, запуск',
                unit: ['страница', 'страницы', 'страниц'], volumeName: 'Уникальных страниц',
                min: 3, max: 20, step: 1, value: 6, perUnit: 6,
                unitText: 'дизайн и вёрстка одного шаблона: главная, о компании, услуга, контакты',
                addons: [
                    { id: 'copy', label: 'Тексты под ключ', perUnit: 1.5 },
                    { id: 'cms', label: 'CMS для самостоятельного редактирования', hours: 12 },
                    { id: 'blog', label: 'Блог или раздел новостей', hours: 8 },
                    { id: 'crm', label: 'Заявки в CRM или Telegram', hours: 4 },
                    { id: 'lang', label: 'Вторая языковая версия', perUnit: 1 },
                    { id: 'seo', label: 'Базовая SEO, Метрика и цели', hours: 6 }
                ]
            },
            ecommerce: {
                name: 'Интернет-магазин',
                base: 35, baseText: 'каталог с фильтрами, карточка товара, корзина, оформление заказа',
                unit: ['шаблон', 'шаблона', 'шаблонов'], volumeName: 'Дополнительных шаблонов страниц',
                min: 2, max: 15, step: 1, value: 5, perUnit: 5,
                unitText: 'главная, акции, бренды, доставка, о магазине и другие страницы',
                addons: [
                    { id: 'pay', label: 'Онлайн-оплата: ЮKassa или Stripe', hours: 8 },
                    { id: 'admin', label: 'Админка для товаров и заказов', hours: 20 },
                    { id: 'delivery', label: 'Расчёт доставки: СДЭК, Почта России', hours: 8 },
                    { id: 'account', label: 'Личный кабинет покупателя', hours: 12 },
                    { id: 'import', label: 'Импорт каталога из 1С или Excel', hours: 12 },
                    { id: 'seo', label: 'SEO для каталога и Метрика', hours: 8 }
                ]
            },
            app: {
                name: 'Веб-сервис',
                base: 15, baseText: 'сценарии пользователей, прототип, UI-кит, настройка проекта',
                unit: ['экран', 'экрана', 'экранов'], volumeName: 'Экранов в интерфейсе',
                min: 5, max: 40, step: 1, value: 12, perUnit: 4.5,
                unitText: 'дизайн и фронтенд одного экрана со всеми состояниями',
                addons: [
                    { id: 'backend', label: 'Бэкенд и база данных', perUnit: 2.5 },
                    { id: 'auth', label: 'Регистрация, вход и роли пользователей', hours: 8 },
                    { id: 'admin', label: 'Админ-панель', hours: 20 },
                    { id: 'pay', label: 'Онлайн-оплата и подписки', hours: 8 },
                    { id: 'tg', label: 'Telegram-бот или Mini App', hours: 12 },
                    { id: 'ds', label: 'Дизайн-система в Figma', hours: 10 }
                ]
            },
            motion: {
                name: 'Моушн-дизайн',
                base: 4, baseText: 'бриф, референсы, стилфреймы',
                unit: ['секунда', 'секунды', 'секунд'], volumeName: 'Длительность ролика, секунд',
                min: 10, max: 120, step: 5, value: 30, perUnit: 0.6,
                unitText: 'анимация готовой графики, примерно 0,6 часа на секунду',
                addons: [
                    { id: 'script', label: 'Сценарий и раскадровка', hours: 4 },
                    { id: 'illus', label: 'Иллюстрации и персонажи с нуля', hours: 12 },
                    { id: '3d', label: '3D-элементы в Blender', hours: 12 },
                    { id: 'sound', label: 'Музыка и саунд-дизайн', hours: 3 },
                    { id: 'formats', label: 'Версии под 9:16 и 1:1', hours: 4 },
                    { id: 'lottie', label: 'Экспорт в Lottie для сайта', hours: 3 }
                ]
            },
            identity: {
                name: 'Айдентика',
                base: 13, baseText: 'анализ рынка, цвета и типографика, гайдлайн в PDF',
                unit: ['концепция', 'концепции', 'концепций'], volumeName: 'Концепций логотипа',
                min: 2, max: 5, step: 1, value: 3, perUnit: 4,
                unitText: 'отдельное направление логотипа с презентацией',
                addons: [
                    { id: 'book', label: 'Расширенный брендбук', hours: 12 },
                    { id: 'print', label: 'Визитки, бланки и другие носители', hours: 6 },
                    { id: 'pattern', label: 'Иконки и фирменный паттерн', hours: 6 },
                    { id: 'social', label: 'Оформление соцсетей', hours: 5 },
                    { id: 'logoanim', label: 'Анимированный логотип', hours: 5 }
                ]
            }
        };

        const volumeEl = document.getElementById('calcVolume');
        const volumeOut = document.getElementById('calcVolumeOut');
        const volumeName = document.getElementById('calcVolumeName');
        const volumeHint = document.getElementById('calcVolumeHint');
        const baseHint = document.getElementById('calcBaseHint');
        const addonsEl = document.getElementById('calcAddons');
        const metaEl = document.getElementById('calcMeta');
        const linesEl = document.getElementById('calcLines');

        let current = { price: 0, hours: 0, type: 'landing', volume: 0, addons: [], rush: false };
        let renderedType = null;

        const addonHours = (a, cfg, volume) => a.perUnit ? a.perUnit * volume : a.hours;
        const addonTag = (a, cfg) => a.perUnit
            ? `+${fmtH(a.perUnit)} за ${cfg.unit[0]}`
            : `+${fmtH(a.hours)}`;

        function renderType(type) {
            const cfg = TYPES[type];
            volumeEl.min = cfg.min; volumeEl.max = cfg.max; volumeEl.step = cfg.step;
            volumeEl.value = cfg.value;
            volumeName.textContent = cfg.volumeName;
            volumeHint.textContent = `${fmtH(cfg.perUnit)} за ${cfg.unit[0]}: ${cfg.unitText}`;
            baseHint.textContent = `В базе ${fmtH(cfg.base)}: ${cfg.baseText}`;
            addonsEl.innerHTML = cfg.addons.map(a =>
                `<label class="checkbox-label"><input type="checkbox" name="addon" value="${a.id}"><span class="checkbox-custom"></span><span class="checkbox-text">${a.label}<small>${addonTag(a, cfg)}</small></span></label>`
            ).join('');
            renderedType = type;
        }

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
                totalEl.textContent = rub(shown);
                if (t < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        }

        function calculate() {
            const fd = new FormData(calc);
            const type = fd.get('projectType') || 'landing';
            if (type !== renderedType) renderType(type);
            const cfg = TYPES[type];
            const volume = Number(volumeEl.value);
            const picked = fd.getAll('addon');
            const rush = fd.get('rush') === '1';

            const lines = [
                [`База проекта`, cfg.base],
                [`${volume} ${plural(volume, ...cfg.unit)} × ${fmtH(cfg.perUnit)}`, cfg.perUnit * volume]
            ];
            const addons = cfg.addons.filter(a => picked.includes(a.id));
            addons.forEach(a => lines.push([a.label, addonHours(a, cfg, volume)]));

            let hours = lines.reduce((s, l) => s + l[1], 0);
            if (rush) {
                lines.push(['Срочность, +30%', hours * (RUSH - 1)]);
                hours *= RUSH;
            }
            hours = Math.ceil(hours);
            const price = Math.round(hours * RATE / 1000) * 1000;
            const days = Math.max(1, Math.ceil(hours / (rush ? HOURS_PER_DAY * RUSH : HOURS_PER_DAY)));

            volumeOut.textContent = `${volume} ${plural(volume, ...cfg.unit)}`;
            metaEl.textContent = `${hours} ${plural(hours, 'час', 'часа', 'часов')} × ${rub(RATE)} · около ${days} ${plural(days, 'рабочего дня', 'рабочих дней', 'рабочих дней')}`;
            linesEl.innerHTML = lines.map(([label, h]) =>
                `<li><span>${label}</span><b>${fmtH(h)}</b></li>`
            ).join('');

            current = { price, hours, days, type, volume, addons, rush };
            animateTo(price);
        }

        calc.addEventListener('change', calculate);
        volumeEl.addEventListener('input', calculate);
        calculate();

        if (orderBtn) {
            orderBtn.addEventListener('click', e => {
                if (!messageBox) return;
                e.preventDefault();
                const cfg = TYPES[current.type];
                const extra = current.addons.length ? `\nДополнительно: ${current.addons.map(a => a.label.toLowerCase()).join('; ')}.` : '';
                const rushText = current.rush ? '\nНужно срочно.' : '';
                prefillOrder(`Здравствуйте! Интересует проект: ${cfg.name}, ${current.volume} ${plural(current.volume, ...cfg.unit)}.${extra}${rushText}\nПо калькулятору: ${current.hours} ч, около ${rub(current.price)}.\n\nО задаче: `);
            });
        }
    }
})();
