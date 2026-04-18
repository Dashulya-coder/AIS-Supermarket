package models

// User describes user and login structure
type User struct {
	ID           int    `json:"id" db:"id"`
	EmployeeID   string `json:"employee_id" db:"employee_id"`
	Username     string `json:"username" db:"username"`
	PasswordHash string `json:"-" db:"password_hash"`
	Role         string `json:"role" db:"role"`
	IsActive     bool   `json:"is_active" db:"is_active"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Message    string `json:"message"`
	EmployeeID string `json:"employee_id"`
	Username   string `json:"username"`
	Role       string `json:"role"`
}
