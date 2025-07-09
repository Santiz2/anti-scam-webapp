// Основной JavaScript файл для веб-приложения

class AntiScamApp {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.init();
    }

    init() {
        // Инициализация Telegram WebApp
        this.tg.expand();
        this.tg.ready();
        
        // Установка темы
        this.setTheme();
        
        // Загрузка данных
        this.loadStats();
        this.setupEventListeners();
    }

    setTheme() {
        // Установка цветовой схемы
        this.tg.setHeaderColor('#667eea');
        this.tg.setBackgroundColor('#667eea');
    }

    setupEventListeners() {
        // Поиск по Enter
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchScammer();
                }
            });
        }

        // Обработка кликов по кнопкам
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('search-btn')) {
                this.searchScammer();
            } else if (e.target.classList.contains('evidence-btn')) {
                const reportId = e.target.dataset.reportId;
                this.viewEvidence(reportId);
            } else if (e.target.classList.contains('submit-btn')) {
                this.submitReport();
            }
        });
    }

    async loadStats() {
        try {
            // Здесь будет API запрос к вашему боту
            // Пока используем мок данные
            const stats = {
                pending: 5,
                approved: 127,
                rejected: 12,
                total: 144
            };

            this.updateStats(stats);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            this.showNotification('Ошибка загрузки статистики', 'error');
        }
    }

    updateStats(stats) {
        const pendingElement = document.getElementById('pendingCount');
        const approvedElement = document.getElementById('approvedCount');

        if (pendingElement) pendingElement.textContent = stats.pending;
        if (approvedElement) approvedElement.textContent = stats.approved;
    }

    async searchScammer() {
        const query = document.getElementById('searchInput')?.value.trim();
        
        if (!query) {
            this.showNotification('Введите username или ID для поиска', 'warning');
            return;
        }

        this.showLoading();

        try {
            // Здесь будет API запрос к вашему боту
            // Пока используем мок данные
            await this.simulateSearch(query);
        } catch (error) {
            console.error('Ошибка поиска:', error);
            this.showNotification('Ошибка поиска', 'error');
            this.hideLoading();
        }
    }

    async simulateSearch(query) {
        // Имитация задержки API
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockResults = this.getMockResults(query);
        this.displayResults(mockResults);
    }

    getMockResults(query) {
        // Мок данные для демонстрации
        const allResults = [
            {
                id: 1,
                username: '@scammer123',
                user_id: '123456789',
                description: 'Обманул на 5000 рублей, обещал продать iPhone, но заблокировал после перевода денег',
                date: '15.12.2024',
                hasEvidence: true,
                evidenceType: 'photo'
            },
            {
                id: 2,
                username: '@fake_seller',
                user_id: '987654321',
                description: 'Продавал несуществующие билеты на концерт, забрал деньги и исчез',
                date: '10.12.2024',
                hasEvidence: false
            },
            {
                id: 3,
                username: '@crypto_scam',
                user_id: '555666777',
                description: 'Предлагал инвестиции в криптовалюту, обещал 200% прибыли, но забрал деньги',
                date: '08.12.2024',
                hasEvidence: true,
                evidenceType: 'video'
            }
        ];

        // Фильтрация по запросу
        return allResults.filter(result => 
            result.username.toLowerCase().includes(query.toLowerCase()) ||
            result.user_id.includes(query) ||
            result.description.toLowerCase().includes(query.toLowerCase())
        );
    }

    displayResults(results) {
        const resultsDiv = document.getElementById('results');
        
        if (!results || results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="no-results">
                    <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте другой запрос</p>
                </div>
            `;
            return;
        }

        let html = '';
        results.forEach(result => {
            html += `
                <div class="result-card" data-report-id="${result.id}">
                    <div class="result-header">
                        <div class="scammer-name">${result.username}</div>
                        <div class="scammer-id">ID: ${result.user_id}</div>
                    </div>
                    <div class="result-description">${result.description}</div>
                    <div class="result-meta">
                        <span>📅 ${result.date}</span>
                        ${result.hasEvidence 
                            ? `<button class="evidence-btn" data-report-id="${result.id}">📸 Доказательства (${result.evidenceType})</button>`
                            : '<span style="color: #999;">📸 Нет доказательств</span>'
                        }
                    </div>
                </div>
            `;
        });

        resultsDiv.innerHTML = html;
    }

    async viewEvidence(reportId) {
        try {
            // Здесь будет API запрос для получения доказательств
            this.showNotification('Функция просмотра доказательств будет доступна в полной версии', 'info');
            
            // Отправляем данные в Telegram
            this.tg.sendData(JSON.stringify({
                action: 'view_evidence',
                report_id: reportId
            }));
        } catch (error) {
            console.error('Ошибка просмотра доказательств:', error);
            this.showNotification('Ошибка загрузки доказательств', 'error');
        }
    }

    submitReport() {
        // Отправляем данные в Telegram для открытия формы подачи заявки
        this.tg.sendData(JSON.stringify({
            action: 'submit_report'
        }));
        
        this.showNotification('Открываем форму подачи заявки...', 'info');
    }

    showLoading() {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Поиск скамеров...</p>
            </div>
        `;
    }

    hideLoading() {
        // Убираем индикатор загрузки
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Показываем уведомление
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Убираем уведомление через 3 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Метод для обработки данных от Telegram
    handleTelegramData(data) {
        try {
            const parsedData = JSON.parse(data);
            
            switch (parsedData.action) {
                case 'update_stats':
                    this.updateStats(parsedData.stats);
                    break;
                case 'search_results':
                    this.displayResults(parsedData.results);
                    break;
                case 'show_evidence':
                    this.displayEvidence(parsedData.evidence);
                    break;
                default:
                    console.log('Неизвестное действие:', parsedData.action);
            }
        } catch (error) {
            console.error('Ошибка обработки данных от Telegram:', error);
        }
    }

    displayEvidence(evidence) {
        // Создаем модальное окно для показа доказательств
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>📸 Доказательства</h3>
                <p>Тип: ${evidence.type}</p>
                <p>Размер: ${evidence.size}</p>
                <button class="action-btn" onclick="this.parentElement.parentElement.remove()">Закрыть</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    // Метод для отправки данных в Telegram
    sendToTelegram(data) {
        this.tg.sendData(JSON.stringify(data));
    }

    // Метод для закрытия веб-приложения
    closeApp() {
        this.tg.close();
    }

    // Метод для показа алерта
    showAlert(message) {
        this.tg.showAlert(message);
    }

    // Метод для показа подтверждения
    showConfirm(message, callback) {
        this.tg.showConfirm(message, callback);
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.antiScamApp = new AntiScamApp();
});

// Обработка сообщений от Telegram
window.addEventListener('message', (event) => {
    if (window.antiScamApp && event.data) {
        window.antiScamApp.handleTelegramData(event.data);
    }
});

// Экспорт для использования в HTML
window.searchScammer = function() {
    if (window.antiScamApp) {
        window.antiScamApp.searchScammer();
    }
};

window.viewEvidence = function(reportId) {
    if (window.antiScamApp) {
        window.antiScamApp.viewEvidence(reportId);
    }
};

window.submitReport = function() {
    if (window.antiScamApp) {
        window.antiScamApp.submitReport();
    }
}; 