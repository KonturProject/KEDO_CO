from flask import Flask, render_template, request, jsonify
from pricing import Pricing
from templates_data import KEDO_DESCRIPTION, KEDO_BENEFITS, ABOUT_US, ATTACHMENTS, LINKS
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', pricing=Pricing.KEDO, attachments=ATTACHMENTS, links=LINKS)

@app.route('/generate', methods=['POST'])
def generate():
    fio = request.form['fio']
    agreement_text = "Как и договаривались, направляю Вам коммерческое предложение по Кадровому ЭДО."
    if request.form.get('agreement_discount'):
        discount = request.form['discount_value']
        agreement_text += f" Согласовал индивидуально для Вас скидку в размере {discount}%."

    quantities = {key: int(request.form.get(key, 0)) for key in Pricing.KEDO}
    discounts = {key: float(request.form.get(f"discount_{key}", 0) or 0) for key in Pricing.KEDO}

    base_cost = Pricing.calculate_base_cost("KEDO", quantities)
    discount_cost = Pricing.calculate_discount_cost("KEDO", quantities, discounts)
    benefit = base_cost - discount_cost
    discount_date = datetime.strptime(request.form['discount_date'], '%Y-%m-%d').strftime('%d.%m.%Y')

    # Коммерческий блок без форматирования
    commercial_lines = ["Коммерческое предложение", "Из чего складывается базовая стоимость:"]
    for item, qty in quantities.items():
        if qty > 0:
            data = Pricing.KEDO[item]
            commercial_lines.append(f"{item} на 1 {data['unit']} - {data['base_price']} {data['unit_price']}")
    commercial_lines.append("Расчёт:")
    for item, qty in quantities.items():
        if qty > 0:
            base_price = Pricing.KEDO[item]["base_price"]
            commercial_lines.append(f"- {item} ({qty} {Pricing.KEDO[item]['unit']}): {Pricing.format_price(base_price * qty)}")
    commercial_lines.append(f"Базовая стоимость системы: {Pricing.format_price(base_cost)}")
    commercial_lines.append("")
    commercial_lines.append("Стоимость с учётом скидки:")
    for item, qty in quantities.items():
        if qty > 0 and discounts[item] > 0:
            base_price = Pricing.KEDO[item]["base_price"]
            discounted_price = base_price * (1 - discounts[item] / 100)
            commercial_lines.append(f"- {item} ({qty} {Pricing.KEDO[item]['unit']}, скидка {discounts[item]}%): {Pricing.format_price(discounted_price * qty)}")
    commercial_lines.append(f"Итого со скидкой: {Pricing.format_price(discount_cost)}")
    commercial_lines.append(f"Общая выгода: {Pricing.format_price(benefit)}")
    commercial_lines.append(f"Срок действия скидки: {discount_date}")
    commercial = "\n".join(commercial_lines)

    # Вложения и ссылки без форматирования
    selected_attachments = [ATTACHMENTS[key] for key in ATTACHMENTS if request.form.get(f"attachment_{key.replace(' ', '_')}")]
    selected_links = [f"{key}: {LINKS[key]}" for key in LINKS if request.form.get(f"link_{key.replace(' ', '_')}")]
    attachments_block = "Во вложениях:\n" + "\n".join(f"- {item}" for item in selected_attachments) + (
        "\n\nСсылки:\n" + "\n".join(f"- {item}" for item in selected_links) if selected_links else ""
    )

    # Блоки без форматирования
    blocks = {
        "greeting": f"Добрый день, {fio}!",
        "agreement": agreement_text,
        "attachments": attachments_block,
        "about": f"О компании\n{ABOUT_US.split('\n', 1)[1]}" if request.form.get('include_about') else "",
        "description": f"Описание сервиса\n{KEDO_DESCRIPTION.split('\n', 1)[1]}" if request.form.get('include_description') else "",
        "commercial": commercial,
        "benefits": f"Выгоды использования\n{KEDO_BENEFITS.split('\n', 1)[1]}" + (f"\n- {request.form['custom_benefit']}" if request.form.get('custom_benefit') else "")
    }
    floating_blocks = request.form['block_order'].split(',')

    # Собираем КП
    kp_text = (
        blocks["greeting"] + "\n\n" +
        blocks["agreement"] + "\n\n" +
        (blocks["attachments"] + "\n\n" if selected_attachments else "") +
        (blocks["about"] + "\n\n" if blocks["about"] else "") +
        (blocks["description"] + "\n\n" if blocks["description"] else "") +
        "\n\n".join(blocks[block] for block in floating_blocks if blocks[block])
    ).strip()

    return render_template('result.html', kp_text=kp_text)

if __name__ == '__main__':
    app.run(debug=True)