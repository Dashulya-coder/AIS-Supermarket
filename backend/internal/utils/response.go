package utils

import "github.com/gin-gonic/gin"

type SuccessResponse struct {
	Success bool `json:"success"`
	Data    any  `json:"data"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

func Success(c *gin.Context, status int, data any) {
	c.JSON(status, SuccessResponse{
		Success: true,
		Data:    data,
	})
}

func Error(c *gin.Context, status int, msg string) {
	c.JSON(status, ErrorResponse{
		Success: false,
		Error:   msg,
	})
}
