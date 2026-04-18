package handlers

import (
	"database/sql"
	"net/http"

	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/models"
	"github.com/Dashulya-coder/AIS-Supermarket/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type EmployeeHandler struct {
	service *service.EmployeeService
}

func NewEmployeeHandler(service *service.EmployeeService) *EmployeeHandler {
	return &EmployeeHandler{service: service}
}

func (h *EmployeeHandler) GetAllEmployees(c *gin.Context) {
	if c.Query("cashiers") == "true" {
		employees, err := h.service.GetAllCashiers()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, employees)
		return
	}

	employees, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, employees)
}

func (h *EmployeeHandler) GetEmployeeByID(c *gin.Context) {
	id := c.Param("id")

	employee, err := h.service.GetByID(id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "employee not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, employee)
}

func (h *EmployeeHandler) CreateEmployee(c *gin.Context) {
	var e models.Employee

	if err := c.ShouldBindJSON(&e); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if err := h.service.Create(e); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "employee created successfully"})
}

func (h *EmployeeHandler) UpdateEmployee(c *gin.Context) {
	id := c.Param("id")

	var e models.Employee
	if err := c.ShouldBindJSON(&e); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if err := h.service.Update(id, e); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "employee updated successfully"})
}

func (h *EmployeeHandler) DeleteEmployee(c *gin.Context) {
	id := c.Param("id")

	if err := h.service.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "employee deleted successfully"})
}
