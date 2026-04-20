package main

import (
	"log"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/config"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/db"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/handlers"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/middleware"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/repository"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/service"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.New()
	log.Println("DB_HOST:", cfg.DBHost)
	log.Println("DB_PORT:", cfg.DBPort)
	log.Println("DB_USER:", cfg.DBUser)
	log.Println("DB_NAME:", cfg.DBName)

	database, err := db.NewPostgresDB(cfg)
	if err != nil {
		log.Fatal("failed to connect to db:", err)
	}

	categoryRepo := repository.NewCategoryRepository(database)
	categoryService := service.NewCategoryService(categoryRepo)
	categoryHandler := handlers.NewCategoryHandler(categoryService)

	productRepo := repository.NewProductRepository(database)
	productService := service.NewProductService(productRepo)
	productHandler := handlers.NewProductHandler(productService)

	storeProductRepo := repository.NewStoreProductRepository(database)
	storeProductService := service.NewStoreProductService(storeProductRepo)
	storeProductHandler := handlers.NewStoreProductHandler(storeProductService)

	customerCardRepo := repository.NewCustomerCardRepository(database)
	customerCardService := service.NewCustomerCardService(customerCardRepo)
	customerCardHandler := handlers.NewCustomerCardHandler(customerCardService)

	employeeRepo := repository.NewEmployeeRepository(database)
	employeeService := service.NewEmployeeService(employeeRepo)
	employeeHandler := handlers.NewEmployeeHandler(employeeService)

	authRepo := repository.NewAuthRepository(database)
	authService := service.NewAuthService(authRepo, cfg)
	authHandler := handlers.NewAuthHandler(authService)

	receiptRepo := repository.NewReceiptRepository(database)
	receiptService := service.NewReceiptService(receiptRepo, storeProductRepo, customerCardRepo)
	receiptHandler := handlers.NewReceiptHandler(receiptService)

	reportRepo := repository.NewReportRepository(database)
	reportService := service.NewReportService(reportRepo)
	reportHandler := handlers.NewReportHandler(reportService)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// public routes
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	r.POST("/auth/login", authHandler.Login)

	// authenticated routes for any logged-in user
	authGroup := r.Group("/")
	authGroup.Use(middleware.AuthMiddleware(cfg))
	{
		authGroup.GET("/me", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"employee_id": c.GetString("employee_id"),
				"username":    c.GetString("username"),
				"role":        c.GetString("role"),
			})
		})
		authGroup.GET("/employees/me", employeeHandler.GetMe)
	}

	// routes for Manager only
	managerGroup := r.Group("/")
	managerGroup.Use(middleware.AuthMiddleware(cfg), middleware.RequireRole("Manager"))
	{
		managerGroup.POST("/categories", categoryHandler.CreateCategory)
		managerGroup.PUT("/categories/:id", categoryHandler.UpdateCategory)
		managerGroup.DELETE("/categories/:id", categoryHandler.DeleteCategory)

		managerGroup.POST("/products", productHandler.CreateProduct)
		managerGroup.PUT("/products/:id", productHandler.UpdateProduct)
		managerGroup.DELETE("/products/:id", productHandler.DeleteProduct)

		managerGroup.POST("/store-products", storeProductHandler.CreateStoreProduct)
		managerGroup.PUT("/store-products/:upc", storeProductHandler.UpdateStoreProduct)
		managerGroup.DELETE("/store-products/:upc", storeProductHandler.DeleteStoreProduct)

		managerGroup.GET("/employees", employeeHandler.GetAllEmployees)
		managerGroup.GET("/employees/:id", employeeHandler.GetEmployeeByID)
		managerGroup.POST("/employees", employeeHandler.CreateEmployee)
		managerGroup.PUT("/employees/:id", employeeHandler.UpdateEmployee)
		managerGroup.DELETE("/employees/:id", employeeHandler.DeleteEmployee)

		managerGroup.DELETE("/customer-cards/:card_number", customerCardHandler.DeleteCustomerCard)

		managerGroup.GET("/receipts", receiptHandler.GetReceiptsByCashierAndPeriod)
		managerGroup.GET("/receipts/all", receiptHandler.GetAllReceiptsByPeriod)
		managerGroup.DELETE("/receipts/:receipt_number", receiptHandler.DeleteReceipt)

		managerGroup.GET("/reports/sales-by-cashier", reportHandler.GetTotalSalesByCashierAndPeriod)
		managerGroup.GET("/reports/sales-total", reportHandler.GetTotalSalesByPeriod)
		managerGroup.GET("/reports/product-quantity", reportHandler.GetTotalQuantitySoldByUPC)
	}

	// routes for Manager and Cashier
	sharedGroup := r.Group("/")
	sharedGroup.Use(middleware.AuthMiddleware(cfg), middleware.RequireRole("Manager", "Cashier"))
	{
		sharedGroup.GET("/categories", categoryHandler.GetAllCategories)
		sharedGroup.GET("/categories/:id", categoryHandler.GetCategoryByID)

		sharedGroup.GET("/products", productHandler.GetAllProducts)
		sharedGroup.GET("/products/:id", productHandler.GetProductByID)

		sharedGroup.GET("/store-products", storeProductHandler.GetAllStoreProducts)
		sharedGroup.GET("/store-products/:upc", storeProductHandler.GetStoreProductByUPC)

		sharedGroup.GET("/customer-cards", customerCardHandler.GetAllCustomerCards)
		sharedGroup.GET("/customer-cards/:card_number", customerCardHandler.GetCustomerCardByNumber)
		sharedGroup.POST("/customer-cards", customerCardHandler.CreateCustomerCard)
		sharedGroup.PUT("/customer-cards/:card_number", customerCardHandler.UpdateCustomerCard)

		sharedGroup.GET("/receipts/:receipt_number", receiptHandler.GetReceiptByNumber)
	}

	cashierGroup := r.Group("/")
	cashierGroup.Use(middleware.AuthMiddleware(cfg), middleware.RequireRole("Cashier"))
	{
		cashierGroup.POST("/receipts", receiptHandler.CreateReceipt)
		cashierGroup.GET("/receipts/my", receiptHandler.GetMyReceipts)
	}

	port := cfg.AppPort
	if port == "" {
		port = "8080"
	}

	log.Println("Server started on :" + port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("failed to start server:", err)
	}
}
