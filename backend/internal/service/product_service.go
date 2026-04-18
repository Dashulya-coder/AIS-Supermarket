package service

import (
	"errors"
	"strings"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/repository"
)

// ProductService check data before executing a query
type ProductService struct {
	repo *repository.ProductRepository
}

func NewProductService(repo *repository.ProductRepository) *ProductService {
	return &ProductService{repo: repo}
}

func (s *ProductService) GetAll() ([]models.Product, error) {
	return s.repo.GetAll()
}

func (s *ProductService) GetByID(id int) (*models.Product, error) {
	return s.repo.GetByID(id)
}

func (s *ProductService) GetByCategoryID(categoryID int) ([]models.Product, error) {
	return s.repo.GetByCategoryID(categoryID)
}

func (s *ProductService) Create(product models.Product) error {
	product.Name = strings.TrimSpace(product.Name)
	product.Producer = strings.TrimSpace(product.Producer)
	product.Characteristics = strings.TrimSpace(product.Characteristics)

	if product.CategoryID <= 0 {
		return errors.New("category_id must be greater than 0")
	}
	if product.Name == "" {
		return errors.New("product name cannot be empty")
	}
	if product.Producer == "" {
		return errors.New("producer cannot be empty")
	}
	if product.Characteristics == "" {
		return errors.New("characteristics cannot be empty")
	}

	return s.repo.Create(product)
}

func (s *ProductService) Update(id int, product models.Product) error {
	product.Name = strings.TrimSpace(product.Name)
	product.Producer = strings.TrimSpace(product.Producer)
	product.Characteristics = strings.TrimSpace(product.Characteristics)

	if product.CategoryID <= 0 {
		return errors.New("category_id must be greater than 0")
	}
	if product.Name == "" {
		return errors.New("product name cannot be empty")
	}
	if product.Producer == "" {
		return errors.New("producer cannot be empty")
	}
	if product.Characteristics == "" {
		return errors.New("characteristics cannot be empty")
	}

	return s.repo.Update(id, product)
}

func (s *ProductService) Delete(id int) error {
	return s.repo.Delete(id)
}
