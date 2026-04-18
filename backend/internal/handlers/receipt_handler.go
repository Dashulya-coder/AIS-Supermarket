package handlers

import (
	"database/sql"
	"net/http"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type ReceiptHandler struct {
	service *service.ReceiptService
}

func NewReceiptHandler(service *service.ReceiptService) *ReceiptHandler {
	return &ReceiptHandler{service: service}
}

func (h *ReceiptHandler) CreateReceipt(c *gin.Context) {
	var req models.CreateReceiptRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	employeeIDValue, exists := c.Get("employee_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "employee_id not found in token"})
		return
	}

	cashierID, ok := employeeIDValue.(string)
	if !ok || cashierID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid employee_id in token"})
		return
	}

	receipt, err := h.service.CreateReceipt(cashierID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, receipt)
}

func (h *ReceiptHandler) GetReceiptByNumber(c *gin.Context) {
	receiptNumber := c.Param("receipt_number")

	receipt, err := h.service.GetByNumber(receiptNumber)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "receipt not found"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, receipt)
}

func (h *ReceiptHandler) GetMyReceipts(c *gin.Context) {
	employeeIDValue, exists := c.Get("employee_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "employee_id not found in token"})
		return
	}

	cashierID, ok := employeeIDValue.(string)
	if !ok || cashierID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid employee_id in token"})
		return
	}

	from := c.Query("from")
	to := c.Query("to")

	receipts, err := h.service.GetByCashierAndPeriod(cashierID, from, to)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, receipts)
}

func (h *ReceiptHandler) GetReceiptsByCashierAndPeriod(c *gin.Context) {
	cashierID := c.Query("cashier_id")
	from := c.Query("from")
	to := c.Query("to")

	receipts, err := h.service.GetByCashierAndPeriod(cashierID, from, to)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, receipts)
}

func (h *ReceiptHandler) GetAllReceiptsByPeriod(c *gin.Context) {
	from := c.Query("from")
	to := c.Query("to")

	receipts, err := h.service.GetAllByPeriod(from, to)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, receipts)
}

func (h *ReceiptHandler) DeleteReceipt(c *gin.Context) {
	receiptNumber := c.Param("receipt_number")

	if err := h.service.Delete(receiptNumber); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "receipt deleted successfully"})
}
