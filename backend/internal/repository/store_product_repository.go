package repository

import (
	"database/sql"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
)

type StoreProductRepository struct {
	db *sql.DB
}

func NewStoreProductRepository(db *sql.DB) *StoreProductRepository {
	return &StoreProductRepository{db: db}
}

func (r *StoreProductRepository) GetAll() ([]models.StoreProduct, error) {
	query := `
		SELECT upc, upc_prom, product_id, selling_price, products_number, promotional_product
		FROM store_products
		ORDER BY products_number DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var storeProducts []models.StoreProduct

	for rows.Next() {
		var sp models.StoreProduct
		if err := rows.Scan(
			&sp.UPC,
			&sp.UPCProm,
			&sp.ProductID,
			&sp.SellingPrice,
			&sp.ProductsNumber,
			&sp.PromotionalProduct,
		); err != nil {
			return nil, err
		}
		storeProducts = append(storeProducts, sp)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return storeProducts, nil
}

func (r *StoreProductRepository) GetByUPC(upc string) (*models.StoreProduct, error) {
	query := `
		SELECT upc, upc_prom, product_id, selling_price, products_number, promotional_product
		FROM store_products
		WHERE upc = $1
	`

	var sp models.StoreProduct
	err := r.db.QueryRow(query, upc).Scan(
		&sp.UPC,
		&sp.UPCProm,
		&sp.ProductID,
		&sp.SellingPrice,
		&sp.ProductsNumber,
		&sp.PromotionalProduct,
	)
	if err != nil {
		return nil, err
	}

	return &sp, nil
}

func (r *StoreProductRepository) GetAllPromotional() ([]models.StoreProduct, error) {
	query := `
		SELECT upc, upc_prom, product_id, selling_price, products_number, promotional_product
		FROM store_products
		WHERE promotional_product = true
		ORDER BY products_number DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var storeProducts []models.StoreProduct

	for rows.Next() {
		var sp models.StoreProduct
		if err := rows.Scan(
			&sp.UPC,
			&sp.UPCProm,
			&sp.ProductID,
			&sp.SellingPrice,
			&sp.ProductsNumber,
			&sp.PromotionalProduct,
		); err != nil {
			return nil, err
		}
		storeProducts = append(storeProducts, sp)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return storeProducts, nil
}

func (r *StoreProductRepository) GetAllNonPromotional() ([]models.StoreProduct, error) {
	query := `
		SELECT upc, upc_prom, product_id, selling_price, products_number, promotional_product
		FROM store_products
		WHERE promotional_product = false
		ORDER BY products_number DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var storeProducts []models.StoreProduct

	for rows.Next() {
		var sp models.StoreProduct
		if err := rows.Scan(
			&sp.UPC,
			&sp.UPCProm,
			&sp.ProductID,
			&sp.SellingPrice,
			&sp.ProductsNumber,
			&sp.PromotionalProduct,
		); err != nil {
			return nil, err
		}
		storeProducts = append(storeProducts, sp)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return storeProducts, nil
}

func (r *StoreProductRepository) Create(sp models.StoreProduct) error {
	query := `
		INSERT INTO store_products
		(upc, upc_prom, product_id, selling_price, products_number, promotional_product)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err := r.db.Exec(
		query,
		sp.UPC,
		sp.UPCProm,
		sp.ProductID,
		sp.SellingPrice,
		sp.ProductsNumber,
		sp.PromotionalProduct,
	)
	return err
}

func (r *StoreProductRepository) Update(upc string, sp models.StoreProduct) error {
	query := `
		UPDATE store_products
		SET upc_prom = $1,
		    product_id = $2,
		    selling_price = $3,
		    products_number = $4,
		    promotional_product = $5
		WHERE upc = $6
	`

	_, err := r.db.Exec(
		query,
		sp.UPCProm,
		sp.ProductID,
		sp.SellingPrice,
		sp.ProductsNumber,
		sp.PromotionalProduct,
		upc,
	)
	return err
}

func (r *StoreProductRepository) Delete(upc string) error {
	query := `DELETE FROM store_products WHERE upc = $1`

	_, err := r.db.Exec(query, upc)
	return err
}
