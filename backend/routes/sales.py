from datetime import datetime
from decimal import Decimal
from flask import request, jsonify
from models import db, Sale, SaleItem, Product, Customer, CustomerLedger
from routes import api
# from datetime import datetime
# from decimal import Decimal
# from flask import request, jsonify
# from models import db, Sale, SaleItem, Product, Customer, CusmtomerLedger
# from routes import api

def generate_invoice_number():
    today = datetime.utcnow().strftime("%Y%m%d")
    count = Sale.query.filter(Sale.invoice_number.like(f"INV-{today}-%")).count()
    return f"INV-{today}-{count + 1:04d}"
# def generate_invoice_number():
#     today = datetime.utenow().strftime("%Y%m%d")
#     count = Sale.query.filter(Sale.invoice_number.like(f"INV-{today}-%")).count()
#     return f"INV-{today}-{count + 1:04d}"

@api.route("/sales", methods=["GET"])
def get_sales():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    pagination = Sale.query.order_by(Sale.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
#@api.route("/dales" , methods=[GET])
#def get_sales():
#    page = request.args.get("per_paage", 20,type=int)
#    pagination = Sale.query.order_by(Sale.created_at.desc()).pagination(
#         page=page, per_page=per_page, error_out=False
#    )
    return jsonify({
        "sales": [s.to_dict() for s in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page,
    })
#   return jsonify({
#      "sales" : [s.to_dict() for s in pagination.item],
#      "total" : pagination.total,
#       "pages" : pagination.page
#   })

@api.route("/sales/<int:sale_id>", methods=["GET"])
def get_sale(sale_id):
    sale = Sale.query.get_or_404(sale_id)
    return jsonify(sale.to_dict())
#@api.route("/sales/<int:sale_id>" , methods=[""GET])
#def get_sale(sale_id):
#    sale = Sale.query.get_or_404(sale_id)
#    return jsonify(sale.to_dict())
@api.route("/sales", methods=["POST"])
def create_sale():
    data = request.get_json()
    items = data.get("items", [])
# @api.route("/sles" , methods=[""POST])
#def create_sale():
#    data = request.get_json()
#    items = data.get("items", [])
    if not items:
        return jsonify({"error": "At least one item is required"}), 400
#   if not items:
#       return jsonify({"error": ""at least one item is required}), 400
    payment_method = data.get("payment_method", "cash")
    customer_id = data.get("customer_id")
#   payment_method = data.get("payment_method" , "cash")
#   customer_id = data.get("costumer_id")
    if payment_method == "udhar" and not customer_id:
        return jsonify({"error": "Customer is required for udhar sale"}), 400
#   if payment_method == "udhar" and not customer_id:
#      return jsonify({"error": "Customer is required for udhar sale"}), 400
    customer = None
    if customer_id:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({"error": "Customer not found"}), 404
#   customer = None
#   if customer_id:
#      customer = Customer.query.get(customer_id)
#      if not customer:
#      return jsonify({"errpr": "Customer not found"}) , 404 
    subtotal = Decimal("0")
    total_cost = Decimal("0")
    sale_items = []
#   subtotal = Decimal("0")
#   total_cost = Decimal("0")
#   sales_items = []
    for item in items:
        product = Product.query.get(item["product_id"])
        if not product:
            return jsonify({"error": f"Product {item['product_id']} not found"}), 404
#   for item in items:
#       product = Product.query.get(item["product_id"])
#       if not product:
#           return jsonify({"error": f""product"{item["product_id"]} not found }),404        
        qty = int(item["quantity"])
        if qty <= 0:
            return jsonify({"error": "Quantity must be positive"}), 400
        if product.stock < qty:
            return jsonify({"error": f"Insufficient stock for {product.name}"}), 400
#       qty = int(item["quantity"])
#       if qty <= 0: 
#           return jsonify({"error" : "Quantity must be positive"}), 400
#        if product.stock < qty:
#           return jsonify({"error" : f"Insufficient stock for {product.name}"}),400       
        unit_price = Decimal(str(product.price))
        unit_cost = Decimal(str(product.cost_price or 0))
        total_price = unit_price * qty
        item_total_cost = unit_cost * qty
        subtotal += total_price
        total_cost += item_total_cost
#       unit_price = Decimal(str(product.price))
#       unit_cost = Decimal(str(product.cost_price or 0))
#       item_total_cost = unit_cost * qty
#       total_price_cost = unit_price * qty
#       subtotal = total_price 
#       total_cost += item_total_cost
        sale_items.append({
            "product": product,
            "quantity": qty,
            "unit_price": unit_price,
            "unit_cost": unit_cost,
            "total_price": total_price,
            "total_cost": item_total_cost,
        })

    tax_rate = Decimal(str(data.get("tax_rate", 0)))
    discount = Decimal(str(data.get("discount", 0)))
    tax = subtotal * tax_rate / Decimal("100")
    total = subtotal + tax - discount
    profit = total - total_cost
#   tax_rate = Decimal(str(date.get("tax_rate" , 0)))
#   discount = Decimal(str(date.get("discount", 0)))
#   tax = subtotal * tax_rate / Decimal("100")
#   profit = total - total_cost
    sale = Sale(
        invoice_number=generate_invoice_number(),
        subtotal=subtotal,
        tax=tax,
        discount=discount,
        total=total,
        total_cost=total_cost,
        profit=profit,
        payment_method=payment_method,
        customer_id=customer.id if customer else None,
        customer_name=customer.name if customer else data.get("customer_name"),
    )
    db.session.add(sale)
    db.session.flush()
#   sale = Sale(
#        invoice_number=generate_invoice_number(),
#        subtotal=subtotal,
#        tax=tax,
#        discount=discount,
#        total_cost=total_cost,
#        profit=profit,
#        payment_method=payment_method
#        customer_id=customer.id if customer else None,
#        customer_name=customer.name if customer else date.get("customer_name")
    for item_data in sale_items:
        product = item_data["product"]
        product.stock -= item_data["quantity"]

        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=product.id,
            product_name=product.name,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            unit_cost=item_data["unit_cost"],
            total_price=item_data["total_price"],
            total_cost=item_data["total_cost"],
        )
        db.session.add(sale_item)
#   for item_data in sale_items:
#       product = item_data["product"]
#       product.stock -= item_data["quantity"]
#       sale_item = SaleItem(
#           sale_id=sale.id,
#           products_id=product.id
#           product_name=product.name
    if payment_method == "udhar" and customer:
        new_balance = Decimal(str(customer.balance or 0)) + total
        customer.balance = new_balance
        ledger = CustomerLedger(
            customer_id=customer.id,
            entry_type="udhar",
            amount=total,
            balance_after=new_balance,
            description=f"Udhar sale - {sale.invoice_number}",
            sale_id=sale.id,
        )
        db.session.add(ledger)

    db.session.commit()
    return jsonify(sale.to_dict()), 201
    