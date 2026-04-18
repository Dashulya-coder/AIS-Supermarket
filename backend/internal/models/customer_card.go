package models

type CustomerCard struct {
	CardNumber string  `json:"card_number" db:"card_number"`
	Surname    string  `json:"surname" db:"surname"`
	Name       string  `json:"name" db:"name"`
	Patronymic *string `json:"patronymic" db:"patronymic"`
	Phone      string  `json:"phone" db:"phone"`
	City       *string `json:"city" db:"city"`
	Street     *string `json:"street" db:"street"`
	ZipCode    *string `json:"zip_code" db:"zip_code"`
	Percent    int     `json:"percent" db:"percent"`
}
