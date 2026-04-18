package repository

import (
	"database/sql"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
)

// AuthRepository gets a user from the user table for authentication
type AuthRepository struct {
	db *sql.DB
}

func NewAuthRepository(db *sql.DB) *AuthRepository {
	return &AuthRepository{db: db}
}

func (r *AuthRepository) GetByUsername(username string) (*models.User, error) {
	query := `
		SELECT id, employee_id, username, password_hash, role, is_active
		FROM users
		WHERE username = $1
	`

	var user models.User
	err := r.db.QueryRow(query, username).Scan(
		&user.ID,
		&user.EmployeeID,
		&user.Username,
		&user.PasswordHash,
		&user.Role,
		&user.IsActive,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
