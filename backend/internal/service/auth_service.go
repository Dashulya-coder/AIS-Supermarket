package service

import (
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/config"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/repository"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/utils"
	"github.com/golang-jwt/jwt/v5"
)

// AuthService check username, password and user activity.
// Generate a JWT token after login and password verification.
type AuthService struct {
	repo *repository.AuthRepository
	cfg  *config.Config
}

func NewAuthService(repo *repository.AuthRepository, cfg *config.Config) *AuthService {
	return &AuthService{repo: repo, cfg: cfg}
}

func (s *AuthService) Login(req models.LoginRequest) (*models.LoginResponse, error) {
	req.Username = strings.TrimSpace(req.Username)
	req.Password = strings.TrimSpace(req.Password)

	if req.Username == "" || req.Password == "" {
		return nil, errors.New("username and password are required")
	}

	user, err := s.repo.GetByUsername(req.Username)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("invalid username or password")
		}
		return nil, err
	}

	if !user.IsActive {
		return nil, errors.New("user is inactive")
	}

	if err := utils.CheckPasswordHash(req.Password, user.PasswordHash); err != nil {
		return nil, errors.New("invalid username or password")
	}

	claims := jwt.MapClaims{
		"employee_id": user.EmployeeID,
		"username":    user.Username,
		"role":        user.Role,
		"exp":         time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		Message:    "login successful",
		Token:      tokenString,
		EmployeeID: user.EmployeeID,
		Username:   user.Username,
		Role:       user.Role,
	}, nil
}
