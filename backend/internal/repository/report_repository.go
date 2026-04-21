package repository

import "database/sql"

type ReportRepository struct {
	db *sql.DB
}

func NewReportRepository(db *sql.DB) *ReportRepository {
	return &ReportRepository{db: db}
}

func (r *ReportRepository) GetTotalSalesByCashierAndPeriod(cashierID, from, to string) (float64, error) {
	query := `
		SELECT COALESCE(SUM(sum_total), 0)
		FROM receipts
		WHERE cashier_id = $1
		  AND print_date BETWEEN $2 AND $3
	`

	var total float64
	err := r.db.QueryRow(query, cashierID, from, to).Scan(&total)
	if err != nil {
		return 0, err
	}

	return total, nil
}

func (r *ReportRepository) GetTotalSalesByPeriod(from, to string) (float64, error) {
	query := `
		SELECT COALESCE(SUM(sum_total), 0)
		FROM receipts
		WHERE print_date BETWEEN $1 AND $2
	`

	var total float64
	err := r.db.QueryRow(query, from, to).Scan(&total)
	if err != nil {
		return 0, err
	}

	return total, nil
}

func (r *ReportRepository) GetTotalQuantitySoldByUPC(upc, from, to string) (int, error) {
	query := `
		SELECT COALESCE(SUM(ri.product_number), 0)
		FROM receipt_items ri
		JOIN receipts r ON r.receipt_number = ri.receipt_number
		WHERE ri.upc = $1
		  AND r.print_date BETWEEN $2 AND $3
	`

	var total int
	err := r.db.QueryRow(query, upc, from, to).Scan(&total)
	if err != nil {
		return 0, err
	}

	return total, nil
}

func (r *ReportRepository) GetSalesSummaryByCashiers(from, to string) ([]map[string]interface{}, error) {
	query := `
		SELECT 
			e.id,
			e.surname,
			e.name,
			COUNT(r.receipt_number) AS total_receipts,
			COALESCE(SUM(r.sum_total), 0) AS total_sales,
			COALESCE(SUM(r.vat), 0) AS total_vat
		FROM receipts r
		JOIN employees e ON r.cashier_id = e.id
		JOIN users u ON u.employee_id = e.id
		WHERE r.print_date BETWEEN $1 AND $2
		GROUP BY e.id, e.surname, e.name
		ORDER BY total_sales DESC
	`

	rows, err := r.db.Query(query, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var id, surname, name string
		var totalReceipts int
		var totalSales, totalVat float64

		if err := rows.Scan(&id, &surname, &name, &totalReceipts, &totalSales, &totalVat); err != nil {
			return nil, err
		}

		results = append(results, map[string]interface{}{
			"id":              id,
			"surname":         surname,
			"name":            name,
			"total_receipts":  totalReceipts,
			"total_sales":     totalSales,
			"total_vat":       totalVat,
		})
	}

	return results, nil
}

func (r *ReportRepository) GetClientsWithOnlyPromoProducts() ([]map[string]interface{}, error) {
	query := `
		SELECT DISTINCT
			cc.card_number,
			cc.surname,
			cc.name,
			cc.phone,
			cc.percent
		FROM customer_cards cc
		WHERE NOT EXISTS (
			SELECT 1
			FROM receipts r
			JOIN receipt_items ri ON r.receipt_number = ri.receipt_number
			JOIN store_products sp ON ri.upc = sp.upc
			WHERE r.card_number = cc.card_number
			AND NOT EXISTS (
				SELECT 1
				FROM store_products sp2
				WHERE sp2.upc = ri.upc
				AND sp2.promotional_product = TRUE
			)
		)
		AND EXISTS (
			SELECT 1 FROM receipts r2
			WHERE r2.card_number = cc.card_number
		)
		ORDER BY cc.surname
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var cardNumber, surname, name, phone string
		var percent int

		if err := rows.Scan(&cardNumber, &surname, &name, &phone, &percent); err != nil {
			return nil, err
		}

		results = append(results, map[string]interface{}{
			"card_number": cardNumber,
			"surname":     surname,
			"name":        name,
			"phone":       phone,
			"percent":     percent,
		})
	}

	return results, nil
}
