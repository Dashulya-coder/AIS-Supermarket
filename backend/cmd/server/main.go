package main

import (
	"log"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/config"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/db"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/handlers"
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

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.GET("/categories", categoryHandler.GetAllCategories)
	r.POST("/categories", categoryHandler.CreateCategory)
	r.GET("/categories/:id", categoryHandler.GetCategoryByID)
	r.PUT("/categories/:id", categoryHandler.UpdateCategory)
	r.DELETE("/categories/:id", categoryHandler.DeleteCategory)

	r.GET("/products", productHandler.GetAllProducts)
	r.GET("/products/:id", productHandler.GetProductByID)
	r.POST("/products", productHandler.CreateProduct)
	r.PUT("/products/:id", productHandler.UpdateProduct)
	r.DELETE("/products/:id", productHandler.DeleteProduct)

	r.GET("/store-products", storeProductHandler.GetAllStoreProducts)
	r.GET("/store-products/:upc", storeProductHandler.GetStoreProductByUPC)
	r.POST("/store-products", storeProductHandler.CreateStoreProduct)
	r.PUT("/store-products/:upc", storeProductHandler.UpdateStoreProduct)
	r.DELETE("/store-products/:upc", storeProductHandler.DeleteStoreProduct)

	r.GET("/customer-cards", customerCardHandler.GetAllCustomerCards)
	r.GET("/customer-cards/:card_number", customerCardHandler.GetCustomerCardByNumber)
	r.POST("/customer-cards", customerCardHandler.CreateCustomerCard)
	r.PUT("/customer-cards/:card_number", customerCardHandler.UpdateCustomerCard)
	r.DELETE("/customer-cards/:card_number", customerCardHandler.DeleteCustomerCard)

	r.GET("/employees", employeeHandler.GetAllEmployees)
	r.GET("/employees/:id", employeeHandler.GetEmployeeByID)
	r.POST("/employees", employeeHandler.CreateEmployee)
	r.PUT("/employees/:id", employeeHandler.UpdateEmployee)
	r.DELETE("/employees/:id", employeeHandler.DeleteEmployee)
	
	log.Println("Server started on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("failed to start server:", err)
	}
}
