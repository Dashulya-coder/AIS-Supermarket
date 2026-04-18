package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type CustomerCardHandler struct {
	service *service.CustomerCardService
}

func NewCustomerCardHandler(service *service.CustomerCardService) *CustomerCardHandler {
	return &CustomerCardHandler{service: service}
}

func (h *CustomerCardHandler) GetAllCustomerCards(c *gin.Context) {
	surname := strings.TrimSpace(c.Query("surname"))
	percentParam := strings.TrimSpace(c.Query("percent"))

	if surname != "" {
		cards, err := h.service.GetBySurname(surname)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, cards)
		return
	}

	if percentParam != "" {
		percent, err := strconv.Atoi(percentParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid percent"})
			return
		}

		cards, err := h.service.GetByPercent(percent)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, cards)
		return
	}

	cards, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, cards)
}

func (h *CustomerCardHandler) GetCustomerCardByNumber(c *gin.Context) {
	cardNumber := c.Param("card_number")

	card, err := h.service.GetByCardNumber(cardNumber)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "customer card not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, card)
}

func (h *CustomerCardHandler) CreateCustomerCard(c *gin.Context) {
	var card models.CustomerCard

	if err := c.ShouldBindJSON(&card); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if err := h.service.Create(card); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "customer card created successfully"})
}

func (h *CustomerCardHandler) UpdateCustomerCard(c *gin.Context) {
	cardNumber := c.Param("card_number")

	var card models.CustomerCard
	if err := c.ShouldBindJSON(&card); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if err := h.service.Update(cardNumber, card); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "customer card updated successfully"})
}

func (h *CustomerCardHandler) DeleteCustomerCard(c *gin.Context) {
	cardNumber := c.Param("card_number")

	if err := h.service.Delete(cardNumber); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "customer card deleted successfully"})
}
