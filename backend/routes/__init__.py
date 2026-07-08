from flask import Blueprint

api = Blueprint("api", __name__)

from routes import categories, products, sales, dashboard, customers  # noqa: E402, F401
