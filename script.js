// ===== UTILITY FUNCTIONS =====
const Utils = {
    debounce: (fn, delay) => {
        let timer;
        return (...params) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...params), delay);
        };
    },
    throttle: (fn, interval) => {
        let lastTime = 0;
        let scheduled;
        return function (...params) {
            const now = Date.now();
            if (now - lastTime >= interval) {
                lastTime = now;
                fn.apply(this, params);
            } else {
                clearTimeout(scheduled);
                scheduled = setTimeout(() => {
                    lastTime = Date.now();
                    fn.apply(this, params);
                }, interval - (now - lastTime));
            }
        };
    },
    isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    isValidURL: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
};

// ===== DOM ELEMENTS =====
const elements = {
    header: document.getElementById('header'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    navLinks: document.getElementById('navLinks'),
    streamerForm: document.getElementById('streamerForm'),
    submitBtn: document.getElementById('submitBtn'),
    allInputs: document.querySelectorAll('input, select, textarea')
};

// ===== HEADER FUNCTIONALITY =====
class Header {
    constructor() {
        this.menuOpen = false;
        this.setup();
    }
    setup() {
        this.scrollEffect();
        this.mobileMenu();
        this.smoothScroll();
    }
    scrollEffect() {
        const updateBg = Utils.throttle(() => {
            elements.header.style.background = window.scrollY > 100
                ? 'rgba(10, 14, 39, 0.98)'
                : 'rgba(10, 14, 39, 0.95)';
        }, 10);
        window.addEventListener('scroll', updateBg);
    }
    mobileMenu() {
        if (!elements.mobileMenuBtn || !elements.navLinks) return;
        elements.mobileMenuBtn.addEventListener('click', () => this.toggleMenu());
        elements.navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        document.addEventListener('click', (e) => {
            if (!elements.header.contains(e.target) && this.menuOpen) this.closeMenu();
        });
    }
    toggleMenu() {
        this.menuOpen = !this.menuOpen;
        elements.mobileMenuBtn.classList.toggle('active');
        elements.navLinks.classList.toggle('active');
    }
    closeMenu() {
        this.menuOpen = false;
        elements.mobileMenuBtn.classList.remove('active');
        elements.navLinks.classList.remove('active');
    }
    smoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offset = elements.header.offsetHeight;
                    window.scrollTo({
                        top: target.offsetTop - offset - 20,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ===== ANIMATIONS =====
class Animations {
    constructor() {
        this.init();
    }
    init() {
        this.observeFadeIn();
        this.cardHover();
    }
    observeFadeIn() {
        const options = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    entry.target.classList.add('visible');
                }
            });
        }, options);
        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }
    cardHover() {
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
}

// ===== FORM VALIDATION =====
class FormValidator {
    constructor() {
        this.rules = {
            name: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
                message: 'Nome deve conter apenas letras e ter pelo menos 2 caracteres'
            },
            email: {
                required: true,
                validate: Utils.isValidEmail,
                message: 'Digite um email válido'
            },
            'streamer-name': {
                required: true,
                minLength: 2,
                message: 'Nome do streamer deve ter pelo menos 2 caracteres'
            },
            platform: {
                required: true,
                message: 'Selecione uma plataforma'
            },
            'channel-link': {
                required: true,
                validate: Utils.isValidURL,
                message: 'Digite uma URL válida (ex: https://twitch.tv/seucanal)'
            },
            'rpg-games': {
                required: true,
                minLength: 3,
                message: 'Digite pelo menos 3 caracteres'
            },
            followers: {
                required: true,
                message: 'Selecione o número de seguidores'
            },
            experience: {
                required: true,
                message: 'Selecione sua experiência'
            },
            goals: {
                required: true,
                minLength: 10,
                message: 'Descreva seus objetivos com pelo menos 10 caracteres'
            }
        };
    }
    validateField(field) {
        const name = field.name;
        const value = field.value.trim();
        const rule = this.rules[name];
        if (!rule) return true;
        this.clearFieldError(field);
        if (rule.required && !value) {
            this.setFieldError(field, 'Este campo é obrigatório');
            return false;
        }
        if (!value && !rule.required) return true;
        if (rule.minLength && value.length < rule.minLength) {
            this.setFieldError(field, `Mínimo ${rule.minLength} caracteres`);
            return false;
        }
        if (rule.pattern && !rule.pattern.test(value)) {
            this.setFieldError(field, rule.message);
            return false;
        }
        if (rule.validate && !rule.validate(value)) {
            this.setFieldError(field, rule.message);
            return false;
        }
        field.classList.remove('error');
        return true;
    }
    validateForm(form) {
        let valid = true;
        const formData = new FormData(form);
        for (let [name] of formData) {
            const field = form.querySelector(`[name="${name}"]`);
            if (field && !this.validateField(field)) valid = false;
        }
        return valid;
    }
    setFieldError(field, msg) {
        field.classList.add('error');
        const el = document.getElementById(`${field.id}-error`);
        if (el) el.textContent = msg;
    }
    clearFieldError(field) {
        field.classList.remove('error');
        const el = document.getElementById(`${field.id}-error`);
        if (el) el.textContent = '';
    }
    clearAllErrors(form) {
        form.querySelectorAll('input, select, textarea').forEach(f => this.clearFieldError(f));
    }
}

// ===== FORM HANDLER =====
class FormHandler {
    constructor() {
        this.validator = new FormValidator();
        this.isSubmitting = false;
        this.init();
    }
    init() {
        if (!elements.streamerForm) return;
        this.realTimeValidation();
        this.formSubmission();
    }
    realTimeValidation() {
        elements.allInputs.forEach(input => {
            input.addEventListener('blur', () => this.validator.validateField(input));
            input.addEventListener('input', Utils.debounce(() => {
                if (input.classList.contains('error')) this.validator.validateField(input);
            }, 300));
        });
    }
    formSubmission() {
        elements.streamerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (this.isSubmitting) return;
            await this.submitForm();
        });
    }
    async submitForm() {
        const form = elements.streamerForm;
        if (!this.validator.validateForm(form)) {
            this.showFormError('Por favor, corrija os erros acima');
            return;
        }
        this.isSubmitting = true;
        this.setSubmitButtonState('loading');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        try {
            await this.simulateAPICall(data);
            this.showSuccessMessage(data.name);
        } catch (error) {
            this.showFormError('Erro ao enviar formulário. Tente novamente.');
            this.setSubmitButtonState('normal');
        } finally {
            this.isSubmitting = false;
        }
    }
    async simulateAPICall(data) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (Math.random() < 0.1) throw new Error('Network error');
        console.log('Form submission data:', data);
        return { success: true };
    }
    setSubmitButtonState(state) {
        const btn = elements.submitBtn;
        const btnText = btn.querySelector('.btn-text');
        const btnIcon = btn.querySelector('.btn-icon');
        if (state === 'loading') {
            btn.disabled = true;
            btnText.textContent = 'Enviando...';
            btnIcon.textContent = '⏳';
            btn.classList.add('loading');
        } else {
            btn.disabled = false;
            btnText.textContent = 'Iniciar Minha Jornada';
            btnIcon.textContent = '🚀';
            btn.classList.remove('loading');
        }
    }
    showSuccessMessage(userName) {
        const container = elements.streamerForm.parentElement;
        container.innerHTML = `
            <div class="form-success">
                <h3>🎉 Cadastro Realizado com Sucesso!</h3>
                <p>Obrigado por se juntar à nossa guilda, <strong>${userName}</strong>!</p>
                <p>Nossa equipe entrará em contato em breve para iniciar sua jornada épica.</p>
                <p>Prepare-se para elevar seu streaming a um novo nível! ⚔️</p>
                <div style="margin-top: 2rem;">
                    <button class="cta-button" onclick="window.location.reload()">
                        <span>Cadastrar Outro Streamer</span>
                        <span>➕</span>
                    </button>
                </div>
            </div>
        `;
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    showFormError(msg) {
        let el = document.querySelector('.form-error');
        if (!el) {
            el = document.createElement('div');
            el.className = 'form-error';
            el.style.cssText = `
                background: rgba(255, 68, 68, 0.1);
                border: 1px solid var(--error-color);
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
                color: var(--error-color);
                text-align: center;
                font-weight: 500;
            `;
            elements.streamerForm.insertBefore(el, elements.streamerForm.firstChild);
        }
        el.textContent = msg;
        setTimeout(() => {
            if (el.parentNode) el.remove();
        }, 5000);
    }
}

// ===== PERFORMANCE MONITORING =====
class PerformanceMonitor {
    constructor() {
        this.init();
    }
    init() {
        window.addEventListener('load', () => {
            const nav = performance.getEntriesByType('navigation')[0];
            const loadTime = nav.loadEventEnd - nav.loadEventStart;
            console.log(`Page load time: ${loadTime}ms`);
        });
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
            });
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
        }
    }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
class AccessibilityEnhancer {
    constructor() {
        this.init();
    }
    init() {
        this.keyboardNav();
        this.announceChanges();
        this.contrast();
    }
    keyboardNav() {
        this.skipLink();
        this.menuFocusTrap();
        this.formKeyboardNav();
    }
    skipLink() {
        const link = document.createElement('a');
        link.href = '#main';
        link.textContent = 'Pular para o conteúdo principal';
        link.className = 'sr-only';
        link.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-gold);
            color: var(--dark-bg);
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        link.addEventListener('focus', () => { link.style.top = '6px'; });
        link.addEventListener('blur', () => { link.style.top = '-40px'; });
        document.body.insertBefore(link, document.body.firstChild);
    }
    menuFocusTrap() {
        if (!elements.navLinks) return;
        const links = elements.navLinks.querySelectorAll('a');
        if (!links.length) return;
        const first = links[0];
        const last = links[links.length - 1];
        elements.navLinks.addEventListener('keydown', (e) => {
            if (!elements.navLinks.classList.contains('active')) return;
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
            if (e.key === 'Escape') {
                elements.mobileMenuBtn.click();
                elements.mobileMenuBtn.focus();
            }
        });
    }
    formKeyboardNav() {
        if (!elements.streamerForm) return;
        elements.streamerForm.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
                e.preventDefault();
                const items = Array.from(elements.streamerForm.elements);
                const idx = items.indexOf(e.target);
                const next = items[idx + 1];
                if (next) next.focus();
            }
        });
    }
    announceChanges() {
        const region = document.createElement('div');
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.className = 'sr-only';
        document.body.appendChild(region);
        if (elements.streamerForm) {
            const origSetState = FormHandler.prototype.setSubmitButtonState;
            FormHandler.prototype.setSubmitButtonState = function(state) {
                origSetState.call(this, state);
                if (state === 'loading') region.textContent = 'Enviando formulário...';
            };
        }
    }
    contrast() {
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
    }
}

// ===== ERROR HANDLER =====
class ErrorHandler {
    constructor() {
        this.init();
    }
    init() {
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    }
    handleError(event) {
        console.error('JavaScript error:', event.error);
    }
    handlePromiseRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
    }
}

class App {
    constructor() {
        this.components = {};
        this.init();
    }
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }
    start() {
        try {
            this.components.header = new Header();
            this.components.animations = new Animations();
            this.components.formHandler = new FormHandler();
            this.components.performanceMonitor = new PerformanceMonitor();
            this.components.accessibilityEnhancer = new AccessibilityEnhancer();
            this.components.errorHandler = new ErrorHandler();
            console.log('Mythrial Agency website initialized successfully');
        } catch (error) {
            console.error('Failed to initialize website:', error);
        }
    }
}



// Start the application
new App();