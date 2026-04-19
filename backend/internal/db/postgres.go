package db

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/config"
	_ "github.com/lib/pq"
)

// NewPostgresDB connection to Postgres
func NewPostgresDB(cfg *config.Config) (*sql.DB, error) {
	var dsn string

	if cfg.DBPassword == "" {
		dsn = fmt.Sprintf(
			"host=%s port=%s user=%s dbname=%s sslmode=disable",
			cfg.DBHost,
			cfg.DBPort,
			cfg.DBUser,
			cfg.DBName,
		)
	} else {
		dsn = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
			cfg.DBHost,
			cfg.DBPort,
			cfg.DBUser,
			cfg.DBPassword,
			cfg.DBName,
		)
	}

	log.Println("Postgres DSN:", dsn)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}
