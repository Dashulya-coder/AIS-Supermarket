package main

import (
	"log"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/config"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/db"

	"github.com/gin-gonic/gin"
)

// run server and app
func main() {
	cfg := config.New()

	database, err := db.NewPostgresDB(cfg)
	if err != nil {
		log.Fatal("failed to connect to db:", err)
	}

	_ = database // поки просто перевірка

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	log.Println("Server started on :8080")
	r.Run(":8080")
}
