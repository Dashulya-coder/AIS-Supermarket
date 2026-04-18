package repository

import (
	"database/sql"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
)

type EmployeeRepository struct {
	db *sql.DB
}

func NewEmployeeRepository(db *sql.DB) *EmployeeRepository {
	return &EmployeeRepository{db: db}
}

func (r *EmployeeRepository) GetAll() ([]models.Employee, error) {
	query := `
		SELECT id, surname, name, patronymic, position, salary,
		       date_of_birth, date_of_start, phone, city, street, zip_code
		FROM employees
		ORDER BY surname
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var employees []models.Employee

	for rows.Next() {
		var e models.Employee
		if err := rows.Scan(
			&e.ID,
			&e.Surname,
			&e.Name,
			&e.Patronymic,
			&e.Position,
			&e.Salary,
			&e.DateOfBirth,
			&e.DateOfStart,
			&e.Phone,
			&e.City,
			&e.Street,
			&e.ZipCode,
		); err != nil {
			return nil, err
		}
		employees = append(employees, e)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return employees, nil
}

func (r *EmployeeRepository) GetAllCashiers() ([]models.Employee, error) {
	query := `
		SELECT id, surname, name, patronymic, position, salary,
		       date_of_birth, date_of_start, phone, city, street, zip_code
		FROM employees
		WHERE position = 'Cashier'
		ORDER BY surname
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var employees []models.Employee

	for rows.Next() {
		var e models.Employee
		if err := rows.Scan(
			&e.ID,
			&e.Surname,
			&e.Name,
			&e.Patronymic,
			&e.Position,
			&e.Salary,
			&e.DateOfBirth,
			&e.DateOfStart,
			&e.Phone,
			&e.City,
			&e.Street,
			&e.ZipCode,
		); err != nil {
			return nil, err
		}
		employees = append(employees, e)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return employees, nil
}

func (r *EmployeeRepository) GetByID(id string) (*models.Employee, error) {
	query := `
		SELECT id, surname, name, patronymic, position, salary,
		       date_of_birth, date_of_start, phone, city, street, zip_code
		FROM employees
		WHERE id = $1
	`

	var e models.Employee
	err := r.db.QueryRow(query, id).Scan(
		&e.ID,
		&e.Surname,
		&e.Name,
		&e.Patronymic,
		&e.Position,
		&e.Salary,
		&e.DateOfBirth,
		&e.DateOfStart,
		&e.Phone,
		&e.City,
		&e.Street,
		&e.ZipCode,
	)
	if err != nil {
		return nil, err
	}

	return &e, nil
}

func (r *EmployeeRepository) Create(e models.Employee) error {
	query := `
		INSERT INTO employees
		(id, surname, name, patronymic, position, salary, date_of_birth, date_of_start, phone, city, street, zip_code)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`

	_, err := r.db.Exec(
		query,
		e.ID,
		e.Surname,
		e.Name,
		e.Patronymic,
		e.Position,
		e.Salary,
		e.DateOfBirth,
		e.DateOfStart,
		e.Phone,
		e.City,
		e.Street,
		e.ZipCode,
	)
	return err
}

func (r *EmployeeRepository) Update(id string, e models.Employee) error {
	query := `
		UPDATE employees
		SET surname = $1,
		    name = $2,
		    patronymic = $3,
		    position = $4,
		    salary = $5,
		    date_of_birth = $6,
		    date_of_start = $7,
		    phone = $8,
		    city = $9,
		    street = $10,
		    zip_code = $11
		WHERE id = $12
	`

	_, err := r.db.Exec(
		query,
		e.Surname,
		e.Name,
		e.Patronymic,
		e.Position,
		e.Salary,
		e.DateOfBirth,
		e.DateOfStart,
		e.Phone,
		e.City,
		e.Street,
		e.ZipCode,
		id,
	)
	return err
}

func (r *EmployeeRepository) Delete(id string) error {
	query := `DELETE FROM employees WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
