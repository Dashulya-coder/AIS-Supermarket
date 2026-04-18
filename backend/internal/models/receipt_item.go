package models

type ReceiptItem struct {
	ID            int     `json:"id" db:"id"`
	ReceiptNumber string  `json:"receipt_number" db:"receipt_number"`
	UPC           string  `json:"upc" db:"upc"`
	ProductNumber int     `json:"product_number" db:"product_number"`
	SellingPrice  float64 `json:"selling_price" db:"selling_price"`
}
