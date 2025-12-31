// Создание снежинок
        function createSnowflakes() {
            const snowflakesContainer = document.getElementById('snowflakes');
            const snowflakeCount = 50;
            
            for (let i = 0; i < snowflakeCount; i++) {
                const snowflake = document.createElement('div');
                snowflake.innerHTML = '❄';
                snowflake.style.position = 'absolute';
                snowflake.style.left = Math.random() * 100 + 'vw';
                snowflake.style.top = Math.random() * 100 + 'vh';
                snowflake.style.fontSize = Math.random() * 20 + 10 + 'px';
                snowflake.style.opacity = Math.random() * 0.5 + 0.3;
                snowflake.style.animation = `fall ${Math.random() * 5 + 5}s linear infinite`;
                snowflake.style.animationDelay = Math.random() * 5 + 's';
                
                // Добавляем анимацию падения
                const style = document.createElement('style');
                style.innerHTML = `
                    @keyframes fall {
                        0% {
                            transform: translateY(-10vh) rotate(0deg);
                        }
                        100% {
                            transform: translateY(100vh) rotate(360deg);
                        }
                    }
                `;
                document.head.appendChild(style);
                
                snowflakesContainer.appendChild(snowflake);
            }
        }
        
        // Функция обновления отсчета
        function updateCountdown() {
            const now = new Date();
            const currentYear = now.getFullYear();
            const nextYear = currentYear + 1;
            const newYearDate = new Date(`January 1, ${nextYear} 00:00:00`);
            
            // Разница во времени в миллисекундах
            const timeDiff = newYearDate.getTime() - now.getTime();
            
            // Если Новый год уже наступил
            if (timeDiff <= 0) {
                document.getElementById('new-year-message').style.display = 'block';
                document.querySelector('.countdown-title').textContent = 'С Новым годом! 🎉';
                document.getElementById('days').textContent = '00';
                document.getElementById('hours').textContent = '00';
                document.getElementById('minutes').textContent = '00';
                document.getElementById('seconds').textContent = '00';
                return;
            }
            
            // Вычисление дней, часов, минут и секунд
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            // Обновление значений на странице
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
            
            // Обновление прогресса года
            updateYearProgress(now);
            
            // Обновление текущей даты в футере
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('current-date').textContent = now.toLocaleDateString('ru-RU', options);
        }
        
        // Функция обновления прогресса года
        function updateYearProgress(now) {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
            const totalYearTime = endOfYear.getTime() - startOfYear.getTime();
            const elapsedTime = now.getTime() - startOfYear.getTime();
            
            const progressPercent = (elapsedTime / totalYearTime) * 100;
            
            document.getElementById('year-progress').style.width = progressPercent + '%';
            document.getElementById('progress-percent').textContent = progressPercent.toFixed(2) + '%';
        }
        
        // Инициализация
        document.addEventListener('DOMContentLoaded', function() {
            createSnowflakes();
            updateCountdown();
            
            // Обновление каждую секунду
            setInterval(updateCountdown, 1000);
        });