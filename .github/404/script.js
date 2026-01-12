// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    // Анимация появления элементов
    const animatedElements = document.querySelectorAll('.container > *:not(.floating-elements)');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '1';
    });

    // Создание дополнительных плавающих элементов
    const floatingElements = document.querySelector('.floating-elements');
    for (let i = 0; i < 5; i++) {
        const element = document.createElement('div');
        element.className = 'floating-element';

        // Случайные размеры и позиции
        const size = Math.random() * 60 + 40;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const delay = Math.random() * 10;

        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        element.style.top = `${top}%`;
        element.style.left = `${left}%`;
        element.style.animationDelay = `-${delay}s`;

        floatingElements.appendChild(element);
    }
});
