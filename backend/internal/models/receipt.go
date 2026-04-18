package models

type Receipt struct {
	ReceiptNumber string  `json:"receipt_number" db:"receipt_number"`
	CashierID     string  `json:"cashier_id" db:"cashier_id"`
	CardNumber    *string `json:"card_number" db:"card_number"`
	PrintDate     string  `json:"print_date" db:"print_date"`
	SumTotal      float64 `json:"sum_total" db:"sum_total"`
	Vat           float64 `json:"vat" db:"vat"`
}

type CreateReceiptItemInput struct {
	UPC           string `json:"upc"`
	ProductNumber int    `json:"product_number"`
}

type CreateReceiptRequest struct {
	CardNumber *string                  `json:"card_number"`
	Items      []CreateReceiptItemInput `json:"items"`
}

type ReceiptFull struct {
	ReceiptNumber string        `json:"receipt_number"`
	CashierID     string        `json:"cashier_id"`
	CardNumber    *string       `json:"card_number"`
	PrintDate     string        `json:"print_date"`
	SumTotal      float64       `json:"sum_total"`
	Vat           float64       `json:"vat"`
	Items         []ReceiptItem `json:"items"`
}
