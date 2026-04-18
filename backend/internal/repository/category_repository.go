package repository

import (
	"database/sql"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
)

// CategoryRepository db interaction and sql queries
type CategoryRepository struct {
	db *sql.DB
}

func NewCategoryRepository(db *sql.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) GetAll() ([]models.Category, error) {
	query := `SELECT id, name FROM categories ORDER BY name`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []models.Category

	for rows.Next() {
		var category models.Category
		if err := rows.Scan(&category.ID, &category.Name); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return categories, nil
}

func (r *CategoryRepository) Create(category models.Category) error {
	query := `INSERT INTO categories (name) VALUES ($1)`

	_, err := r.db.Exec(query, category.Name)
	return err
}

func (r *CategoryRepository) GetByID(id int) (*models.Category, error) {
	query := `SELECT id, name FROM categories WHERE id = $1`

	var category models.Category
	err := r.db.QueryRow(query, id).Scan(&category.ID, &category.Name)
	if err != nil {
		return nil, err
	}

	return &category, nil
}

func (r *CategoryRepository) Update(id int, category models.Category) error {
	query := `UPDATE categories SET name = $1 WHERE id = $2`

	_, err := r.db.Exec(query, category.Name, id)
	return err
}

func (r *CategoryRepository) Delete(id int) error {
	query := `DELETE FROM categories WHERE id = $1`

	_, err := r.db.Exec(query, id)
	return err
}
