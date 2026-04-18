package service

import (
	"errors"
	"strings"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/repository"
)

type EmployeeService struct {
	repo *repository.EmployeeRepository
}

func NewEmployeeService(repo *repository.EmployeeRepository) *EmployeeService {
	return &EmployeeService{repo: repo}
}

func (s *EmployeeService) GetAll() ([]models.Employee, error) {
	return s.repo.GetAll()
}

func (s *EmployeeService) GetAllCashiers() ([]models.Employee, error) {
	return s.repo.GetAllCashiers()
}

func (s *EmployeeService) GetByID(id string) (*models.Employee, error) {
	return s.repo.GetByID(id)
}

func (s *EmployeeService) Create(e models.Employee) error {
	e.ID = strings.TrimSpace(e.ID)
	e.Surname = strings.TrimSpace(e.Surname)
	e.Name = strings.TrimSpace(e.Name)
	e.Position = strings.TrimSpace(e.Position)
	e.Phone = strings.TrimSpace(e.Phone)
	e.City = strings.TrimSpace(e.City)
	e.Street = strings.TrimSpace(e.Street)
	e.ZipCode = strings.TrimSpace(e.ZipCode)

	if e.ID == "" {
		return errors.New("id cannot be empty")
	}
	if e.Surname == "" {
		return errors.New("surname cannot be empty")
	}
	if e.Name == "" {
		return errors.New("name cannot be empty")
	}
	if e.Position != "Manager" && e.Position != "Cashier" {
		return errors.New("position must be Manager or Cashier")
	}
	if e.Salary < 0 {
		return errors.New("salary cannot be negative")
	}
	if e.Phone == "" || len(e.Phone) > 13 {
		return errors.New("invalid phone")
	}

	return s.repo.Create(e)
}

func (s *EmployeeService) Update(id string, e models.Employee) error {
	e.Surname = strings.TrimSpace(e.Surname)
	e.Name = strings.TrimSpace(e.Name)
	e.Position = strings.TrimSpace(e.Position)
	e.Phone = strings.TrimSpace(e.Phone)
	e.City = strings.TrimSpace(e.City)
	e.Street = strings.TrimSpace(e.Street)
	e.ZipCode = strings.TrimSpace(e.ZipCode)

	if e.Surname == "" {
		return errors.New("surname cannot be empty")
	}
	if e.Name == "" {
		return errors.New("name cannot be empty")
	}
	if e.Position != "Manager" && e.Position != "Cashier" {
		return errors.New("position must be Manager or Cashier")
	}
	if e.Salary < 0 {
		return errors.New("salary cannot be negative")
	}
	if e.Phone == "" || len(e.Phone) > 13 {
		return errors.New("invalid phone")
	}

	return s.repo.Update(id, e)
}

func (s *EmployeeService) Delete(id string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return errors.New("invalid id")
	}
	return s.repo.Delete(id)
}
