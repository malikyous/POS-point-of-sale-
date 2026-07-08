from sqlalchemy import inspect, text
from models import db


def migrate_db():
    inspector = inspect(db.engine)
    migrations = [
        ("products", "cost_price",
         "ALTER TABLE products ADD COLUMN cost_price DECIMAL(10,2) NOT NULL DEFAULT 0"),
        ("sales", "total_cost",
         "ALTER TABLE sales ADD COLUMN total_cost DECIMAL(10,2) NOT NULL DEFAULT 0"),
        ("sales", "profit",
         "ALTER TABLE sales ADD COLUMN profit DECIMAL(10,2) NOT NULL DEFAULT 0"),
        ("sales", "customer_id",
         "ALTER TABLE sales ADD COLUMN customer_id INT NULL"),
        ("sale_items", "unit_cost",
         "ALTER TABLE sale_items ADD COLUMN unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0"),
        ("sale_items", "total_cost",
         "ALTER TABLE sale_items ADD COLUMN total_cost DECIMAL(10,2) NOT NULL DEFAULT 0"),
    ]

    for table, column, sql in migrations:
        if table not in inspector.get_table_names():
            continue
        columns = [c["name"] for c in inspector.get_columns(table)]
        if column not in columns:
            db.session.execute(text(sql))

    db.session.commit()
