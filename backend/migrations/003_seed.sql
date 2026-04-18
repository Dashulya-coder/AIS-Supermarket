INSERT INTO categories (name) VALUES
       ('Milk'),
       ('Bread'),
       ('Fruits'),
       ('Meat'),
       ('Drinks'),
       ('Sweets');

INSERT INTO products (category_id, name, producer, characteristics) VALUES
       (1, 'Milk 2.5%', 'Local Farm', '1L'),
       (1, 'Milk 3.2%', 'Local Farm', '1L'),
       (2, 'White Bread', 'Bakery Kyiv', '500g'),
       (2, 'Black Bread', 'Bakery Kyiv', '600g'),
       (3, 'Apple', 'Ukraine', '1kg'),
       (3, 'Banana', 'Ecuador', '1kg'),
       (4, 'Chicken Fillet', 'Myasnyk', '1kg'),
       (4, 'Pork', 'Farm Meat', '1kg'),
       (5, 'Coca-Cola', 'Coca-Cola', '1L'),
       (5, 'Orange Juice', 'Sandora', '1L'),
       (6, 'Chocolate Bar', 'Roshen', '100g'),
       (6, 'Cookies', 'Roshen', '300g');

INSERT INTO store_products (upc, product_id, selling_price, products_number, promotional_product) VALUES
       ('100001', 1, 32.00, 50, false),
       ('100002', 2, 34.00, 40, true),
       ('100003', 3, 20.00, 60, false),
       ('100004', 4, 22.00, 30, false),
       ('100005', 5, 25.00, 100, true),
       ('100006', 6, 45.00, 80, false),
       ('100007', 7, 120.00, 25, false),
       ('100008', 8, 140.00, 20, true),
       ('100009', 9, 28.00, 70, false),
       ('100010', 10, 50.00, 50, false),
       ('100011', 11, 35.00, 90, true),
       ('100012', 12, 60.00, 40, false);

INSERT INTO employees (id, surname, name, patronymic, position, salary, date_of_birth, date_of_start, phone, city, street, zip_code) VALUES
       ('E001', 'Ivanenko', 'Ivan', 'Ivanovych', 'Manager', 25000, '1988-05-10', '2020-01-01', '380000000001', 'Kyiv', 'Shevchenka', '01001'),
       ('E002', 'Petrenko', 'Petro', 'Petrovych', 'Cashier', 12000, '1995-07-15', '2021-03-10', '380000000002', 'Kyiv', 'Khreshchatyk', '01002'),
       ('E003', 'Shevchenko', 'Olena', 'Ivanivna', 'Cashier', 13000, '1996-02-20', '2022-06-01', '380000000003', 'Kyiv', 'Lvivska', '01003');

INSERT INTO users (employee_id, username, password_hash, role) VALUES

       ('E001', 'manager', '$2a$10$examplehash1', 'Manager'),
       ('E002', 'cashier1', '$2a$10$examplehash2', 'Cashier'),
       ('E003', 'cashier2', '$2a$10$examplehash3', 'Cashier');

INSERT INTO customer_cards (card_number, surname, name, patronymic, phone, city, street, zip_code, percent) VALUES
       ('C001', 'Koval', 'Anna', 'Serhiivna', '380000000101', 'Kyiv', 'Centralna', '02001', 5),
       ('C002', 'Melnyk', 'Oleh', 'Ivanovych', '380000000102', 'Kyiv', 'Dniprovska', '02002', 10),
       ('C003', 'Bondar', 'Iryna', 'Petrovna', '380000000103', 'Kyiv', 'Peremohy', '02003', 7);

INSERT INTO receipts (receipt_number, cashier_id, card_number, print_date, sum_total, vat) VALUES
       ('R001', 'E002', 'C001', NOW(), 100.00, 20.00),
       ('R002', 'E003', NULL, NOW(), 200.00, 40.00);

INSERT INTO receipt_items (receipt_number, upc, product_number, selling_price) VALUES
       ('R001', '100001', 2, 32.00),
       ('R001', '100003', 1, 20.00),
       ('R002', '100007', 1, 120.00),
       ('R002', '100009', 2, 28.00);

