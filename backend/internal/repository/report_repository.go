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
