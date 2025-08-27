// ==UserScript==
// @name         ChatGPT Prompt Assistant Pro+
// @namespace    https://github.com/your-profile
// @version      1.3.3
// @description  Умная вставка промптов с тёмной темой и большой базой промптов
// @author       Expert Developer
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @match        https://*.chat.openai.com/*
// @icon         https://chat.openai.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @noframes
// @run-at       document-end
// @connect      raw.githubusercontent.com
// @connect      api.jsonbin.io
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        storageKey: 'chatgpt_prompts_v3',
        themeKey: 'prompt_assistant_theme',
        buttonPosition: 'bottom-right',
        animationDuration: 300,
        maxRecentPrompts: 20,
        retryAttempts: 15,
        retryDelay: 1000
    };

    const DEFAULT_PROMPTS = {
        expert_development: [
            {
                name: "🚀 Senior JavaScript Developer",
                text: `Вы — экспертный JavaScript-разработчик с 10+ летним опытом создания пользовательских скриптов для Tampermonkey/Violentmonkey. Вы специализируетесь на создании надежных, эффективных и безопасных браузерных скриптов с правильной архитектурой, оптимизированными метаданными и соблюдением всех современных стандартов безопасности.

Ваша экспертиза включает:
- Глубокое понимание API Tampermonkey/Violentmonkey и их различий
- Мастерство в написании безопасного DOM-манипулирующего кода
- Экспертные знания метаданных (@match, @grant, @require, @resource)
- Опыт создания кроссплатформенных скриптов
- Знание лучших практик безопасности для пользовательских скриптов
- Умение создавать производительный и поддерживаемый код

Проанализируйте следующую задачу и предоставьте оптимальное решение:`,
                category: "Экспертная разработка",
                tags: ["javascript", "tampermonkey", "security", "expert"]
            },
            {
                name: "🔒 Security Code Review",
                text: "Проведите полный security audit следующего кода. Проверьте на уязвимости: XSS, CSRF, инъекции, проблемы с CORS, безопасность DOM. Предложите исправления:",
                category: "Экспертная разработка",
                tags: ["security", "audit", "xss", "csrf", "vulnerability"]
            },
            {
                name: "📦 Webpack Configuration Expert",
                text: "Проанализируйте и оптимизируйте конфигурацию Webpack для production сборки. Учитывайте: tree shaking, code splitting, минификацию, кэширование:",
                category: "Экспертная разработка",
                tags: ["webpack", "optimization", "bundling", "performance"]
            }
        ],

        programming: [
            {
                name: "👨‍💻 Senior Code Review",
                text: "Ты - senior разработчик с 20+ летним опытом. Проанализируй следующий код, укажи на потенциальные проблемы, оптимизируй и предложи лучшие практики. Структурируй ответ:\n\n[Вставь код здесь]",
                category: "Программирование",
                tags: ["code", "review", "optimization", "javascript"]
            },
            {
                name: "🚀 Debug Assistant Pro",
                text: "Помоги найти ошибку в этом коде. Объясни причину проблемы, предложи исправление и покажи как избежать подобных ошибок в будущем:\n\n[Вставь код с ошибкой]",
                category: "Программирование",
                tags: ["debug", "error", "fix", "troubleshooting"]
            },
            {
                name: "📊 SQL Query Optimizer",
                text: "Проанализируй этот SQL запрос на предмет оптимизации. Предложи улучшения индексов, нормализации и производительности:\n\n[SQL запрос]",
                category: "Программирование",
                tags: ["sql", "database", "optimization", "performance"]
            },
            {
                name: "🔧 API Design Expert",
                text: "Спроектируй RESTful API для [системы/сервиса]. Включи endpoints, методы, статус коды, схему данных и безопасность.",
                category: "Программирование",
                tags: ["api", "design", "rest", "architecture"]
            },
            {
                name: "🎨 Frontend Architecture",
                text: "Спроектируй архитектуру фронтенд приложения для [проекта]. Включи выбор фреймворка, структуру папок, state management и routing.",
                category: "Программирование",
                tags: ["frontend", "architecture", "react", "vue"]
            },
            {
                name: "⚡ Performance Optimization",
                text: "Проанализируй производительность этого кода/приложения. Предложи оптимизации для улучшения скорости загрузки и выполнения:",
                category: "Программирование",
                tags: ["performance", "optimization", "speed", "bottleneck"]
            },
            {
                name: "🧪 Unit Testing Strategy",
                text: "Разработай стратегию unit тестирования для [компонента/модуля]. Включи тест кейсы, моки и покрытие критических путей:",
                category: "Программирование",
                tags: ["testing", "unit", "jest", "mocha"]
            }
        ],

        ai_prompts: [
            {
                name: "🤖 AI Prompt Engineering",
                text: "Создай оптимальный промпт для ChatGPT для решения задачи: [описание задачи]. Учти контекст, формат ответа и уровень детализации.",
                category: "AI и промпты",
                tags: ["ai", "prompt", "engineering", "optimization"]
            },
            {
                name: "🎯 ChatGPT Persona Creator",
                text: "Создай детальную персонализированную роль для ChatGPT для: [роль/экспертиза]. Включи背景, стиль общения и ограничения.",
                category: "AI и промпты",
                tags: ["persona", "role", "custom", "ai"]
            },
            {
                name: "📝 AI Content Generator",
                text: "Сгенерируй качественный контент на тему: [тема]. Учти целевую аудиторию, тон и структуру:",
                category: "AI и промпты",
                tags: ["content", "generation", "writing", "ai"]
            }
        ],

        writing: [
            {
                name: "✍️ Professional Writer",
                text: "Ты - профессиональный писатель и копирайтер. Создай engaging контент на тему: [тема]. Используй убедительный язык, приведи примеры и сделай текст структурированным.",
                category: "Творчество",
                tags: ["writing", "content", "creative", "copywriting"]
            },
            {
                name: "📝 Business Email",
                text: "Напиши профессиональное деловое письмо для [ситуация]. Включи приветствие, основную часть, призыв к действию и подпись.",
                category: "Творчество",
                tags: ["email", "business", "professional", "communication"]
            },
            {
                name: "🎯 Marketing Copy",
                text: "Создай продающий текст для [продукт/услуга]. Удели внимание уникальному предложению, выгодам и призыву к действию.",
                category: "Творчество",
                tags: ["marketing", "copywriting", "sales", "advertising"]
            },
            {
                name: "📖 Storytelling Master",
                text: "Расскажи захватывающую историю о [тема]. Используй элементы сюжета, диалоги и эмоциональные моменты.",
                category: "Творчество",
                tags: ["storytelling", "creative", "narrative", "emotion"]
            },
            {
                name: "📄 Technical Documentation",
                text: "Создай техническую документацию для [API/библиотека/система]. Включи installation guide, usage examples и troubleshooting.",
                category: "Творчество",
                tags: ["documentation", "technical", "api", "guide"]
            }
        ],

        analysis: [
            {
                name: "🔍 Deep Analysis Pro",
                text: "Проанализируй следующую информацию структурно и детально. Разбей ответ на логические разделы с подзаголовками. Предоставь конкретные примеры и практические рекомендации:\n\n[Вставь информацию для анализа]",
                category: "Анализ",
                tags: ["analysis", "structured", "detailed", "research"]
            },
            {
                name: "📈 SWOT Analysis",
                text: "Проведи SWOT-анализ для [компания/продукт/идея]. Детально распиши сильные и слабые стороны, возможности и угрозы.",
                category: "Анализ",
                tags: ["swot", "analysis", "business", "strategy"]
            },
            {
                name: "💡 Problem Solving",
                text: "Проанализируй проблему: [описание проблемы]. Предложи несколько решений с плюсами и минусами каждого.",
                category: "Анализ",
                tags: ["problem", "solving", "solutions", "decision"]
            },
            {
                name: "📊 Data Analysis",
                text: "Проанализируй следующий набор данных: [данные/статистика]. Выяви тренды, паттерны и сделай выводы:",
                category: "Анализ",
                tags: ["data", "analysis", "trends", "statistics"]
            }
        ],

        education: [
            {
                name: "🎓 Expert Teacher",
                text: "Объясни концепцию [сложная тема] как эксперт преподаватель. Используй аналогии, примеры и простой язык для лучшего понимания.",
                category: "Образование",
                tags: ["teaching", "education", "explanation", "learning"]
            },
            {
                name: "📚 Study Guide Creator",
                text: "Создай подробное учебное руководство по [тема]. Включи ключевые концепции, примеры и практические задания.",
                category: "Образование",
                tags: ["study", "guide", "education", "learning"]
            },
            {
                name: "🧠 Memory Techniques",
                text: "Предложи техники запоминания для [информация]. Включи мнемонику, ассоциации и методы spaced repetition.",
                category: "Образование",
                tags: ["memory", "learning", "techniques", "study"]
            },
            {
                name: "📖 Curriculum Design",
                text: "Разработай учебный план для [курс/предмет]. Включи цели обучения, темы, материалы и оценку:",
                category: "Образование",
                tags: ["curriculum", "education", "planning", "teaching"]
            }
        ],

        business: [
            {
                name: "💼 Business Plan",
                text: "Помоги создать бизнес-план для [бизнес идея]. Включи анализ рынка, финансовые прогнозы, маркетинг стратегию и операционный план.",
                category: "Бизнес",
                tags: ["business", "plan", "strategy", "startup"]
            },
            {
                name: "📊 Market Analysis",
                text: "Проведи анализ рынка для [продукт/услуга]. Включи размер рынка, тренды, конкурентов и целевую аудиторию.",
                category: "Бизнес",
                tags: ["market", "analysis", "research", "business"]
            },
            {
                name: "🤝 Negotiation Expert",
                text: "Дай советы по ведению переговоров для [ситуация]. Включи техники, фразы и стратегии для успешного исхода.",
                category: "Бизнес",
                tags: ["negotiation", "business", "communication", "strategy"]
            },
            {
                name: "📈 Investment Analysis",
                text: "Проанализируй инвестиционную возможность: [акция/проект/крипто]. Включи риски, потенциальную доходность и рекомендации:",
                category: "Бизнес",
                tags: ["investment", "finance", "analysis", "stocks"]
            }
        ],

        productivity: [
            {
                name: "⏰ Time Management",
                text: "Предложи систему управления временем для [цель/проект]. Включи методы приоритизации, планирования и избегания прокрастинации.",
                category: "Продуктивность",
                tags: ["time", "management", "productivity", "planning"]
            },
            {
                name: "🎯 Goal Setting",
                text: "Помоги поставить SMART цели для [область жизни/проект]. Сделай их конкретными, измеримыми, достижимыми, релевантными и ограниченными по времени.",
                category: "Продуктивность",
                tags: ["goals", "planning", "productivity", "smart"]
            },
            {
                name: "📋 Project Planning",
                text: "Создай план проекта для [название проекта]. Включи этапы, сроки, ресурсы и метрики успеха.",
                category: "Продуктивность",
                tags: ["project", "planning", "management", "organization"]
            },
            {
                name: "🔄 Workflow Optimization",
                text: "Проанализируй и оптимизируй рабочий процесс для [задача/процесс]. Предложи automation и улучшения efficiency:",
                category: "Продуктивность",
                tags: ["workflow", "optimization", "automation", "efficiency"]
            }
        ],

        health: [
            {
                name: "🏋️ Fitness Coach",
                text: "Создай программу тренировок для [цель]. Включи упражнения, питание, восстановление и прогрессию.",
                category: "Здоровье",
                tags: ["fitness", "workout", "health", "nutrition"]
            },
            {
                name: "🥗 Nutrition Expert",
                text: "Разработай план питания для [цель/диета]. Включи макросы, рецепты и рекомендации по добавкам.",
                category: "Здоровье",
                tags: ["nutrition", "diet", "health", "wellness"]
            },
            {
                name: "😌 Mental Health",
                text: "Дай советы по управлению стрессом и улучшению ментального здоровья для [ситуация].",
                category: "Здоровье",
                tags: ["mental", "health", "stress", "wellbeing"]
            },
            {
                name: "💤 Sleep Optimization",
                text: "Предложи стратегии для улучшения качества сна и решения проблем с бессонницей:",
                category: "Здоровье",
                tags: ["sleep", "health", "wellness", "recovery"]
            }
        ],

        creative: [
            {
                name: "🎨 Creative Ideas",
                text: "Сгенерируй креативные идеи для [проект/проблема]. Используй техники мозгового штурма и нестандартного мышления.",
                category: "Креатив",
                tags: ["creative", "ideas", "brainstorming", "innovation"]
            },
            {
                name: "📷 Content Strategy",
                text: "Разработай контент стратегию для [бренд/платформа]. Включи темы, форматы, расписание и метрики.",
                category: "Креатив",
                tags: ["content", "strategy", "marketing", "social"]
            },
            {
                name: "🎬 Script Writing",
                text: "Напиши сценарий для [видео/подкаст/презентация]. Включи диалоги, сцены и режиссерские заметки.",
                category: "Креатив",
                tags: ["script", "writing", "video", "content"]
            },
            {
                name: "🎵 Music Composition",
                text: "Создай музыкальную композицию в стиле [жанр/артист]. Опиши структуру, гармонии и аранжировку:",
                category: "Креатив",
                tags: ["music", "composition", "creative", "art"]
            }
        ],

        technology: [
            {
                name: "🤖 AI Integration",
                text: "Разработай стратегию интеграции AI в [бизнес/продукт]. Включи use cases, технические требования и ROI:",
                category: "Технологии",
                tags: ["ai", "integration", "technology", "innovation"]
            },
            {
                name: "🔐 Cybersecurity",
                text: "Проанализируй безопасность [система/сеть]. Предложи меры защиты от кибератак и улучшения security posture:",
                category: "Технологии",
                tags: ["cybersecurity", "security", "protection", "hacking"]
            },
            {
                name: "☁️ Cloud Architecture",
                text: "Спроектируй cloud архитектуру для [приложение/сервис]. Включи scalability, availability и cost optimization:",
                category: "Технологии",
                tags: ["cloud", "architecture", "aws", "azure"]
            },
            {
                name: "📱 Mobile Development",
                text: "Разработай архитектуру мобильного приложения для [iOS/Android]. Включи нативные vs кроссплатформенные решения:",
                category: "Технологии",
                tags: ["mobile", "development", "ios", "android"]
            }
        ],

        personal: [
            {
                name: "💬 Relationship Advice",
                text: "Дай советы по улучшению отношений в ситуации: [описание ситуации]. Будь эмпатичным и практичным.",
                category: "Личное",
                tags: ["relationship", "advice", "personal", "communication"]
            },
            {
                name: "🌟 Personal Growth",
                text: "Помоги разработать план личностного роста для [цель/область развития]. Включи конкретные шаги и метрики:",
                category: "Личное",
                tags: ["personal", "growth", "development", "selfimprovement"]
            },
            {
                name: "💰 Personal Finance",
                text: "Предложи стратегию управления личными финансами для [доход/цели]. Включи budgeting, investing и saving:",
                category: "Личное",
                tags: ["finance", "money", "budgeting", "investing"]
            },
            {
                name: "🎯 Career Planning",
                text: "Помоги разработать карьерный план для [профессия/индустрия]. Включи skills development и networking:",
                category: "Личное",
                tags: ["career", "planning", "professional", "development"]
            }
        ]
    };
    class ChatGPTPromptAssistantPro {
        constructor() {
            this.prompts = this.loadPrompts();
            this.currentTheme = this.loadTheme() || 'dark';
            this.isModalOpen = false;
            this.currentInputField = null;
            this.retryCount = 0;
            this.init();
        }

        async init() {
            try {
                await this.waitForChatInterface();
                this.createFloatingButton();
                this.createPromptModal();
                setTimeout(() => this.bindEvents(), 0);
                this.setupMutationObserver();
                this.applyTheme(this.currentTheme);
                await this.loadAdditionalPrompts();
            } catch (error) {
                console.error('Failed to initialize:', error);
                this.retryInitialization();
            }
        }

        async waitForChatInterface() {
            return new Promise((resolve, reject) => {
                const maxAttempts = CONFIG.retryAttempts;
                let attempts = 0;

                const check = () => {
                    const inputArea = this.findInputField();
                    if (inputArea) {
                        this.currentInputField = inputArea;
                        resolve();
                    } else {
                        attempts++;
                        if (attempts >= maxAttempts) {
                            reject(new Error('Chat input area not found'));
                        } else {
                            setTimeout(check, CONFIG.retryDelay);
                        }
                    }
                };
                check();
            });
        }

        findInputField() {
            // Все возможные селекторы для поля ввода ChatGPT
            const selectors = [
                'textarea[data-id="root"]',
                'textarea[aria-label*="message"]',
                'textarea[placeholder*="message"]',
                'div[contenteditable="true"][data-id]',
                'textarea',
                '[contenteditable="true"]',
                'input[type="text"]',
                '.prompt-textarea',
                '.input-textarea'
            ];

            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element && this.isVisible(element)) {
                    return element;
                }
            }
            return null;
        }

        isVisible(element) {
            return element.offsetWidth > 0 && element.offsetHeight > 0;
        }

        retryInitialization() {
            if (this.retryCount < CONFIG.retryAttempts) {
                this.retryCount++;
                setTimeout(() => {
                    this.init();
                }, CONFIG.retryDelay);
            }
        }

        createFloatingButton() {
            const oldBtn = document.getElementById('prompt-assistant-btn');
            if (oldBtn) oldBtn.remove();

            this.floatingButton = document.createElement('div');
            this.floatingButton.id = 'prompt-assistant-btn';
            this.floatingButton.className = 'floating-button';

            this.floatingButton.innerHTML = `
                <div class="button-icon" aria-hidden="true">✨</div>
                <div class="button-text">Промпты</div>
                <div class="button-badge" aria-label="Всего промптов">${this.getTotalPrompts()}</div>
            `;

            document.body.appendChild(this.floatingButton);
            this.injectButtonStyles();
        }

        injectButtonStyles() {
            const buttonStyles = `
                .floating-button {
                    position: fixed;
                    right: 20px;
                    bottom: 20px;
                    z-index: 10000;
                    background: var(--accent-color);
                    color: white;
                    border: none;
                    border-radius: 50px;
                    padding: 12px 20px;
                    cursor: pointer;
                    box-shadow: 0 6px 20px rgba(16, 163, 127, 0.4);
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-weight: 500;
                    font-size: 14px;
                    min-width: auto;
                    max-width: 140px;
                    overflow: hidden;
                    animation: floatIn 0.5s ease-out;
                    user-select: none;
                }
                .floating-button:hover {
                    background: var(--accent-hover);
                    transform: translateY(-2px) scale(1.05);
                    box-shadow: 0 8px 25px rgba(16, 163, 127, 0.5);
                    max-width: 200px;
                }
                .floating-button:active {
                    transform: translateY(0) scale(0.95);
                }
                .button-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }
                .button-text {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    flex-shrink: 0;
                }
                .button-badge {
                    background: rgba(255,255,255,0.2);
                    border-radius: 12px;
                    padding: 2px 8px;
                    font-size: 11px;
                    font-weight: 600;
                    min-width: 20px;
                    text-align: center;
                    flex-shrink: 0;
                }
                @keyframes floatIn {
                    from {
                        opacity: 0;
                        transform: translateY(100px) scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @media (max-width: 768px) {
                    .floating-button {
                        bottom: 70px;
                        right: 15px;
                        padding: 10px 16px;
                    }
                    .button-text {
                        display: none;
                    }
                    .floating-button:hover .button-text {
                        display: block;
                    }
                }
                [data-prompt-theme="light"] {
                    --accent-color: #10a37f;
                    --accent-hover: #0d8c6d;
                }
                [data-prompt-theme="dark"] {
                    --accent-color: #48bb78;
                    --accent-hover: #38a169;
                }
            `;

            const style = document.createElement('style');
            style.id = 'prompt-assistant-btn-style';
            style.textContent = buttonStyles;
            document.head.appendChild(style);
        }

        createPromptModal() {
            if (document.getElementById('prompt-assistant-modal')) return;

            this.modal = document.createElement('div');
            this.modal.id = 'prompt-assistant-modal';
            this.modal.className = 'prompt-modal';

            this.modal.innerHTML = `
                <div class="modal-header">
                    <div class="header-content">
                        <h3 id="prompt-modal-title">✨ Библиотека промптов</h3>
                        <span class="prompt-count">${this.getTotalPrompts()} промптов</span>
                    </div>
                    <div class="header-controls">
                        <button class="theme-toggle" title="Сменить тему" aria-label="Сменить тему">🌓</button>
                        <button id="close-modal" class="close-btn" aria-label="Закрыть модальное окно">×</button>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="filters-row">
                        <div class="search-container">
                            <input type="search" id="prompt-search" placeholder="🔍 Поиск среди ${this.getTotalPrompts()} промптов..." class="search-input" aria-label="Поиск промптов" />
                        </div>
                        <select id="category-filter" class="category-filter" aria-label="Фильтр по категории">
                            <option value="all">Все категории</option>
                            ${this.getCategories().map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                        <select id="tag-filter" class="tag-filter" aria-label="Фильтр по тегу">
                            <option value="all">Все теги</option>
                            ${this.getUniqueTags().map(tag => `<option value="${tag}">${tag}</option>`).join('')}
                        </select>
                    </div>
                    <div class="stats-row">
                        <span class="stats">Найдено: <span id="found-count">0</span> промптов</span>
                        <button class="scroll-top" type="button">↑ Наверх</button>
                    </div>
                    <div id="prompt-container" class="prompt-container" tabindex="0" aria-live="polite" aria-atomic="true"></div>
                    <div class="modal-footer">
                        <div class="footer-info">
                            <span>💡 Используйте промпты для лучших ответов!</span>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(this.modal);
            this.injectModalStyles();

            const scrollTopBtn = this.modal.querySelector('.scroll-top');
            scrollTopBtn.addEventListener('click', () => {
                const container = this.modal.querySelector('.modal-body');
                container.scrollTo({top: 0, behavior: 'smooth'});
            });
        }

        injectModalStyles() {
            const styles = `
                .prompt-modal {
                    display: none;
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 95%;
                    max-width: 900px;
                    max-height: 85vh;
                    background: var(--modal-bg);
                    border-radius: 20px;
                    z-index: 10001;
                    box-shadow: var(--modal-shadow);
                    overflow: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    border: var(--modal-border);
                    color: var(--text-primary);
                }
                [data-prompt-theme="light"] {
                    --modal-bg: #ffffff;
                    --modal-shadow: 0 25px 50px rgba(0,0,0,0.25);
                    --modal-border: 1px solid #e0e0e0;
                    --text-primary: #2d3748;
                    --text-secondary: #718096;
                    --bg-primary: #ffffff;
                    --bg-secondary: #f7fafc;
                    --accent-color: #10a37f;
                    --accent-hover: #0d8c6d;
                    --border-color: #e2e8f0;
                    --hover-bg: #edf2f7;
                }
                [data-prompt-theme="dark"] {
                    --modal-bg: #1a202c;
                    --modal-shadow: 0 25px 50px rgba(0,0,0,0.4);
                    --modal-border: 1px solid #2d3748;
                    --text-primary: #e2e8f0;
                    --text-secondary: #a0aec0;
                    --bg-primary: #1a202c;
                    --bg-secondary: #2d3748;
                    --accent-color: #48bb78;
                    --accent-hover: #38a169;
                    --border-color: #4a5568;
                    --hover-bg: #2d3748;
                }
                .modal-header {
                    padding: 20px 25px;
                    background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .header-content {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .header-content h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }
                .prompt-count {
                    font-size: 12px;
                    opacity: 0.9;
                }
                .header-controls {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                .theme-toggle {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background 0.2s;
                }
                .theme-toggle:hover {
                    background: rgba(255,255,255,0.3);
                }
                .close-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                .close-btn:hover {
                    background: rgba(255,255,255,0.3);
                }
                .modal-body {
                    padding: 25px;
                    overflow-y: auto;
                    max-height: 60vh;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                }
                .filters-row {
                    display: grid;
                    grid-template-columns: 1fr auto auto;
                    gap: 15px;
                    margin-bottom: 20px;
                }
                .search-input, .category-filter, .tag-filter {
                    padding: 12px 15px;
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 14px;
                }
                .search-input:focus, .category-filter:focus, .tag-filter:focus {
                    outline: none;
                    border-color: var(--accent-color);
                }
                .stats-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    color: var(--text-secondary);
                    font-size: 14px;
                }
                .scroll-top {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    padding: 6px 12px;
                    border-radius: 8px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-size: 12px;
                }
                .scroll-top:hover {
                    background: var(--hover-bg);
                }
                .prompt-container {
                    display: grid;
                    gap: 15px;
                }
                .prompt-category {
                    background: var(--bg-secondary);
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid var(--border-color);
                }
                .prompt-category h4 {
                    margin: 0 0 15px 0;
                    color: var(--accent-color);
                    font-size: 16px;
                    font-weight: 600;
                }
                .prompt-item {
                    padding: 20px;
                    margin: 10px 0;
                    background: var(--bg-primary);
                    border: 2px solid var(--border-color);
                    border-radius: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    user-select: none;
                }
                .prompt-item:hover, .prompt-item:focus {
                    border-color: var(--accent-color);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    outline: none;
                }
                .prompt-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                    gap: 15px;
                }
                .prompt-name {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 15px;
                    line-height: 1.4;
                }
                .prompt-category-tag {
                    font-size: 11px;
                    color: var(--accent-color);
                    background: rgba(16, 163, 127, 0.1);
                    padding: 4px 8px;
                    border-radius: 6px;
                    white-space: nowrap;
                }
                .prompt-preview {
                    color: var(--text-secondary);
                    font-size: 14px;
                    line-height: 1.5;
                    margin-bottom: 15px;
                    white-space: pre-wrap;
                    word-break: break-word;
                }
                .prompt-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .tag {
                    font-size: 11px;
                    color: var(--accent-color);
                    background: rgba(16, 163, 127, 0.1);
                    padding: 3px 8px;
                    border-radius: 12px;
                }
                .modal-footer {
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 1px solid var(--border-color);
                }
                .footer-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: var(--text-secondary);
                    font-size: 13px;
                }
                .shortcut {
                    background: var(--bg-secondary);
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-family: monospace;
                }
                @media (max-width: 768px) {
                    .prompt-modal {
                        width: 95%;
                        height: 90vh;
                        max-width: none;
                    }
                    .filters-row {
                        grid-template-columns: 1fr;
                    }
                    .header-content h3 {
                        font-size: 16px;
                    }
                    .prompt-item {
                        padding: 15px;
                    }
                    .floating-button {
                        bottom: 70px;
                        right: 15px;
                        padding: 10px 16px;
                    }
                    .button-text {
                        display: none;
                    }
                }
            `;

            const style = document.createElement('style');
            style.id = 'prompt-assistant-modal-style';
            style.textContent = styles;
            document.head.appendChild(style);
        }

        escapeHTML(str) {
            if (typeof str !== 'string') return '';
            return str.replace(/[&<>"']/g, m => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;',
                '"': '&quot;', "'": '&#39;'
            }[m]));
        }

        loadPrompts() {
            try {
                const stored = GM_getValue(CONFIG.storageKey, null);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (typeof parsed === 'object' && parsed !== null) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.warn('Ошибка чтения сохранённых промптов:', e);
            }
            return DEFAULT_PROMPTS;
        }

        savePrompts() {
            try {
                GM_setValue(CONFIG.storageKey, JSON.stringify(this.prompts));
            } catch (e) {
                console.warn('Ошибка сохранения промптов:', e);
            }
        }

        async loadAdditionalPrompts() {
            // Можно добавить загрузку дополнительных промптов
        }

        loadTheme() {
            try {
                const theme = GM_getValue(CONFIG.themeKey, null);
                if (theme === 'light' || theme === 'dark') return theme;
            } catch (e) {
                console.warn('Ошибка загрузки темы:', e);
            }
            return 'dark';
        }

        saveTheme(theme) {
            if (theme !== 'light' && theme !== 'dark') return;
            try {
                GM_setValue(CONFIG.themeKey, theme);
            } catch (e) {
                console.warn('Ошибка сохранения темы:', e);
            }
        }

        applyTheme(theme) {
            if (!document.body) return;
            if (theme !== 'light' && theme !== 'dark') return;
            this.currentTheme = theme;
            document.body.setAttribute('data-prompt-theme', theme);
        }

        showModal() {
            if (!this.modal) return;
            this.modal.style.display = 'block';
            this.isModalOpen = true;
            this.createOverlay();

            const searchInput = document.getElementById('prompt-search');
            if (searchInput) searchInput.focus();

            this.renderPrompts();
        }

        hideModal() {
            if (!this.modal) return;
            this.modal.style.display = 'none';
            this.isModalOpen = false;
            this.removeOverlay();
        }

        createOverlay() {
            if (document.getElementById('prompt-overlay')) return;

            this.overlay = document.createElement('div');
            this.overlay.id = 'prompt-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 10000;
                backdrop-filter: blur(5px);
            `;

            this.overlay.addEventListener('click', () => this.hideModal());
            document.body.appendChild(this.overlay);
        }

        removeOverlay() {
            const overlay = document.getElementById('prompt-overlay');
            if (overlay) overlay.remove();
        }

        updateButtonBadge() {
            if (this.floatingButton) {
                const badge = this.floatingButton.querySelector('.button-badge');
                if (badge) {
                    badge.textContent = this.getTotalPrompts();
                }
            }
        }

        getTotalPrompts() {
            return Object.values(this.prompts).flat().length;
        }

        getCategories() {
            return [...new Set(Object.values(this.prompts).flat().map(p => p.category))];
        }

        getUniqueTags() {
            const allTags = Object.values(this.prompts).flat().flatMap(p => p.tags);
            return [...new Set(allTags)].sort();
        }

        renderPrompts() {
            if (!this.modal) return;
            const container = this.modal.querySelector('#prompt-container');
            const searchInput = this.modal.querySelector('#prompt-search');
            const categoryFilter = this.modal.querySelector('#category-filter');
            const tagFilter = this.modal.querySelector('#tag-filter');
            const foundCountElem = this.modal.querySelector('#found-count');

            if (!container || !searchInput || !categoryFilter || !tagFilter || !foundCountElem) return;

            const searchTermRaw = searchInput.value.trim().toLowerCase();
            const categoryValue = categoryFilter.value;
            const tagValue = tagFilter.value;

            const filterPrompt = p => {
                const matchesSearch = !searchTermRaw ||
                    p.name.toLowerCase().includes(searchTermRaw) ||
                    p.text.toLowerCase().includes(searchTermRaw);
                const matchesCategory = categoryValue === 'all' || p.category === categoryValue;
                const matchesTag = tagValue === 'all' || (p.tags && p.tags.includes(tagValue));

                return matchesSearch && matchesCategory && matchesTag;
            };

            const filteredPrompts = Object.values(this.prompts)
                .flat()
                .filter(filterPrompt);

            foundCountElem.textContent = filteredPrompts.length;

            if (filteredPrompts.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Промпты не найдены</p>';
                return;
            }

            const grouped = filteredPrompts.reduce((acc, p) => {
                if (!acc[p.category]) acc[p.category] = [];
                acc[p.category].push(p);
                return acc;
            }, {});

            const fragment = document.createDocumentFragment();

            for (const [category, prompts] of Object.entries(grouped)) {
                const categoryDiv = document.createElement('section');
                categoryDiv.className = 'prompt-category';

                const categoryTitle = document.createElement('h4');
                categoryTitle.textContent = category;
                categoryDiv.appendChild(categoryTitle);

                prompts.forEach(prompt => {
                    const item = document.createElement('article');
                    item.className = 'prompt-item';
                    item.tabIndex = 0;
                    item.setAttribute('role', 'button');
                    item.setAttribute('aria-label', `Вставить промпт: ${prompt.name}`);

                    item.addEventListener('click', () => this.insertPrompt(prompt));
                    item.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.insertPrompt(prompt);
                        }
                    });

                    const header = document.createElement('div');
                    header.className = 'prompt-header';

                    const nameElem = document.createElement('div');
                    nameElem.className = 'prompt-name';
                    nameElem.textContent = prompt.name;

                    const categoryTag = document.createElement('div');
                    categoryTag.className = 'prompt-category-tag';
                    categoryTag.textContent = prompt.category;

                    header.appendChild(nameElem);
                    header.appendChild(categoryTag);
                    item.appendChild(header);

                    const preview = document.createElement('div');
                    preview.className = 'prompt-preview';
                    preview.textContent = prompt.text.length > 200 ?
                        prompt.text.slice(0, 200) + '...' : prompt.text;
                    item.appendChild(preview);

                    if (prompt.tags && prompt.tags.length > 0) {
                        const tagsWrap = document.createElement('div');
                        tagsWrap.className = 'prompt-tags';
                        prompt.tags.forEach(tag => {
                            const tagElem = document.createElement('span');
                            tagElem.className = 'tag';
                            tagElem.textContent = tag;
                            tagsWrap.appendChild(tagElem);
                        });
                        item.appendChild(tagsWrap);
                    }

                    categoryDiv.appendChild(item);
                });

                fragment.appendChild(categoryDiv);
            }

            container.innerHTML = '';
            container.appendChild(fragment);
        }

        insertPrompt(prompt) {
            if (!prompt || !prompt.text) return;

            // Обновляем поле ввода перед вставкой
            this.currentInputField = this.findInputField();
            if (!this.currentInputField) {
                this.showNotification('Не найдено поле ввода', 'error');
                return;
            }

            const promptText = prompt.text;

            try {
                // Для textarea
                if (this.currentInputField.tagName === 'TEXTAREA') {
                    const textarea = this.currentInputField;
                    const startPos = textarea.selectionStart;
                    const endPos = textarea.selectionEnd;

                    textarea.value = textarea.value.substring(0, startPos) +
                                   promptText +
                                   textarea.value.substring(endPos);

                    textarea.selectionStart = textarea.selectionEnd = startPos + promptText.length;
                    textarea.focus();

                    // Триггерим события
                    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
                    const changeEvent = new Event('change', { bubbles: true });
                    textarea.dispatchEvent(inputEvent);
                    textarea.dispatchEvent(changeEvent);

                }
                // Замените старый блок вставки для contenteditable
                else if (this.currentInputField.isContentEditable) {
                    this.currentInputField.focus();
                    const selection = window.getSelection();
                    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

                    if (range) {
                        range.deleteContents();
                        range.insertNode(document.createTextNode(promptText));
                        // Перемещаем курсор после вставленного текста
                        range.collapse(false);
                    } else {
                        // Резервный вариант
                        this.currentInputField.textContent += promptText;
                    }
                    // Триггерим input event
                    this.currentInputField.dispatchEvent(new Event('input', { bubbles: true }));
                }

                // Для обычных input
                else if (this.currentInputField.tagName === 'INPUT') {
                    const input = this.currentInputField;
                    const startPos = input.selectionStart;
                    const endPos = input.selectionEnd;

                    input.value = input.value.substring(0, startPos) +
                                promptText +
                                input.value.substring(endPos);

                    input.selectionStart = input.selectionEnd = startPos + promptText.length;
                    input.focus();

                    const inputEvent = new Event('input', { bubbles: true });
                    input.dispatchEvent(inputEvent);
                }

                this.showNotification(`Промпт "${prompt.name}" вставлен`, 'success');
                this.hideModal();

            } catch (error) {
                console.error('Ошибка вставки промпта:', error);
                this.showNotification('Ошибка при вставке промпта', 'error');
            }
        }

        showNotification(message, type = 'info') {
            if (typeof GM_notification === 'function') {
                GM_notification({
                    text: message,
                    title: 'ChatGPT Prompt Assistant',
                    timeout: type === 'error' ? 3000 : 2000,
                    silent: type !== 'error'
                });
            }
        }
        normalizePromptText(text) {
            if (typeof text !== 'string') return '';
            // Заменяем табы, новые строки и т.д. на стандартные
            return text
                .replace(/\t/g, '    ')  // 4 пробела вместо таба
                .replace(/\r\n|\r/g, '\n') // унифицируем переносы
                .replace(/\n{3,}/g, '\n\n'); // убираем лишние пустые строки
        }

        bindEvents() {
            this.floatingButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showModal();
            });

            const closeBtn = this.modal.querySelector('#close-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideModal();
                });
            }

            const themeToggle = this.modal.querySelector('.theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    this.toggleTheme();
                });
            }

            const searchInput = this.modal.querySelector('#prompt-search');
            const categoryFilter = this.modal.querySelector('#category-filter');
            const tagFilter = this.modal.querySelector('#tag-filter');

            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    this.renderPrompts();
                });
            }
            if (categoryFilter) {
                categoryFilter.addEventListener('change', () => {
                    this.renderPrompts();
                });
            }
            if (tagFilter) {
                tagFilter.addEventListener('change', () => {
                    this.renderPrompts();
                });
            }

            document.addEventListener('click', (e) => {
                if (this.isModalOpen && !this.modal.contains(e.target) && e.target !== this.floatingButton) {
                    this.hideModal();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isModalOpen) {
                    e.preventDefault();
                    this.hideModal();
                }
            });
        }

        toggleTheme() {
            const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            this.applyTheme(newTheme);
            this.saveTheme(newTheme);
        }

        setupMutationObserver() {
            const observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        const input = this.findInputField();
                        if (input && input !== this.currentInputField) {
                            this.currentInputField = input;
                        }
                    }
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['contenteditable', 'style', 'class']
            });
        }
    }

    let assistant;

    function initializeAssistant() {
        if (!assistant) {
            assistant = new ChatGPTPromptAssistantPro();
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
            e.preventDefault();
            if (assistant) {
                assistant.showModal();
            }
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAssistant);
    } else {
        initializeAssistant();
    }
})();