package repository

import (
	"database/sql"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
)

type ProductRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) GetAll() ([]models.Product, error) {
	query := `
		SELECT id, category_id, name, producer, characteristics
		FROM products
		ORDER BY name
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product

	for rows.Next() {
		var product models.Product
		if err := rows.Scan(
			&product.ID,
			&product.CategoryID,
			&product.Name,
			&product.Producer,
			&product.Characteristics,
		); err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}

func (r *ProductRepository) GetByID(id int) (*models.Product, error) {
	query := `
		SELECT id, category_id, name, producer, characteristics
		FROM products
		WHERE id = $1
	`

	var product models.Product
	err := r.db.QueryRow(query, id).Scan(
		&product.ID,
		&product.CategoryID,
		&product.Name,
		&product.Producer,
		&product.Characteristics,
	)
	if err != nil {
		return nil, err
	}

	return &product, nil
}

func (r *ProductRepository) GetByCategoryID(categoryID int) ([]models.Product, error) {
	query := `
		SELECT id, category_id, name, producer, characteristics
		FROM products
		WHERE category_id = $1
		ORDER BY name
	`

	rows, err := r.db.Query(query, categoryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product

	for rows.Next() {
		var product models.Product
		if err := rows.Scan(
			&product.ID,
			&product.CategoryID,
			&product.Name,
			&product.Producer,
			&product.Characteristics,
		); err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}

func (r *ProductRepository) Create(product models.Product) error {
	query := `
		INSERT INTO products (category_id, name, producer, characteristics)
		VALUES ($1, $2, $3, $4)
	`

	_, err := r.db.Exec(
		query,
		product.CategoryID,
		product.Name,
		product.Producer,
		product.Characteristics,
	)
	return err
}

func (r *ProductRepository) Update(id int, product models.Product) error {
	query := `
		UPDATE products
		SET category_id = $1, name = $2, producer = $3, characteristics = $4
		WHERE id = $5
	`

	_, err := r.db.Exec(
		query,
		product.CategoryID,
		product.Name,
		product.Producer,
		product.Characteristics,
		id,
	)
	return err
}

func (r *ProductRepository) Delete(id int) error {
	query := `DELETE FROM products WHERE id = $1`

	_, err := r.db.Exec(query, id)
	return err
}
