from datetime import datetime, timedelta
from sqlalchemy import func
from flask import jsonify
from models import db, Sale, Product, Category, Customer
from routes import api
#from datetime import datetime, timedelta
#from sqlalchemy import func
#from flask import jsonify
#from models import db, Sale, Product,Category,Customer            
                                                           
@api.route("/dashboard/stats", methods=["GET"])
def get_dashboard_stats():
    today = datetime.utcnow().date()
    today_start = datetime.combine(today, datetime.min.time())
#@api.route("/dashboard/stats", methods=["GET"])
#def get_dashboard_stats():
#    today = datetime.utcnow().date()
#    today_start = datetime.combine(today,datetime.min.time())
    today_sales = Sale.query.filter(Sale.created_at >= today_start).all()
    today_revenue = sum(float(s.total) for s in today_sales)
    today_profit = sum(float(s.profit or 0) for s in today_sales)
    today_orders = len(today_sales)
#   today_sales = Sale.query.filter(Sale.created_at >= today_start).all()
#   today_revenue = sum(float(s.total) for s in today_sales)
#   today_profit = sum(float(s.profit or 0) for s in today_sales)
#   today_orders = len(today_sales)
    total_products = Product.query.filter_by(is_active=True).count()
    low_stock = Product.query.filter(
        Product.is_active == True, Product.stock <= 10  # noqa: E712
    ).count()
#   total_products = product.query.filter_by(is_active=True).count()
#   low_stock = product.query.filter(
#       Product.is_active == True, product.stock <= 10
#   ).count()
    week_start = today_start - timedelta(days=7)
    week_sales = (
        db.session.query(
            func.date(Sale.created_at).label("date"),
            func.count(Sale.id).label("orders"),
            func.sum(Sale.total).label("revenue"),
            func.sum(Sale.profit).label("profit"),
        )
        .filter(Sale.created_at >= week_start)
        .group_by(func.date(Sale.created_at))
        .all()
    )
#   week_start = today_start - timedelta(days=7)
#   week_sales = (
#       db.session.query(
#           func.data(Sale.created_at).label("date"),
#           func.count(Sale.id).label("orders"),
#           func.sum(sale.total).label("revenue"),
#           func.sum(Sale.profit).label("profit"),
#       )
#       .filter(Sale.created_at >= week_start)
#       .group_by(func.data(Sale.created_at))
#       .all()
    weekly_data = [
        {
            "date": str(row.date),
            "orders": row.orders,
            "revenue": float(row.revenue or 0),
            "profit": float(row.profit or 0),
        }
        for row in week_sales
    ]
#   weekly_data = [
#       {
#           "date" : str(now.date),
#            "orders" : row.orders,
#            "revenue" : float(row.revenue or 0),
#            "profit" : float(row.profit or 0),
#        }
#        for row in week_sales
#   ]
    total_udhar = sum(float(c.balance or 0) for c in Customer.query.filter_by(is_active=True).all())

    return jsonify({
        "today_revenue": today_revenue,
        "today_profit": today_profit,
        "today_orders": today_orders,
        "total_products": total_products,
        "low_stock_count": low_stock,
        "total_udhar": total_udhar,
        "weekly_sales": weekly_data,
        "total_categories": Category.query.count(),
    })
#   total_udhar = sum(float(c.balance or 0) for c in Customer.query.filter_by(is_active=True).all())
#   return jsonify({
#       "today_revenue" : today_revenue,
#       "today_profit" : today_profit,
#       "total_orders" : today_orders,
#       "total_products" : total_products,
#       "low_stock_count" : low_stock,
#       "total_udhar" : total_udhar,
#       "weekly_sales" : weekly_udhar,
#       "total_categories" : Category.query.count(),
#  })

@api.route("/dashboard/low-stock", methods=["GET"])
def get_low_stock_products():
    products = (
        Product.query.filter(Product.is_active == True, Product.stock <= 10)  # noqa: E712
        .order_by(Product.stock)
        .all()
    )
    return jsonify([p.to_dict() for p in products])
#@api.route("/dashboard/low-stock" , methods=["GET"])
#def get_low_stock_products():
#    products = (
#       Product.query.filter(Product.is_active == True, products.stock <= 10)
#       .order_by(Product.stock)
#       .all()