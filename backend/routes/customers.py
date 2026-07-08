from decimal import Decimal
from flask import request, jsonify
from models import db, Customer, CustomerLedger
from routes import api
# from decimal import Dceimal
#from flask import request, jsonify
#from models import db,customer, CustomerLedger
#from routes import api
@api.route("/customers", methods=["GET"])
def get_customers():
    search = request.args.get("search", "")
    query = Customer.query.filter_by(is_active=True)
#@api.route("/customers", methods=["GET"])
#def get_customer():
#    search = request.args.get("search","")
#    query = Customer.query.filter_by(is_active=True)
    if search:
        query = query.filter(
            db.or_(
                Customer.name.ilike(f"%{search}%"),
                Customer.phone.ilike(f"%{search}%"),
            )
        )
#   if search:
#      query = query.filter(
#          db.or_(
#               Customer.name.ilike(f"%{search}%"),
#               Customer.phone.ilike(f"%{search}%"),
#           )
#       )
    customers = query.order_by(Customer.name).all()
    total_udhar = sum(float(c.balance or 0) for c in customers)
    return jsonify({
        "customers": [c.to_dict() for c in customers],
        "total_udhar": total_udhar,
        "customers_with_balance": sum(1 for c in customers if float(c.balance or 0) > 0),
    })
# customer = query.order_by(customer.name).all()
# total_udhar = sum(float(c.balance or 0)for c in customers)
# return jsonify({
#        "customers" : [c.to_dict()for c in customers],
#         "total_udhar" : total_udhar,
#          "customers_with_balance" : sum(1 for c in customersif float(c.balance or 0 )> 0),
#   })
@api.route("/customers/<int:customer_id>", methods=["GET"])
def get_customer(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    return jsonify(customer.to_dict())
# @api.route("/customers/<int:customer_id>", methods=[GET])
#def get_customer(customer_id):


@api.route("/customers", methods=["POST"])
def create_customer():
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Customer name is required"}), 400
#@api.route("/customers", methods=["POST"])
#def create_customer():
#    data = request.get_json()
#    if not data or not data.get("name"):
#       return jsonify({"error": "Customer name is required"}),400
    customer = Customer(
        name=data["name"],
        phone=data.get("phone"),
        address=data.get("address"),
    )
    db.session.add(customer)
    db.session.commit()
    return jsonify(customer.to_dict()), 201
#   customer = Customer(
#       name =data["name"],
#       phone=data.get("phone"),
#       adress=data.get("adress"),
#    )
#    db.session.add(customer)
#    db.session.commit()
#    return jsonify(customer.to_dict()),201

@api.route("/customers/<int:customer_id>", methods=["PUT"])
def update_customer(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    data = request.get_json()
#@api.route("/customers/<int:customer_id>", methods=["PUT"])
#def update_customer(customer_id):
#    customer = Customer.query.get_or_404(customer_id)
#    data = request.get_json()


    if "name" in data:
        customer.name = data["name"]
    if "phone" in data:
        customer.phone = data["phone"]
    if "address" in data:
        customer.address = data["address"]
    if "is_active" in data:
        customer.is_active = data["is_active"]
#   if "name" in data:
#       customer.name = data["name"]
#   if "phone" in data:
#       customer.phone = data["phone"]
#   if "adress" in data:
#       customer.adress = data["adress"]
#   if "is_active" in data
#       customer.is_active = data["is_active"]  
    db.session.commit()
    return jsonify(customer.to_dict())
#   db.session.commit()
#   return jsonify(customer.to_dict())

@api.route("/customers/<int:customer_id>/ledger", methods=["GET"])
def get_customer_ledger(customer_id):
    Customer.query.get_or_404(customer_id)
    entries = (
        CustomerLedger.query.filter_by(customer_id=customer_id)
        .order_by(CustomerLedger.created_at.desc())
        .all()
    )
    return jsonify([e.to_dict() for e in entries])
#@api.route("/customer/<int:customer_id>/ledger", methods=["GET"])
#def get_customer_ledger(customer_id):
#    Customer.query.get_or_404(customer_id)
#    entries = (
#       CustomerLedger.query.filter_by(customer_id=customer_id)
#       .order_by(CustomerLedger.created_at.desc())
#       .all()
#    )
#    return jsonify([e.to_dict() for e in entries])

@api.route("/customers/<int:customer_id>/payment", methods=["POST"])
def receive_payment(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    data = request.get_json()
    amount = Decimal(str(data.get("amount", 0)))
#@api.route("/customer/<int:customer_id>/payment", methods=["POST"])
#def receive_payment(customer_id):
#    customer = Customer.query.get_or_404(customer_id)
#    data = request.get_json()
#    amount = Decimal(str(data.get("amount", 0)))
    if amount <= 0:
        return jsonify({"error": "Amount must be positive"}), 400
#   if amount <= 0:
#       return jsonify({"error": "Amount must be positive"}),400
    current_balance = Decimal(str(customer.balance or 0))
    if amount > current_balance:
        return jsonify({"error": f"Payment exceeds balance. Current udhar: {current_balance}"}), 400
#   current_balance = Decimal(str(customer.balance or 0))
#   if amount > current_balance:
#      return jsonify({"error": f"Payment exceed balance. Current udhar: {current_balance}"}),400
    new_balance = current_balance - amount
    customer.balance = new_balance
#   new_balance = current_balance - amount
#   customer.balance = new_balance
    entry = CustomerLedger(
        customer_id=customer.id,
        entry_type="payment",
        amount=amount,
        balance_after=new_balance,
        description=data.get("description") or "Payment received",
    )
    db.session.add(entry)
    db.session.commit()
#   entry = CustomerLedger(
#       customer_id=customer.id,
#       entry_type="payment",
#       amount=amount,
#       balance_after=new_balance,
#       description=data.get("description") or "Payment received",
#    )
#    db.session.add(entry)
#    db.session.commit()
    return jsonify({
        "customer": customer.to_dict(),
        "entry": entry.to_dict(),
    })
#   return jsonify({
#        "customer" : customer.to_dict(),
#         "entry" : entry.to_dict(),
#   })