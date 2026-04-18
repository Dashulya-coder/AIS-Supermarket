package service

import (
	"errors"
	"strings"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/repository"
)

type StoreProductService struct {
	repo *repository.StoreProductRepository
}

func NewStoreProductService(repo *repository.StoreProductRepository) *StoreProductService {
	return &StoreProductService{repo: repo}
}

func (s *StoreProductService) GetAll() ([]models.StoreProduct, error) {
	return s.repo.GetAll()
}

func (s *StoreProductService) GetByUPC(upc string) (*models.StoreProduct, error) {
	return s.repo.GetByUPC(upc)
}

func (s *StoreProductService) GetAllPromotional() ([]models.StoreProduct, error) {
	return s.repo.GetAllPromotional()
}

func (s *StoreProductService) GetAllNonPromotional() ([]models.StoreProduct, error) {
	return s.repo.GetAllNonPromotional()
}

func (s *StoreProductService) Create(sp models.StoreProduct) error {
	sp.UPC = strings.TrimSpace(sp.UPC)

	if sp.UPC == "" {
		return errors.New("upc cannot be empty")
	}
	if sp.ProductID <= 0 {
		return errors.New("product_id must be greater than 0")
	}
	if sp.SellingPrice < 0 {
		return errors.New("selling_price cannot be negative")
	}
	if sp.ProductsNumber < 0 {
		return errors.New("products_number cannot be negative")
	}
	if sp.PromotionalProduct && sp.UPCProm == nil {
		return errors.New("promotional product must reference base product upc")
	}

	return s.repo.Create(sp)
}

func (s *StoreProductService) Update(upc string, sp models.StoreProduct) error {
	if sp.ProductID <= 0 {
		return errors.New("product_id must be greater than 0")
	}
	if sp.SellingPrice < 0 {
		return errors.New("selling_price cannot be negative")
	}
	if sp.ProductsNumber < 0 {
		return errors.New("products_number cannot be negative")
	}
	if sp.PromotionalProduct && sp.UPCProm == nil {
		return errors.New("promotional product must reference base product upc")
	}

	return s.repo.Update(upc, sp)
}

func (s *StoreProductService) Delete(upc string) error {
	upc = strings.TrimSpace(upc)
	if upc == "" {
		return errors.New("invalid upc")
	}

	return s.repo.Delete(upc)
}
