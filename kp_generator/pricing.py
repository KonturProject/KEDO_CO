class Pricing:
    KEDO = {
        "Лицензия": {"base_price": 2000, "max_discount": 85, "required": True, "unit": "сотрудников", "unit_price": "руб./год"},
        "НЭП": {"base_price": 500, "max_discount": 100, "required": False, "unit": "сотрудников", "unit_price": "руб./год"},
        "Модуль интеграции": {"base_price": 13700, "max_discount": 20, "required": False, "unit": "баз", "unit_price": "руб./год"},
        "Доработка расчётных листов": {"base_price": 14000, "max_discount": 20, "required": False, "unit": "баз", "unit_price": "руб. единоразово"},
        "Доработка архива": {"base_price": 21000, "max_discount": 20, "required": False, "unit": "баз", "unit_price": "руб. единоразово"},
        "Настройка маршрутов": {"base_price": 7000, "max_discount": 50, "required": False, "unit": "пакетов", "unit_price": "руб. за услугу"},
        "СМС-уведомления": {"base_price": 230, "max_discount": 20, "required": False, "unit": "100 шт.", "unit_price": "руб. за 100 шт."}
    }

    @staticmethod
    def calculate_base_cost(product, quantities):
        total = 0
        for item, qty in quantities.items():
            total += Pricing.KEDO[item]["base_price"] * qty
        return total

    @staticmethod
    def calculate_discount_cost(product, quantities, discounts):
        total = 0
        for item, qty in quantities.items():
            base_price = Pricing.KEDO[item]["base_price"]
            discount = min(discounts.get(item, 0), Pricing.KEDO[item]["max_discount"])
            discounted_price = base_price * (1 - discount / 100)
            total += discounted_price * qty
        return total

    @staticmethod
    def format_price(price):
        return f"{int(price):,}".replace(",", " ") + " руб."