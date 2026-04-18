package models

type StoreProduct struct {
	UPC                string  `json:"upc" db:"upc"`
	UPCProm            *string `json:"upc_prom" db:"upc_prom"`
	ProductID          int     `json:"product_id" db:"product_id"`
	SellingPrice       float64 `json:"selling_price" db:"selling_price"`
	ProductsNumber     int     `json:"products_number" db:"products_number"`
	PromotionalProduct bool    `json:"promotional_product" db:"promotional_product"`
}
