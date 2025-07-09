// Строгий JavaScript для официального дизайна

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Состояние приложения
let appState = {
    isOnline: false,
    stats: {
        pending: 0,
        approved: 0
    },
    searchResults: []
};

// Проверка доступности бота
async function checkBotStatus() {
    try {
        // Отправляем запрос на проверку статуса
        tg.sendData(JSON.stringify({
            action: 'ping'
        }));
        
        // Устанавливаем таймер для проверки ответа
        setTimeout(() => {
            if (!appState.isOnline) {
                showOfflineState();
            }
        }, 5000);
        
    } catch (error) {
        console.error('Ошибка проверки статуса:', error);
        showOfflineState();
    }
}

// Показать состояние оффлайн
function showOfflineState() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="header">
            <h1>База данных мошенников</h1>
            <p>Система защиты от мошеннических действий</p>
        </div>
        
        <div class="error-state">
            <h3>Сервис временно недоступен</h3>
            <p>Бот находится в режиме обслуживания. Попробуйте позже.</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Anti-Scam Database</p>
        </div>
    `;
}

// Функция поиска мошенников
function searchScammer() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        showNotification('Введите данные для поиска', 'error');
        return;
    }

    if (!appState.isOnline) {
        showNotification('Сервис недоступен', 'error');
        return;
    }

    showLoading();
    
    // Отправляем запрос в Telegram бот
    tg.sendData(JSON.stringify({
        action: 'search',
        query: query
    }));
}

// Функция показа результатов поиска
function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    
    if (!results || results.length === 0) {
        resultsDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>Результаты не найдены</h3>
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
                    <div class="scammer-name">${escapeHtml(result.username)}</div>
                    <div class="scammer-id">ID: ${result.user_id}</div>
                </div>
                <div class="result-description">${escapeHtml(result.description)}</div>
                <div class="result-meta">
                    <span>Дата: ${formatDate(result.date)}</span>
                    ${result.hasEvidence 
                        ? `<button class="evidence-btn" onclick="viewEvidence(${result.id})">Показать доказательства</button>`
                        : '<span style="color: #666;">Доказательства отсутствуют</span>'
                    }
                </div>
            </div>
        `;
    });

    resultsDiv.innerHTML = html;
}

// Функция просмотра доказательств
function viewEvidence(reportId) {
    if (!appState.isOnline) {
        showNotification('Сервис недоступен', 'error');
        return;
    }

    tg.sendData(JSON.stringify({
        action: 'view_evidence',
        report_id: reportId
    }));
}

// Функция подачи жалобы
function submitReport() {
    if (!appState.isOnline) {
        showNotification('Сервис недоступен', 'error');
        return;
    }

    tg.sendData(JSON.stringify({
        action: 'submit_report'
    }));
}

// Функция загрузки статистики
function loadStats() {
    if (!appState.isOnline) {
        return;
    }

    tg.sendData(JSON.stringify({
        action: 'get_stats'
    }));
}

// Функция показа загрузки
function showLoading() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Выполняется поиск...</p>
        </div>
    `;
}

// Функция показа ошибки
function showError(message = 'Произошла ошибка') {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="error-state">
            <h3>Ошибка</h3>
            <p>${message}</p>
        </div>
    `;
}

// Функция показа уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Функция обновления статистики
function updateStats(stats) {
    if (stats) {
        document.getElementById('pendingCount').textContent = stats.pending || 0;
        document.getElementById('approvedCount').textContent = stats.approved || 0;
        appState.stats = stats;
    }
}

// Функция показа доказательств
function showEvidence(evidence) {
    if (evidence && evidence.url) {
        window.open(evidence.url, '_blank');
    } else {
        showNotification('Доказательства недоступны', 'error');
    }
}

// Функция экранирования HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Функция форматирования даты
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// Обработка данных от Telegram
function handleTelegramData(data) {
    try {
        switch (data.action) {
            case 'pong':
                appState.isOnline = true;
                loadStats();
                break;
                
            case 'search_results':
                appState.searchResults = data.results || [];
                displayResults(data.results);
                break;
                
            case 'stats':
                updateStats(data.stats);
                break;
                
            case 'show_evidence':
                showEvidence(data.evidence);
                break;
                
            case 'error':
                showError(data.message || 'Произошла ошибка');
                break;
                
            case 'notification':
                showNotification(data.message, data.type || 'info');
                break;
                
            default:
                console.log('Неизвестное действие:', data.action);
        }
    } catch (error) {
        console.error('Ошибка обработки данных:', error);
        showError('Ошибка обработки данных');
    }
}

// Обработка Enter в поле поиска
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchScammer();
            }
        });
    }
    
    // Проверяем статус бота при загрузке
    checkBotStatus();
});

// Обработка сообщений от Telegram
window.addEventListener('message', function(event) {
    if (event.data) {
        try {
            const data = JSON.parse(event.data);
            handleTelegramData(data);
        } catch (error) {
            console.error('Ошибка обработки данных:', error);
            showError('Ошибка обработки данных');
        }
    }
});

// Экспорт функций для использования в HTML
window.searchScammer = searchScammer;
window.viewEvidence = viewEvidence;
window.submitReport = submitReport;
window.showNotification = showNotification; 