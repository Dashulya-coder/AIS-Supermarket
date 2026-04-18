CREATE INDEX idx_categories_name ON categories(name);

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category_id ON products(category_id);

CREATE INDEX idx_store_products_product_id ON store_products(product_id);
CREATE INDEX idx_store_products_promotional_product ON store_products(promotional_product);

CREATE INDEX idx_customer_cards_surname ON customer_cards(surname);
CREATE INDEX idx_customer_cards_percent ON customer_cards(percent);

CREATE INDEX idx_employees_surname ON employees(surname);
CREATE INDEX idx_employees_position ON employees(position);

CREATE INDEX idx_receipts_cashier_id ON receipts(cashier_id);
CREATE INDEX idx_receipts_print_date ON receipts(print_date);

CREATE INDEX idx_receipt_items_receipt_number ON receipt_items(receipt_number);
CREATE INDEX idx_receipt_items_upc ON receipt_items(upc);