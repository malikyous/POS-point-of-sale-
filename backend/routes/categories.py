from flask import request, jsonify
from models import db, Category
from routes import api
# from flask import request, jsonify
# form models import db, Category 
# from routes umport api

@api.route("/categories", methods=["GET"])
def get_categories():
    categories = Category.query.order_by(Category.name).all()
    return jsonify([c.to_dict() for c in categories])
# @api.route("/categories" , methods=["GET"])
# def get_categories():
#     categories = Category.query.order_by(Category.name).all()
#     return josnify([c.to_dict() for c in categories])

@api.route("/categories", methods=["POST"])
def create_category():
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Category name is required"}), 400
#@api.route("/categories", methods=["POST"])
# def create_category():
#     data = request.get_json()
#     if not data or not data.get("name"):
#        return jsonify({"error": "Category name is required"}), 400      
    if Category.query.filter_by(name=data["name"]).first():
        return jsonify({"error": "Category already exists"}), 400
#   if Category.query.filter_by(name=data["name"]).first():
#      return jsonify({"error": "Category already exists"}), 400
    category = Category(name=data["name"])
    db.session.add(category)
    db.session.commit()
    return jsonify(category.to_dict()), 201
#   category = Category(name=data["name"])
#   db.session.data(category)
#   db.session.commit()
#   return jsonify(category.to_dict()), 201

@api.route("/categories/<int:category_id>", methods=["PUT"])
def update_category(category_id):
    category = Category.query.get_or_404(category_id)
    data = request.get_json()
#@api.route("/categories/<int:category_id>", methods=["PUT"])
#def update_category(category_id):
#    category = Category.query.get_or_404(category_id)
#    data = request.get_json()
    if data.get("name"):
        category.name = data["name"]
#   if data.get("name"):
#       category.name = data["name"]
    db.session.commit()
    return jsonify(category.to_dict())
#   db.session.commit()
#   return jsonify(category.to_dict())

@api.route("/categories/<int:category_id>", methods=["DELETE"])
def delete_category(category_id):
    category = Category.query.get_or_404(category_id)
    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "Category deleted"})

#@api.route("/categories/<int;category_id>" , methods=["DELETE"])
#def delete_category(category_id):
#    category = Category.query.get_or_404(category_id)
#    db.session.delete(category)
#    db.session.commit()
#    return jsonify({"massage": "category deleted"})
