package main

import (
	"log"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/config"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/db"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/handlers"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/middleware"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/repository"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/service"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.New()

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

	r := gin.Default()

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
	}

	log.Println("Server started on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("failed to start server:", err)
	}
}
