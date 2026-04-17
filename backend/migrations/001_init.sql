CREATE TABLE categories (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
                          id SERIAL PRIMARY KEY,
                          category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
                          name VARCHAR(150) NOT NULL,
                          producer VARCHAR(150) NOT NULL,
                          characteristics TEXT NOT NULL
);

CREATE TABLE employees (
                           id VARCHAR(20) PRIMARY KEY,
                           surname VARCHAR(50) NOT NULL,
                           name VARCHAR(50) NOT NULL,
                           patronymic VARCHAR(50),
                           position VARCHAR(20) NOT NULL CHECK (position IN ('Manager', 'Cashier')),
                           salary NUMERIC(10,2) NOT NULL CHECK (salary >= 0),
                           date_of_birth DATE NOT NULL,
                           date_of_start DATE NOT NULL,
                           phone VARCHAR(13) NOT NULL,
                           city VARCHAR(100) NOT NULL,
                           street VARCHAR(100) NOT NULL,
                           zip_code VARCHAR(20) NOT NULL,
                           CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '18 years')
    );

CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       employee_id VARCHAR(20) NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
                       username VARCHAR(50) NOT NULL UNIQUE,
                       password_hash TEXT NOT NULL,
                       role VARCHAR(20) NOT NULL CHECK (role IN ('Manager', 'Cashier')),
                       is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE customer_cards (
                                card_number VARCHAR(20) PRIMARY KEY,
                                surname VARCHAR(50) NOT NULL,
                                name VARCHAR(50) NOT NULL,
                                patronymic VARCHAR(50),
                                phone VARCHAR(13) NOT NULL,
                                city VARCHAR(100),
                                street VARCHAR(100),
                                zip_code VARCHAR(20),
                                percent INT NOT NULL CHECK (percent >= 0)
);

CREATE TABLE store_products (
                                upc VARCHAR(20) PRIMARY KEY,
                                upc_prom VARCHAR(20) REFERENCES store_products(upc) ON DELETE SET NULL,
                                product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
                                selling_price NUMERIC(10,2) NOT NULL CHECK (selling_price >= 0),
                                products_number INT NOT NULL CHECK (products_number >= 0),
                                promotional_product BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE receipts (
                          receipt_number VARCHAR(20) PRIMARY KEY,
                          cashier_id VARCHAR(20) NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
                          card_number VARCHAR(20) REFERENCES customer_cards(card_number) ON DELETE SET NULL,
                          print_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          sum_total NUMERIC(10,2) NOT NULL CHECK (sum_total >= 0),
                          vat NUMERIC(10,2) NOT NULL CHECK (vat >= 0)
);

CREATE TABLE receipt_items (
                               id SERIAL PRIMARY KEY,
                               receipt_number VARCHAR(20) NOT NULL REFERENCES receipts(receipt_number) ON DELETE CASCADE,
                               upc VARCHAR(20) NOT NULL REFERENCES store_products(upc) ON DELETE RESTRICT,
                               product_number INT NOT NULL CHECK (product_number > 0),
                               selling_price NUMERIC(10,2) NOT NULL CHECK (selling_price > 0)
);