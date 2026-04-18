package repository

import (
	"database/sql"
	"fmt"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
)

type ReceiptRepository struct {
	db *sql.DB
}

func NewReceiptRepository(db *sql.DB) *ReceiptRepository {
	return &ReceiptRepository{db: db}
}

func (r *ReceiptRepository) Create(receipt models.Receipt, items []models.ReceiptItem) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}

	// rollback if failure
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// insert receipt
	receiptQuery := `
		INSERT INTO receipts (receipt_number, cashier_id, card_number, print_date, sum_total, vat)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err = tx.Exec(
		receiptQuery,
		receipt.ReceiptNumber,
		receipt.CashierID,
		receipt.CardNumber,
		receipt.PrintDate,
		receipt.SumTotal,
		receipt.Vat,
	)
	if err != nil {
		return fmt.Errorf("failed to insert receipt: %w", err)
	}

	// insert receipt_items
	itemQuery := `
		INSERT INTO receipt_items (receipt_number, upc, product_number, selling_price)
		VALUES ($1, $2, $3, $4)
	`

	for _, item := range items {
		_, err = tx.Exec(
			itemQuery,
			item.ReceiptNumber,
			item.UPC,
			item.ProductNumber,
			item.SellingPrice,
		)
		if err != nil {
			return fmt.Errorf("failed to insert receipt item: %w", err)
		}
	}

	// update store_products (reduce quantity)
	updateQuery := `
		UPDATE store_products
		SET products_number = products_number - $1
		WHERE upc = $2
	`

	for _, item := range items {
		_, err = tx.Exec(
			updateQuery,
			item.ProductNumber,
			item.UPC,
		)
		if err != nil {
			return fmt.Errorf("failed to update stock: %w", err)
		}
	}

	// commit - changes applied
	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}
