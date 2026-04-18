package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/repository"
)

type ReceiptService struct {
	receiptRepo      *repository.ReceiptRepository
	storeProductRepo *repository.StoreProductRepository
	customerCardRepo *repository.CustomerCardRepository
}

func NewReceiptService(
	receiptRepo *repository.ReceiptRepository,
	storeProductRepo *repository.StoreProductRepository,
	customerCardRepo *repository.CustomerCardRepository,
) *ReceiptService {
	return &ReceiptService{
		receiptRepo:      receiptRepo,
		storeProductRepo: storeProductRepo,
		customerCardRepo: customerCardRepo,
	}
}

func (s *ReceiptService) CreateReceipt(cashierID string, req models.CreateReceiptRequest) (*models.Receipt, error) {
	if cashierID == "" {
		return nil, errors.New("cashier id is required")
	}

	if len(req.Items) == 0 {
		return nil, errors.New("receipt must contain at least one item")
	}

	var sumTotal float64
	var receiptItems []models.ReceiptItem

	for _, item := range req.Items {
		if item.UPC == "" {
			return nil, errors.New("item upc cannot be empty")
		}
		if item.ProductNumber <= 0 {
			return nil, errors.New("product number must be greater than 0")
		}

		storeProduct, err := s.storeProductRepo.GetByUPC(item.UPC)
		if err != nil {
			return nil, fmt.Errorf("store product not found: %w", err)
		}

		if storeProduct.ProductsNumber < item.ProductNumber {
			return nil, fmt.Errorf("not enough stock for upc %s", item.UPC)
		}

		lineTotal := storeProduct.SellingPrice * float64(item.ProductNumber)
		sumTotal += lineTotal

		receiptItems = append(receiptItems, models.ReceiptItem{
			UPC:           item.UPC,
			ProductNumber: item.ProductNumber,
			SellingPrice:  storeProduct.SellingPrice,
		})
	}

	// discount
	if req.CardNumber != nil {
		card, err := s.customerCardRepo.GetByCardNumber(*req.CardNumber)
		if err != nil {
			return nil, fmt.Errorf("customer card not found: %w", err)
		}

		discount := float64(card.Percent) / 100.0
		sumTotal = sumTotal * (1 - discount)
	}

	vat := sumTotal * 0.2

	receipt := &models.Receipt{
		ReceiptNumber: generateReceiptNumber(),
		CashierID:     cashierID,
		CardNumber:    req.CardNumber,
		PrintDate:     time.Now().Format("2006-01-02 15:04:05"),
		SumTotal:      sumTotal,
		Vat:           vat,
	}

	for i := range receiptItems {
		receiptItems[i].ReceiptNumber = receipt.ReceiptNumber
	}

	err := s.receiptRepo.Create(*receipt, receiptItems)
	if err != nil {
		return nil, err
	}

	return receipt, nil
}

func generateReceiptNumber() string {
	return fmt.Sprintf("R%d", time.Now().UnixNano())
}
