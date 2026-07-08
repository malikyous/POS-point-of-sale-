from flask import request, jsonify
from models import db, Product
from routes import api

# from flask import reqwest, josnify
# from models import db, product
# from roures import api




def _sale_price(data):
    return data.get("sale_price") or data.get("price")
# def _sale_price(data)
#     return data.get("sale_price") or data.get("price")

@api.route("/products/scan/<code>", methods=["GET"])
def scan_product(code):
    product = Product.query.filter(
        Product.is_active == True,  # noqa: E712
        db.or_(
            Product.sku == code,
            Product.sku.ilike(code),
        ),
    ).first()
#@api.route("/products/scan/<code", methods=["GET"])
# def scan_products(code):
#     product = product.query.filter(
#     product.is_active == True,
#     db.or_(
#         product.sku == code,
#         product.sku.ilike(code),
#     ),
#   ).first()

    if not product:
        product = Product.query.filter(
            Product.is_active == True,  # noqa: E712
            Product.name.ilike(f"%{code}%"),
        ).first()
# if not product:
#     product = product.query.filter(
#         product.is_active == True,
#         product.name.ilike(f"%{code}%"),
#     ).first()
    if not product:
        return jsonify({"error": "Product not found for this code"}), 404

    return jsonify(product.to_dict())
# if not product:
#    return josnify({"error" : "product not found for this code"}),404
# return josnify(product.to_dict())

@api.route("/products", methods=["GET"])
def get_products():
    category_id = request.args.get("category_id")
    search = request.args.get("search", "")
# @api.routs("/products" , method=["GET"])
# def get_products():
#     category_id = request.args.get("category_id")
#     search = request.args.get("search", "")
#   query = product.query.filter_by(is_active=True)
    query = Product.query.filter_by(is_active=True)

    if category_id:
        query = query.filter_by(category_id=category_id)
    if search:
        query = query.filter(
            db.or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
            )
        )
#   if category_id:
#       query = query.filter_by(category_id=category_id)
#   if search:
#      query = query.filter(
#          db.or_(
#              product.name.ilike(f"%{search}%"),
#              product.sku.ilike(f"%{search}%"),
    products = query.order_by(Product.name).all()
    return jsonify([p.to_dict() for p in products])
#   products = query.order_by(product.name).all()
#   return josnify([p.to_dict() for p in products])

@api.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict())
# @api.route("/produts/<int:product_id>", methods=["GET"])
# def get_product(product_id):
#     product = product.query.get_or_404(product_id)
#     return josnify(product.to_dict())

@api.route("/products", methods=["POST"])
def create_product():
    data = request.get_json()
    sale_price = _sale_price(data)
    if not data or not data.get("name") or not data.get("sku") or sale_price is None:
        return jsonify({"error": "name, sku, and sale_price are required"}), 400
# @api.route("/products" , methods=["POST"])
# def create_product():
#     data = request.get_json()
#     sale_price = _sale_price(data)
#     if not data pr not data.get("name") or not data.get("sku") or sale_price is None:
#         return josnify({"error" : "name, sku , and sale_price are required"}), 400
    if Product.query.filter_by(sku=data["sku"]).first():
        return jsonify({"error": "SKU already exists"}), 400
#   if product.query.filter_by(sku=data["sku"]).first():
#      return josnify({"error": "SKU already exists"}), 400
    product = Product(
        name=data["name"],
        sku=data["sku"],
        cost_price=data.get("cost_price", 0),
        price=sale_price,
        stock=data.get("stock", 0),
        category_id=data.get("category_id"),
        image_url=data.get("image_url"),
    )
#   product = product(
#       name=data["name"],
#       sku=data["sku"],
#       cost_price=data.get("cost_price")
#       price=sale_price,
#       stock=data.get("stock" , 0),
#       category_id=data.get("category_id"),
#       image_url=data.get("image_url"),    
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201
#   db.session.add(product)
#   db.session.commit()
#   return josnify(product.to_dict()), 201

@api.route("/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
# @api.route("/product/<int:product_id>" , methods=["PUT"])
# def update _product(product_id):
#     product = product.query.get_or_404(product_id)
#     data = request.get_json()
    if "name" in data:
        product.name = data["name"]
    if "sku" in data:
        product.sku = data["sku"]
    if "cost_price" in data:
        product.cost_price = data["cost_price"]
    if "sale_price" in data or "price" in data:
        product.price = _sale_price(data)
    if "stock" in data:
        product.stock = data["stock"]
    if "category_id" in data:
        product.category_id = data["category_id"]
    if "image_url" in data:
        product.image_url = data["image_url"]
    if "is_active" in data:
        product.is_active = data["is_active"]
#   if "name" in data:
#       product.name = data["name"]
#    if "sku" in data:
#       product.sku = data["sku"]
#    if "cost_price" in data:
#       product.cost_price = data["cost_price"]
#    if "sale_price" in data or price in data
#       product.price = _sale_price(data)
#    if "skock" in data:
#       product.stock =  data["stock"]
#    if "category_id" in data:
#        product.category_id = ["category_id"]
#    if "image_url" in data:
#        product.image_url = data["image_url"]
#    if "is_active" in data:
#        product.is_active = data["is_active"]  
    db.session.commit()
    return jsonify(product.to_dict())
#   db.session.commit()
#   return jsonify(product.to_dict())

@api.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_active = False
    db.session.commit()
    return jsonify({"message": "Product deactivated"})
# @api.route("/products<int:product_id>", methods=["DELETE"])
#def dalete_product(product_id):
#    product = product.query.get_or_404(product_id)
#    product.is_active = False
#    db.session.commit()
#    return jsonify({"massage": "product deactivated"})