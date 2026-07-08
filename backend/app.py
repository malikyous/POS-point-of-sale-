from flask import Flask
from flask_cors import CORS
from config import Config
from models import db, Category, Product
from routes import api
from migrate import migrate_db
# from flask imprt Flask
# from flask_cors import CORS
# from config import Config
# from models import db, Category, Product
# from routes import api
# from migrate import migrate_db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)
    app.register_blueprint(api, url_prefix="/api")
# def create_app():
#     app = Flask(__name__)
#     app.config.from_object(Config)
#     Cors(app)
#     db.init_app(app)
#     app.register_blueprint(api, url_prefix="/api")
    with app.app_context():
        db.create_all()
        migrate_db()
        seed_data()
#   with app.app_contex():
#        db.create_all()
#        migrate_db()
#        seed_data()
#   return app
    return app


def seed_data():
    if Category.query.first():
        return
# def seed_data():
#     if Category.query.first
#         return
    categories = [
        Category(name="Beverages"),
        Category(name="Snacks"),
        Category(name="Groceries"),
        Category(name="Electronics"),
        Category(name="Clothing"),
    ]
    db.session.add_all(categories)
    db.session.commit()
#   categories = [
#       Category(name="Beverages"),
#       Category(name="Snakes")
#       Category(name="Groceries")
#       Category(name=Electronics)
#       Category(name="Clothing")
# ]

    products = [
        Product(name="Coca Cola", sku="BEV-001", cost_price=1.50, price=2.50, stock=100, category_id=1),
        Product(name="Pepsi", sku="BEV-002", cost_price=1.50, price=2.50, stock=80, category_id=1),
        Product(name="Mineral Water", sku="BEV-003", cost_price=0.50, price=1.00, stock=200, category_id=1),
        Product(name="Orange Juice", sku="BEV-004", cost_price=2.00, price=3.50, stock=50, category_id=1),
        Product(name="Lays Chips", sku="SNK-001", cost_price=0.80, price=1.50, stock=150, category_id=2),
        Product(name="KitKat", sku="SNK-002", cost_price=1.20, price=2.00, stock=120, category_id=2),
        Product(name="Biscuits", sku="SNK-003", cost_price=0.70, price=1.25, stock=90, category_id=2),
        Product(name="Rice 1kg", sku="GRC-001", cost_price=3.50, price=5.00, stock=60, category_id=3),
        Product(name="Cooking Oil", sku="GRC-002", cost_price=6.00, price=8.50, stock=40, category_id=3),
        Product(name="Sugar 1kg", sku="GRC-003", cost_price=2.00, price=3.00, stock=70, category_id=3),
        Product(name="USB Cable", sku="ELC-001", cost_price=3.50, price=5.99, stock=30, category_id=4),
        Product(name="Phone Charger", sku="ELC-002", cost_price=8.00, price=12.99, stock=25, category_id=4),
        Product(name="T-Shirt", sku="CLT-001", cost_price=10.00, price=15.99, stock=45, category_id=5),
        Product(name="Jeans", sku="CLT-002", cost_price=20.00, price=29.99, stock=30, category_id=5),
    ]
    db.session.add_all(products)
    db.session.commit()


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
