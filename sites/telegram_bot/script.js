// Конфигурация
const CONFIG = {
    TELEGRAM_PARAMS: ['message']
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function () {
    // Определяем, открыто ли в Telegram WebApp
    detectTelegramWebApp();

    // Проверяем параметры URL (для Telegram бота)
    checkUrlParams();

    // Анимация появления
    animateElements();
});

// Функция определения Telegram WebApp
function detectTelegramWebApp() {
    // Проверяем, открыто ли в Telegram WebView
    if (window.Telegram && window.Telegram.WebApp) {
        document.body.classList.add('tg-app');

        // Применяем тему Telegram
        const theme = window.Telegram.WebApp.colorScheme;
        document.body.classList.add(theme === 'dark' ? 'tg-theme-dark' : 'tg-theme-light');

        // Расширяем на весь экран
        window.Telegram.WebApp.expand();

        // Обработчик кнопки закрытия
        document.getElementById('tgCloseBtn').addEventListener('click', function () {
            window.Telegram.WebApp.close();
        });
    }
}

// Проверка параметров URL (для Telegram бота)
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);

    // Проверяем наличие параметров
    CONFIG.TELEGRAM_PARAMS.forEach(param => {
        const value = urlParams.get(param);

        if (value) {
            switch (param) {
                case 'message':
                    document.getElementById('message').value = decodeURIComponent(value);
                    break;
            }
        }
    });

    // Автоотправка, если есть параметр auto=1
    if (urlParams.get('auto') === '1' && document.getElementById('message').value) {
        setTimeout(() => {
            sendToDiscord();
        }, 1000);
    }
}

// Инициализация обработчиков событий
function initEventListeners() {
    // Кнопка отправки
    document.getElementById('sendBtn').addEventListener('click', sendToDiscord);

    // Кнопка предпросмотра
    document.getElementById('previewBtn').addEventListener('click', showPreview);

    // Отправка по Ctrl+Enter
    document.getElementById('message').addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') {
            sendToDiscord();
        }
    });
}

// Отправка сообщения в Discord
async function sendToDiscord() {
    const webhookUrl = "https://discord.com/api/webhooks/1460236798499225673/LsXBtRwlvDDhMzYX2JYI1c_KI0wIC2QewRtdPWfhbQ0PJPOTEi1aL-56HD8eWzeqBQBA";
    const username = window.Telegram.WebApp.username;
    const avatarUrl = window.Telegram.WebApp.photo_url;
    const message = document.getElementById('message').value.trim();

    // Валидация
    if (!message) {
        showStatus('Введите сообщение', 'error');
        return;
    }

    // Отключаем кнопку
    const sendBtn = document.getElementById('sendBtn');
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    sendBtn.disabled = true;

    // Формируем данные для отправки
    const payload = {
        content: message
    };

    if (username) {
        payload.username = username;
    }

    if (avatarUrl) {
        payload.avatar_url = avatarUrl;
    }

    try {
        // Отправляем запрос
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showStatus('Сообщение успешно отправлено в Discord!', 'success');

            // Добавляем в историю
            addToHistory(message, true);

            // Очищаем поле сообщения
            document.getElementById('message').value = '';

            // Скрываем предпросмотр
            document.getElementById('previewCard').style.display = 'none';

            // Сохраняем данные
            saveToStorage();

            // Если в Telegram WebApp, отправляем feedback
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');

                // Закрываем через 2 секунды, если был параметр auto
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('auto') === '1') {
                    setTimeout(() => {
                        window.Telegram.WebApp.close();
                    }, 2000);
                }
            }
        } else {
            const errorText = await response.text();
            showStatus(`Ошибка отправки: ${response.status} ${response.statusText}`, 'error');
            console.error('Discord API Error:', errorText);

            // Добавляем в историю как неудачную
            addToHistory(`Ошибка: ${message.substring(0, 50)}...`, false);
        }
    } catch (error) {
        showStatus(`Ошибка сети: ${error.message}`, 'error');
        console.error('Network Error:', error);

        // Добавляем в историю как неудачную
        addToHistory(`Сеть: ${message.substring(0, 50)}...`, false);
    } finally {
        // Восстанавливаем кнопку
        sendBtn.innerHTML = originalText;
        sendBtn.disabled = false;
    }
}

// Предпросмотр сообщения
function showPreview() {
    const message = document.getElementById('message').value.trim();
    const username = document.getElementById('username').value.trim() || 'Пользователь';

    if (!message) {
        showStatus('Введите сообщение для предпросмотра', 'info');
        return;
    }

    const previewCard = document.getElementById('previewCard');
    const previewContent = document.getElementById('previewContent');

    // Простая обработка Markdown для предпросмотра
    let previewText = message
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<s>$1</s>')
        .replace(/\n/g, '<br>');

    previewContent.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <strong>${username}</strong>
                </div>
                <div>${previewText}</div>
            `;

    previewCard.style.display = 'block';
    previewCard.style.animation = 'fadeIn 0.3s ease';
}

// Показать статус
function showStatus(text, type = 'info') {
    const statusElement = document.getElementById('statusMessage');
    const statusText = document.getElementById('statusText');

    // Устанавливаем текст и тип
    statusText.textContent = text;
    statusElement.className = `status-message ${type}`;

    // Показываем
    statusElement.style.display = 'flex';
    statusElement.style.animation = 'fadeIn 0.3s ease';

    // Скрываем через 5 секунд
    setTimeout(() => {
        statusElement.style.opacity = '0';
        statusElement.style.transform = 'translateY(-10px)';
        statusElement.style.transition = 'all 0.3s ease';

        setTimeout(() => {
            statusElement.style.display = 'none';
            statusElement.style.opacity = '1';
            statusElement.style.transform = 'translateY(0)';
        }, 300);
    }, 5000);
}

// Анимация элементов при загрузке
function animateElements() {
    const elements = document.querySelectorAll('.card, .header, .footer');

    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';

        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 * index);
    });
}

// Генерация URL для Telegram бота
function generateTelegramUrl() {
    const webhookUrl = encodeURIComponent(document.getElementById('webhookUrl').value.trim());
    const username = encodeURIComponent(document.getElementById('username').value.trim());
    const message = encodeURIComponent(document.getElementById('message').value.trim());
    const avatarUrl = encodeURIComponent(document.getElementById('avatarUrl').value.trim());

    // Формируем URL для быстрого доступа из Telegram
    const currentUrl = window.location.origin + window.location.pathname;
    const params = [];

    if (webhookUrl) params.push(`webhook=${webhookUrl}`);
    if (username) params.push(`username=${username}`);
    if (message) params.push(`message=${message}`);
    if (avatarUrl) params.push(`avatar=${avatarUrl}`);

    return params.length > 0 ? `${currentUrl}?${params.join('&')}` : currentUrl;
}

// Для отладки: выводим сгенерированный URL в консоль
console.log('Для Telegram бота используйте URL:', generateTelegramUrl());