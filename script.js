// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Заполняем блоки вложений
    const attachmentsDiv = document.getElementById('attachments');
    for (const [key, value] of Object.entries(ATTACHMENTS)) {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" name="attachment_${key.replace(/ /g, '_')}" onchange="updatePreview()">${value}`;
        attachmentsDiv.appendChild(label);
        attachmentsDiv.appendChild(document.createElement('br'));
    }

    // Заполняем блоки ссылок
    const linksDiv = document.getElementById('links');
    for (const [key, value] of Object.entries(LINKS)) {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" name="link_${key.replace(/ /g, '_')}" onchange="updatePreview()">${key}`;
        linksDiv.appendChild(label);
        linksDiv.appendChild(document.createElement('br'));
    }

    // Заполняем блоки ценообразования
    const pricingDiv = document.getElementById('pricing');
    for (const [item, data] of Object.entries(KEDO)) {
        const div = document.createElement('div');
        div.className = 'pricing-item';
        div.innerHTML = `
            <label>
                ${item} (${data.base_price} ${data.unit_price}):
                <input type="number" name="${item}" min="0" value="0" onchange="updatePreview()">
                <input type="number" class="discount-input" name="discount_${item}" max="${data.max_discount}" placeholder="Скидка (%)" min="0" onchange="validateDiscount(this); updatePreview()">
                <div class="max-discount">Максимальная скидка: ${data.max_discount}%</div>
            </label>`;
        pricingDiv.appendChild(div);
    }

    // Инициализация порядка блоков
    updateBlockOrder();
});

// Валидация скидки
function validateDiscount(input) {
    const item = input.name.replace('discount_', '');
    const maxDiscount = KEDO[item].max_discount;
    if (parseInt(input.value) > maxDiscount) {
        input.value = maxDiscount;
        alert(`Максимальная скидка для "${item}" составляет ${maxDiscount}%`);
    }
}

// Функции для drag-and-drop
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    const dropTarget = ev.target.closest('li');
    
    if (dropTarget && dropTarget !== draggedElement) {
        const list = document.getElementById('block-list');
        const items = Array.from(list.children);
        const draggedIndex = items.indexOf(draggedElement);
        const dropIndex = items.indexOf(dropTarget);
        
        if (draggedIndex < dropIndex) {
            list.insertBefore(draggedElement, dropTarget.nextSibling);
        } else {
            list.insertBefore(draggedElement, dropTarget);
        }
        
        updateBlockOrder();
        updatePreview();
    }
}

function updateBlockOrder() {
    const blockList = document.getElementById('block-list');
    const blocks = Array.from(blockList.children).map(li => li.id);
    document.getElementById('block-order').value = blocks.join(',');
}

// Обновление предпросмотра
function updatePreview() {
    const form = document.getElementById('kpForm');
    const formData = new FormData(form);
    const previewText = document.getElementById('previewText');
    
    // Проверяем, есть ли хотя бы одно заполненное поле
    let hasContent = false;
    for (const [key, value] of formData.entries()) {
        if (value && key !== 'block_order') {
            hasContent = true;
            break;
        }
    }

    if (!hasContent) {
        previewText.className = 'preview-placeholder';
        previewText.textContent = 'Заполните форму слева, чтобы увидеть предпросмотр';
        return;
    }

    previewText.className = '';
    
    // Сбор данных о количествах и скидках
    const quantities = {};
    const discounts = {};
    for (const [item, data] of Object.entries(KEDO)) {
        quantities[item] = parseInt(formData.get(item) || 0);
        discounts[item] = parseFloat(formData.get(`discount_${item}`) || 0);
    }

    // Расчет стоимости
    const base_cost = calculateBaseCost(quantities);
    const discount_cost = calculateDiscountCost(quantities, discounts);
    const benefit = roundNumber(base_cost - discount_cost);

    // Форматирование даты
    const discount_date = formData.get('discount_date') 
        ? new Date(formData.get('discount_date')).toLocaleDateString('ru-RU')
        : '';

    // Сбор коммерческого блока
    let commercial_lines = ["Коммерческое предложение", "Из чего складывается базовая стоимость:"];
    for (const [item, qty] of Object.entries(quantities)) {
        if (qty > 0) {
            const data = KEDO[item];
            commercial_lines.push(`${item} на 1 ${data.unit} - ${data.base_price} ${data.unit_price}`);
        }
    }
    commercial_lines.push("Расчёт:");
    for (const [item, qty] of Object.entries(quantities)) {
        if (qty > 0) {
            const base_price = KEDO[item].base_price;
            commercial_lines.push(`- ${item} (${qty} ${KEDO[item].unit}): ${formatPrice(base_price * qty)}`);
        }
    }
    commercial_lines.push(`Базовая стоимость системы: ${formatPrice(base_cost)}`);
    commercial_lines.push("");
    commercial_lines.push("Стоимость с учётом скидки:");
    for (const [item, qty] of Object.entries(quantities)) {
        if (qty > 0 && discounts[item] > 0) {
            const base_price = KEDO[item].base_price;
            const discounted_price = roundNumber(base_price * (1 - discounts[item] / 100));
            commercial_lines.push(`- ${item} (${qty} ${KEDO[item].unit}, скидка ${discounts[item]}%): ${formatPrice(discounted_price * qty)}`);
        }
    }
    commercial_lines.push(`Итого со скидкой: ${formatPrice(discount_cost)}`);
    commercial_lines.push(`Общая выгода: ${formatPrice(benefit)}`);
    if (discount_date) {
        commercial_lines.push(`Срок действия скидки: ${discount_date}`);
    }
    const commercial = commercial_lines.join('\n');

    // Сбор вложений и ссылок
    const selected_attachments = [];
    const selected_links = [];
    for (const [key, value] of Object.entries(ATTACHMENTS)) {
        if (formData.get(`attachment_${key.replace(/ /g, '_')}`)) {
            selected_attachments.push(value);
        }
    }
    for (const [key, value] of Object.entries(LINKS)) {
        if (formData.get(`link_${key.replace(/ /g, '_')}`)) {
            selected_links.push(`${key}: ${value}`);
        }
    }

    let attachments_block = selected_attachments.length > 0 
        ? "Во вложениях:\n" + selected_attachments.map(item => `- ${item}`).join('\n')
        : "";
    if (selected_links.length > 0) {
        attachments_block += (attachments_block ? "\n\n" : "") + "Ссылки:\n" + selected_links.map(item => `- ${item}`).join('\n');
    }

    // Сбор всех блоков
    const blocks = {
        "greeting": formData.get('fio') ? `Добрый день, ${formData.get('fio')}!` : "",
        "agreement": formData.get('agreement_discount') 
            ? `Как и договаривались, направляю Вам коммерческое предложение по Кадровому ЭДО. Согласовал индивидуально для Вас скидку в размере ${formData.get('discount_value')}%.`
            : "Как и договаривались, направляю Вам коммерческое предложение по Кадровому ЭДО.",
        "attachments": attachments_block,
        "about": formData.get('include_about') ? ABOUT_US : "",
        "description": formData.get('include_description') ? KEDO_DESCRIPTION : "",
        "commercial": commercial,
        "benefits": KEDO_BENEFITS + (formData.get('custom_benefit') ? `\n- ${formData.get('custom_benefit')}` : "")
    };

    // Сбор КП в правильном порядке
    const block_order = formData.get('block_order').split(',');
    let kp_text = "";
    
    if (blocks.greeting) {
        kp_text += blocks.greeting + "\n\n";
    }
    
    if (blocks.agreement) {
        kp_text += blocks.agreement + "\n\n";
    }
    
    if (blocks.attachments) {
        kp_text += blocks.attachments + "\n\n";
    }
    
    if (blocks.about) {
        kp_text += blocks.about + "\n\n";
    }
    
    if (blocks.description) {
        kp_text += blocks.description + "\n\n";
    }
    
    kp_text += block_order.map(block => blocks[block]).filter(Boolean).join('\n\n');

    // Отображение предпросмотра
    previewText.textContent = kp_text || 'Заполните форму слева, чтобы увидеть предпросмотр';
}

// Генерация КП
function generateKP() {
    const form = document.getElementById('kpForm');
    const formData = new FormData(form);
    
    // Сбор данных о количествах и скидках
    const quantities = {};
    const discounts = {};
    for (const [item, data] of Object.entries(KEDO)) {
        quantities[item] = parseInt(formData.get(item) || 0);
        discounts[item] = parseFloat(formData.get(`discount_${item}`) || 0);
    }

    // Расчет стоимости
    const base_cost = calculateBaseCost(quantities);
    const discount_cost = calculateDiscountCost(quantities, discounts);
    const benefit = roundNumber(base_cost - discount_cost);

    // Форматирование даты
    const discount_date = new Date(formData.get('discount_date')).toLocaleDateString('ru-RU');

    // Сбор коммерческого блока
    let commercial_lines = ["Коммерческое предложение", "Из чего складывается базовая стоимость:"];
    for (const [item, qty] of Object.entries(quantities)) {
        if (qty > 0) {
            const data = KEDO[item];
            commercial_lines.push(`${item} на 1 ${data.unit} - ${data.base_price} ${data.unit_price}`);
        }
    }
    commercial_lines.push("Расчёт:");
    for (const [item, qty] of Object.entries(quantities)) {
        if (qty > 0) {
            const base_price = KEDO[item].base_price;
            commercial_lines.push(`- ${item} (${qty} ${KEDO[item].unit}): ${formatPrice(base_price * qty)}`);
        }
    }
    commercial_lines.push(`Базовая стоимость системы: ${formatPrice(base_cost)}`);
    commercial_lines.push("");
    commercial_lines.push("Стоимость с учётом скидки:");
    for (const [item, qty] of Object.entries(quantities)) {
        if (qty > 0 && discounts[item] > 0) {
            const base_price = KEDO[item].base_price;
            const discounted_price = roundNumber(base_price * (1 - discounts[item] / 100));
            commercial_lines.push(`- ${item} (${qty} ${KEDO[item].unit}, скидка ${discounts[item]}%): ${formatPrice(discounted_price * qty)}`);
        }
    }
    commercial_lines.push(`Итого со скидкой: ${formatPrice(discount_cost)}`);
    commercial_lines.push(`Общая выгода: ${formatPrice(benefit)}`);
    commercial_lines.push(`Срок действия скидки: ${discount_date}`);
    const commercial = commercial_lines.join('\n');

    // Сбор вложений и ссылок
    const selected_attachments = [];
    const selected_links = [];
    for (const [key, value] of Object.entries(ATTACHMENTS)) {
        if (formData.get(`attachment_${key.replace(/ /g, '_')}`)) {
            selected_attachments.push(value);
        }
    }
    for (const [key, value] of Object.entries(LINKS)) {
        if (formData.get(`link_${key.replace(/ /g, '_')}`)) {
            selected_links.push(`${key}: ${value}`);
        }
    }

    let attachments_block = "Во вложениях:\n" + selected_attachments.map(item => `- ${item}`).join('\n');
    if (selected_links.length > 0) {
        attachments_block += "\n\nСсылки:\n" + selected_links.map(item => `- ${item}`).join('\n');
    }

    // Сбор всех блоков
    const blocks = {
        "greeting": `Добрый день, ${formData.get('fio')}!`,
        "agreement": formData.get('agreement_discount') 
            ? `Как и договаривались, направляю Вам коммерческое предложение по Кадровому ЭДО. Согласовал индивидуально для Вас скидку в размере ${formData.get('discount_value')}%.`
            : "Как и договаривались, направляю Вам коммерческое предложение по Кадровому ЭДО.",
        "attachments": attachments_block,
        "about": formData.get('include_about') ? ABOUT_US : "",
        "description": formData.get('include_description') ? KEDO_DESCRIPTION : "",
        "commercial": commercial,
        "benefits": KEDO_BENEFITS + (formData.get('custom_benefit') ? `\n- ${formData.get('custom_benefit')}` : "")
    };

    // Сбор КП в правильном порядке
    const block_order = formData.get('block_order').split(',');
    let kp_text = blocks.greeting + "\n\n" + blocks.agreement + "\n\n";
    if (selected_attachments.length > 0) {
        kp_text += blocks.attachments + "\n\n";
    }
    if (blocks.about) {
        kp_text += blocks.about + "\n\n";
    }
    if (blocks.description) {
        kp_text += blocks.description + "\n\n";
    }
    kp_text += block_order.map(block => blocks[block]).filter(Boolean).join('\n\n');

    // Отображение результата
    document.getElementById('kpText').textContent = kp_text;
    document.getElementById('result').style.display = 'block';
    document.getElementById('kpForm').style.display = 'none';
}

// Копирование в буфер обмена
function copyToClipboard() {
    const kpText = document.getElementById('kpText').textContent;
    navigator.clipboard.writeText(kpText).then(() => {
        alert('Текст скопирован в буфер обмена!');
    }).catch(err => {
        console.error('Ошибка при копировании: ', err);
    });
}

// Функция для корректного округления чисел
function roundNumber(num, decimals = 2) {
    return Math.round((num + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Расчет базовой стоимости
function calculateBaseCost(quantities) {
    let total = 0;
    for (const [item, qty] of Object.entries(quantities)) {
        if (qty > 0) {
            total += KEDO[item].base_price * qty;
        }
    }
    return roundNumber(total);
}

// Расчет стоимости со скидкой
function calculateDiscountCost(quantities, discounts) {
    let total = 0;
    for (const [item, qty] of Object.entries(quantities)) {
        if (qty > 0) {
            const base_price = KEDO[item].base_price;
            const discount = discounts[item] || 0;
            const discounted_price = base_price * (1 - discount / 100);
            total += roundNumber(discounted_price * qty);
        }
    }
    return roundNumber(total);
}

// Форматирование цены
function formatPrice(price) {
    return roundNumber(price).toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' руб.';
} 
