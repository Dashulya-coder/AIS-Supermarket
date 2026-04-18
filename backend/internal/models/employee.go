package models

type Employee struct {
	ID          string  `json:"id" db:"id"`
	Surname     string  `json:"surname" db:"surname"`
	Name        string  `json:"name" db:"name"`
	Patronymic  *string `json:"patronymic" db:"patronymic"`
	Position    string  `json:"position" db:"position"`
	Salary      float64 `json:"salary" db:"salary"`
	DateOfBirth string  `json:"date_of_birth" db:"date_of_birth"`
	DateOfStart string  `json:"date_of_start" db:"date_of_start"`
	Phone       string  `json:"phone" db:"phone"`
	City        string  `json:"city" db:"city"`
	Street      string  `json:"street" db:"street"`
	ZipCode     string  `json:"zip_code" db:"zip_code"`
}
