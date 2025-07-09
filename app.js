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
        // Устанавливаем темную тему
        this.tg.setHeaderColor('#1a1a2e');
        this.tg.setBackgroundColor('#1a1a2e');
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
            // Запрашиваем статистику у бота
            this.tg.sendData(JSON.stringify({
                action: 'get_stats'
            }));
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            this.showNotification('Ошибка загрузки статистики', 'error');
        }
    }

    updateStats(stats) {
        const pendingElement = document.getElementById('pendingCount');
        const approvedElement = document.getElementById('approvedCount');

        if (pendingElement) pendingElement.textContent = stats.pending || 0;
        if (approvedElement) approvedElement.textContent = stats.approved || 0;
    }

    async searchScammer() {
        const query = document.getElementById('searchInput')?.value.trim();
        
        if (!query) {
            this.showNotification('Введите username или ID для поиска', 'warning');
            return;
        }

        this.showLoading();

        try {
            // Отправляем запрос в Telegram бот
            this.tg.sendData(JSON.stringify({
                action: 'search',
                query: query
            }));
        } catch (error) {
            console.error('Ошибка поиска:', error);
            this.showNotification('Ошибка поиска', 'error');
            this.hideLoading();
        }
    }

    displayResults(results) {
        const resultsDiv = document.getElementById('results');
        
        if (!results || results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
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
                            : '<span style="color: rgba(255,255,255,0.4);">📸 Нет доказательств</span>'
                        }
                    </div>
                </div>
            `;
        });

        resultsDiv.innerHTML = html;
    }

    async viewEvidence(reportId) {
        try {
            // Отправляем запрос на просмотр доказательств
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
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#667eea'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 1000;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Показываем уведомление
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Убираем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
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
                case 'search_results':
                    this.displayResults(parsedData.results);
                    break;
                case 'stats':
                    this.updateStats(parsedData.stats);
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
        if (evidence && evidence.url) {
            // Открываем доказательство в новом окне
            window.open(evidence.url, '_blank');
        } else {
            this.showNotification('Доказательства недоступны', 'error');
        }
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