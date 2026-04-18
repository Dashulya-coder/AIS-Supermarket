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

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

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

	updateQuery := `
		UPDATE store_products
		SET products_number = products_number - $1
		WHERE upc = $2
	`

	for _, item := range items {
		_, err = tx.Exec(updateQuery, item.ProductNumber, item.UPC)
		if err != nil {
			return fmt.Errorf("failed to update store product quantity: %w", err)
		}
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

func (r *ReceiptRepository) GetByNumber(receiptNumber string) (*models.ReceiptFull, error) {
	receiptQuery := `
		SELECT receipt_number, cashier_id, card_number, print_date, sum_total, vat
		FROM receipts
		WHERE receipt_number = $1
	`

	var receipt models.ReceiptFull
	err := r.db.QueryRow(receiptQuery, receiptNumber).Scan(
		&receipt.ReceiptNumber,
		&receipt.CashierID,
		&receipt.CardNumber,
		&receipt.PrintDate,
		&receipt.SumTotal,
		&receipt.Vat,
	)
	if err != nil {
		return nil, err
	}

	itemsQuery := `
		SELECT id, receipt_number, upc, product_number, selling_price
		FROM receipt_items
		WHERE receipt_number = $1
		ORDER BY id
	`

	rows, err := r.db.Query(itemsQuery, receiptNumber)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.ReceiptItem

	for rows.Next() {
		var item models.ReceiptItem
		if err := rows.Scan(
			&item.ID,
			&item.ReceiptNumber,
			&item.UPC,
			&item.ProductNumber,
			&item.SellingPrice,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	receipt.Items = items

	return &receipt, nil
}

func (r *ReceiptRepository) GetByCashierAndPeriod(cashierID, from, to string) ([]models.Receipt, error) {
	query := `
		SELECT receipt_number, cashier_id, card_number, print_date, sum_total, vat
		FROM receipts
		WHERE cashier_id = $1
		  AND print_date BETWEEN $2 AND $3
		ORDER BY print_date DESC
	`

	rows, err := r.db.Query(query, cashierID, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var receipts []models.Receipt

	for rows.Next() {
		var receipt models.Receipt
		if err := rows.Scan(
			&receipt.ReceiptNumber,
			&receipt.CashierID,
			&receipt.CardNumber,
			&receipt.PrintDate,
			&receipt.SumTotal,
			&receipt.Vat,
		); err != nil {
			return nil, err
		}
		receipts = append(receipts, receipt)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return receipts, nil
}

func (r *ReceiptRepository) GetAllByPeriod(from, to string) ([]models.Receipt, error) {
	query := `
		SELECT receipt_number, cashier_id, card_number, print_date, sum_total, vat
		FROM receipts
		WHERE print_date BETWEEN $1 AND $2
		ORDER BY print_date DESC
	`

	rows, err := r.db.Query(query, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var receipts []models.Receipt

	for rows.Next() {
		var receipt models.Receipt
		if err := rows.Scan(
			&receipt.ReceiptNumber,
			&receipt.CashierID,
			&receipt.CardNumber,
			&receipt.PrintDate,
			&receipt.SumTotal,
			&receipt.Vat,
		); err != nil {
			return nil, err
		}
		receipts = append(receipts, receipt)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return receipts, nil
}

func (r *ReceiptRepository) Delete(receiptNumber string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	restoreQuery := `
		UPDATE store_products sp
		SET products_number = sp.products_number + ri.product_number
		FROM receipt_items ri
		WHERE ri.upc = sp.upc
		  AND ri.receipt_number = $1
	`

	_, err = tx.Exec(restoreQuery, receiptNumber)
	if err != nil {
		return fmt.Errorf("failed to restore product quantities: %w", err)
	}

	deleteItemsQuery := `DELETE FROM receipt_items WHERE receipt_number = $1`
	_, err = tx.Exec(deleteItemsQuery, receiptNumber)
	if err != nil {
		return fmt.Errorf("failed to delete receipt items: %w", err)
	}

	deleteReceiptQuery := `DELETE FROM receipts WHERE receipt_number = $1`
	_, err = tx.Exec(deleteReceiptQuery, receiptNumber)
	if err != nil {
		return fmt.Errorf("failed to delete receipt: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}
