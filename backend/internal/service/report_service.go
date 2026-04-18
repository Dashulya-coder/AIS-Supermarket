package service

import (
	"errors"
	"strings"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/repository"
)

type ReportService struct {
	repo *repository.ReportRepository
}

func NewReportService(repo *repository.ReportRepository) *ReportService {
	return &ReportService{repo: repo}
}

func (s *ReportService) GetTotalSalesByCashierAndPeriod(cashierID, from, to string) (float64, error) {
	cashierID = strings.TrimSpace(cashierID)
	from = strings.TrimSpace(from)
	to = strings.TrimSpace(to)

	if cashierID == "" {
		return 0, errors.New("cashier_id is required")
	}
	if from == "" || to == "" {
		return 0, errors.New("from and to are required")
	}

	return s.repo.GetTotalSalesByCashierAndPeriod(cashierID, from, to)
}

func (s *ReportService) GetTotalSalesByPeriod(from, to string) (float64, error) {
	from = strings.TrimSpace(from)
	to = strings.TrimSpace(to)

	if from == "" || to == "" {
		return 0, errors.New("from and to are required")
	}

	return s.repo.GetTotalSalesByPeriod(from, to)
}

func (s *ReportService) GetTotalQuantitySoldByUPC(upc, from, to string) (int, error) {
	upc = strings.TrimSpace(upc)
	from = strings.TrimSpace(from)
	to = strings.TrimSpace(to)

	if upc == "" {
		return 0, errors.New("upc is required")
	}
	if from == "" || to == "" {
		return 0, errors.New("from and to are required")
	}

	return s.repo.GetTotalQuantitySoldByUPC(upc, from, to)
}
