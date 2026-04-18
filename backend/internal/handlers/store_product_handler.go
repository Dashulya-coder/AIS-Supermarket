package handlers

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type StoreProductHandler struct {
	service *service.StoreProductService
}

func NewStoreProductHandler(service *service.StoreProductService) *StoreProductHandler {
	return &StoreProductHandler{service: service}
}

func (h *StoreProductHandler) GetAllStoreProducts(c *gin.Context) {
	promotional := strings.TrimSpace(c.Query("promotional"))

	if promotional == "true" {
		products, err := h.service.GetAllPromotional()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, products)
		return
	}

	if promotional == "false" {
		products, err := h.service.GetAllNonPromotional()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, products)
		return
	}

	products, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, products)
}

func (h *StoreProductHandler) GetStoreProductByUPC(c *gin.Context) {
	upc := c.Param("upc")

	product, err := h.service.GetByUPC(upc)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "store product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, product)
}

func (h *StoreProductHandler) CreateStoreProduct(c *gin.Context) {
	var sp models.StoreProduct

	if err := c.ShouldBindJSON(&sp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if err := h.service.Create(sp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "store product created successfully"})
}

func (h *StoreProductHandler) UpdateStoreProduct(c *gin.Context) {
	upc := c.Param("upc")

	var sp models.StoreProduct
	if err := c.ShouldBindJSON(&sp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if err := h.service.Update(upc, sp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "store product updated successfully"})
}

func (h *StoreProductHandler) DeleteStoreProduct(c *gin.Context) {
	upc := c.Param("upc")

	if err := h.service.Delete(upc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "store product deleted successfully"})
}
