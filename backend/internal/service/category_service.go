package service

import (
	"errors"
	"strings"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/repository"
)

// CategoryService business logic between handler and repository
type CategoryService struct {
	repo *repository.CategoryRepository
}

func NewCategoryService(repo *repository.CategoryRepository) *CategoryService {
	return &CategoryService{repo: repo}
}

func (s *CategoryService) GetAll() ([]models.Category, error) {
	return s.repo.GetAll()
}

func (s *CategoryService) Create(category models.Category) error {
	category.Name = strings.TrimSpace(category.Name)

	if category.Name == "" {
		return errors.New("category name cannot be empty")
	}

	return s.repo.Create(category)
}

func (s *CategoryService) GetByID(id int) (*models.Category, error) {
	return s.repo.GetByID(id)
}

func (s *CategoryService) Update(id int, category models.Category) error {
	category.Name = strings.TrimSpace(category.Name)

	if category.Name == "" {
		return errors.New("category name cannot be empty")
	}

	return s.repo.Update(id, category)
}

func (s *CategoryService) Delete(id int) error {
	return s.repo.Delete(id)
}
