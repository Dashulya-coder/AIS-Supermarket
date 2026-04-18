package models

type Product struct {
	ID              int    `json:"id" db:"id"`
	CategoryID      int    `json:"category_id" db:"category_id"`
	Name            string `json:"name" db:"name"`
	Producer        string `json:"producer" db:"producer"`
	Characteristics string `json:"characteristics" db:"characteristics"`
}
