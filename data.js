const KEDO_DESCRIPTION = `Описание сервиса
Кадровое ЭДО от «Контур» — это современный сервис для перевода кадровых документов в электронный вид. Сервис позволяет оптимизировать работу с документами, сократить время на обработку и повысить безопасность хранения данных.`;

const KEDO_BENEFITS = `Выгоды использования
БЕССРОЧНОЕ ХРАНЕНИЕ
• Документы сохраняются навсегда, даже после окончания лицензии
• Доступ к архиву в любое время через логин/пароль или телефон

МАКСИМАЛЬНАЯ БЕЗОПАСНОСТЬ
• Тройное резервирование серверов
• Подтвержденная внешним аудитом защита данных
• Автоматическая проверка действительности ЭЦП
• Соответствие требованиям ФЗ-63

ЭКОНОМИЯ ВРЕМЕНИ
• Внедрение за 1 час благодаря экспертам
• Отправка документов за 1 минуту вместо часов на курьерскую доставку
• Автоматизация рутинных процессов

УДОБСТВО РАБОТЫ
• Интеграция с 1С в едином интерфейсе
• Готовые шаблоны документов и автозаполнение
• Маршруты согласования любой сложности
• Уведомления о задачах трехуровневой системой оповещений

ЭКСПЕРТНАЯ ПОДДЕРЖКА
• Бесплатное обучение для всех сотрудников
• Личный менеджер и выделенный эксперт
• Официальная переписка по проекту
• 12 лет опыта внедрения (более 2500 успешных проектов)

УНИКАЛЬНЫЕ ВОЗМОЖНОСТИ
• Аккредитованный Удостоверяющий Центр
• Выпуск НЭП/КЭП прямо в системе
• Интеграция с Госуслугами
• Планируемая экосистема КЭДО+Диадок+Экстерн

ФУНКЦИОНАЛ СИСТЕМЫ
• Поиск по множеству параметров
• Различные способы авторизации
• Работа с подразделениями из 1С
• Автоматическое обновление справочников
• Полный функционал в едином окне

ЭТО ЭФФЕКТИВНО
• Сотрудники фокусируются на основных задачах
• Уведомления о запланированном отпуске за 14 дней
• Работа с расчетными листами
• Загрузка документов с любого устройства`;

const ABOUT_US = `О компании
Компания «Контур» — надежный партнер для бизнеса, предоставляющий современные IT-решения и сервисы для комфортной работы с документами, отчетностью и юридическими вопросами. Мы стремимся делать сложные процессы проще, экономя ваше время и ресурсы. Наша команда создает удобные инструменты, которые помогают организациям любого масштаба работать эффективнее.
Мы гордимся тем, что о нас говорят как о профессионалах, на которых можно положиться. Доверие клиентов и постоянное развитие — основа нашей философии.
Подробнее на нашем сайте (https://kontur.ru/).`;

const ATTACHMENTS = {
    "Счёт на оплату": "Счёт на оплату",
    "Презентация КЭДО, краткая версия": "Презентация КЭДО, краткая версия",
    "Дорожная карта внедрения КЭДО": "Дорожная карта внедрения КЭДО",
    "Презентация 1С": "Презентация 1С",
    "Презентация для сервиса сотрудников": "Презентация для сервиса сотрудников",
    "Презентация по ВЭДО": "Презентация по ВЭДО"
};

const LINKS = {
    "Лицензионный договор": "https://www.diadoc.ru/docs/laws/contract_offer",
    "Инструкция": "https://support.kontur.ru/kedo",
    "Презентация модуля интеграции с 1С": "https://kontur.ktalk.ru/recordings/WOFsG9ddJAdIsRijEm1h",
    "Видео-презентация функционала для сотрудников": "https://kontur.ktalk.ru/recordings/6tSB5MeYfJOsc9I14fK4"
};

const KEDO = {
    "Лицензия": {"base_price": 2000, "max_discount": 85, "required": true, "unit": "сотрудников", "unit_price": "руб./год"},
    "НЭП": {"base_price": 500, "max_discount": 100, "required": false, "unit": "сотрудников", "unit_price": "руб./год"},
    "Модуль интеграции": {"base_price": 13700, "max_discount": 20, "required": false, "unit": "баз", "unit_price": "руб./год"},
    "Доработка расчётных листов": {"base_price": 14000, "max_discount": 20, "required": false, "unit": "баз", "unit_price": "руб. единоразово"},
    "Доработка архива": {"base_price": 21000, "max_discount": 20, "required": false, "unit": "баз", "unit_price": "руб. единоразово"},
    "Настройка маршрутов": {"base_price": 7000, "max_discount": 50, "required": false, "unit": "пакетов", "unit_price": "руб. за услугу"},
    "СМС-уведомления": {"base_price": 230, "max_discount": 20, "required": false, "unit": "100 шт.", "unit_price": "руб. за 100 шт."}
};

function calculateBaseCost(quantities) {
    let total = 0;
    for (const [item, qty] of Object.entries(quantities)) {
        total += KEDO[item].base_price * qty;
    }
    return total;
}

function calculateDiscountCost(quantities, discounts) {
    let total = 0;
    for (const [item, qty] of Object.entries(quantities)) {
        const base_price = KEDO[item].base_price;
        const discount = Math.min(discounts[item] || 0, KEDO[item].max_discount);
        const discounted_price = base_price * (1 - discount / 100);
        total += discounted_price * qty;
    }
    return total;
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " руб.";
} 