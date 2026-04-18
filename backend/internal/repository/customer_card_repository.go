package repository

import (
	"database/sql"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
)

type CustomerCardRepository struct {
	db *sql.DB
}

func NewCustomerCardRepository(db *sql.DB) *CustomerCardRepository {
	return &CustomerCardRepository{db: db}
}

func (r *CustomerCardRepository) GetAll() ([]models.CustomerCard, error) {
	query := `
		SELECT card_number, surname, name, patronymic, phone, city, street, zip_code, percent
		FROM customer_cards
		ORDER BY surname
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cards []models.CustomerCard

	for rows.Next() {
		var card models.CustomerCard
		if err := rows.Scan(
			&card.CardNumber,
			&card.Surname,
			&card.Name,
			&card.Patronymic,
			&card.Phone,
			&card.City,
			&card.Street,
			&card.ZipCode,
			&card.Percent,
		); err != nil {
			return nil, err
		}
		cards = append(cards, card)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return cards, nil
}

func (r *CustomerCardRepository) GetByCardNumber(cardNumber string) (*models.CustomerCard, error) {
	query := `
		SELECT card_number, surname, name, patronymic, phone, city, street, zip_code, percent
		FROM customer_cards
		WHERE card_number = $1
	`

	var card models.CustomerCard
	err := r.db.QueryRow(query, cardNumber).Scan(
		&card.CardNumber,
		&card.Surname,
		&card.Name,
		&card.Patronymic,
		&card.Phone,
		&card.City,
		&card.Street,
		&card.ZipCode,
		&card.Percent,
	)
	if err != nil {
		return nil, err
	}

	return &card, nil
}

func (r *CustomerCardRepository) GetBySurname(surname string) ([]models.CustomerCard, error) {
	query := `
		SELECT card_number, surname, name, patronymic, phone, city, street, zip_code, percent
		FROM customer_cards
		WHERE surname ILIKE $1
		ORDER BY surname
	`

	rows, err := r.db.Query(query, "%"+surname+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cards []models.CustomerCard

	for rows.Next() {
		var card models.CustomerCard
		if err := rows.Scan(
			&card.CardNumber,
			&card.Surname,
			&card.Name,
			&card.Patronymic,
			&card.Phone,
			&card.City,
			&card.Street,
			&card.ZipCode,
			&card.Percent,
		); err != nil {
			return nil, err
		}
		cards = append(cards, card)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return cards, nil
}

func (r *CustomerCardRepository) GetByPercent(percent int) ([]models.CustomerCard, error) {
	query := `
		SELECT card_number, surname, name, patronymic, phone, city, street, zip_code, percent
		FROM customer_cards
		WHERE percent = $1
		ORDER BY surname
	`

	rows, err := r.db.Query(query, percent)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cards []models.CustomerCard

	for rows.Next() {
		var card models.CustomerCard
		if err := rows.Scan(
			&card.CardNumber,
			&card.Surname,
			&card.Name,
			&card.Patronymic,
			&card.Phone,
			&card.City,
			&card.Street,
			&card.ZipCode,
			&card.Percent,
		); err != nil {
			return nil, err
		}
		cards = append(cards, card)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return cards, nil
}

func (r *CustomerCardRepository) Create(card models.CustomerCard) error {
	query := `
		INSERT INTO customer_cards
		(card_number, surname, name, patronymic, phone, city, street, zip_code, percent)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err := r.db.Exec(
		query,
		card.CardNumber,
		card.Surname,
		card.Name,
		card.Patronymic,
		card.Phone,
		card.City,
		card.Street,
		card.ZipCode,
		card.Percent,
	)
	return err
}

func (r *CustomerCardRepository) Update(cardNumber string, card models.CustomerCard) error {
	query := `
		UPDATE customer_cards
		SET surname = $1,
		    name = $2,
		    patronymic = $3,
		    phone = $4,
		    city = $5,
		    street = $6,
		    zip_code = $7,
		    percent = $8
		WHERE card_number = $9
	`

	_, err := r.db.Exec(
		query,
		card.Surname,
		card.Name,
		card.Patronymic,
		card.Phone,
		card.City,
		card.Street,
		card.ZipCode,
		card.Percent,
		cardNumber,
	)
	return err
}

func (r *CustomerCardRepository) Delete(cardNumber string) error {
	query := `DELETE FROM customer_cards WHERE card_number = $1`
	_, err := r.db.Exec(query, cardNumber)
	return err
}
