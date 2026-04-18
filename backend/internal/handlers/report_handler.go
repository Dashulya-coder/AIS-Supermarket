package handlers

import (
	"net/http"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	service *service.ReportService
}

func NewReportHandler(service *service.ReportService) *ReportHandler {
	return &ReportHandler{service: service}
}

func (h *ReportHandler) GetTotalSalesByCashierAndPeriod(c *gin.Context) {
	cashierID := c.Query("cashier_id")
	from := c.Query("from")
	to := c.Query("to")

	total, err := h.service.GetTotalSalesByCashierAndPeriod(cashierID, from, to)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"cashier_id":  cashierID,
		"from":        from,
		"to":          to,
		"total_sales": total,
	})
}

func (h *ReportHandler) GetTotalSalesByPeriod(c *gin.Context) {
	from := c.Query("from")
	to := c.Query("to")

	total, err := h.service.GetTotalSalesByPeriod(from, to)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"from":        from,
		"to":          to,
		"total_sales": total,
	})
}

func (h *ReportHandler) GetTotalQuantitySoldByUPC(c *gin.Context) {
	upc := c.Query("upc")
	from := c.Query("from")
	to := c.Query("to")

	total, err := h.service.GetTotalQuantitySoldByUPC(upc, from, to)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"upc":            upc,
		"from":           from,
		"to":             to,
		"total_quantity": total,
	})
}
