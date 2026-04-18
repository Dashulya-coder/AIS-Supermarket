package service

import (
	"errors"
	"strings"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/repository"
)

type CustomerCardService struct {
	repo *repository.CustomerCardRepository
}

func NewCustomerCardService(repo *repository.CustomerCardRepository) *CustomerCardService {
	return &CustomerCardService{repo: repo}
}

func (s *CustomerCardService) GetAll() ([]models.CustomerCard, error) {
	return s.repo.GetAll()
}

func (s *CustomerCardService) GetByCardNumber(cardNumber string) (*models.CustomerCard, error) {
	return s.repo.GetByCardNumber(cardNumber)
}

func (s *CustomerCardService) GetBySurname(surname string) ([]models.CustomerCard, error) {
	surname = strings.TrimSpace(surname)
	return s.repo.GetBySurname(surname)
}

func (s *CustomerCardService) GetByPercent(percent int) ([]models.CustomerCard, error) {
	if percent < 0 {
		return nil, errors.New("percent cannot be negative")
	}
	return s.repo.GetByPercent(percent)
}

func (s *CustomerCardService) Create(card models.CustomerCard) error {
	card.CardNumber = strings.TrimSpace(card.CardNumber)
	card.Surname = strings.TrimSpace(card.Surname)
	card.Name = strings.TrimSpace(card.Name)
	card.Phone = strings.TrimSpace(card.Phone)

	if card.CardNumber == "" {
		return errors.New("card_number cannot be empty")
	}
	if card.Surname == "" {
		return errors.New("surname cannot be empty")
	}
	if card.Name == "" {
		return errors.New("name cannot be empty")
	}
	if card.Phone == "" {
		return errors.New("phone cannot be empty")
	}
	if len(card.Phone) > 13 {
		return errors.New("phone cannot be longer than 13 characters")
	}
	if card.Percent < 0 {
		return errors.New("percent cannot be negative")
	}

	return s.repo.Create(card)
}

func (s *CustomerCardService) Update(cardNumber string, card models.CustomerCard) error {
	card.Surname = strings.TrimSpace(card.Surname)
	card.Name = strings.TrimSpace(card.Name)
	card.Phone = strings.TrimSpace(card.Phone)

	if card.Surname == "" {
		return errors.New("surname cannot be empty")
	}
	if card.Name == "" {
		return errors.New("name cannot be empty")
	}
	if card.Phone == "" {
		return errors.New("phone cannot be empty")
	}
	if len(card.Phone) > 13 {
		return errors.New("phone cannot be longer than 13 characters")
	}
	if card.Percent < 0 {
		return errors.New("percent cannot be negative")
	}

	return s.repo.Update(cardNumber, card)
}

func (s *CustomerCardService) Delete(cardNumber string) error {
	cardNumber = strings.TrimSpace(cardNumber)
	if cardNumber == "" {
		return errors.New("invalid card number")
	}
	return s.repo.Delete(cardNumber)
}
