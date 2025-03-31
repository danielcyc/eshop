package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v4/pgxpool"
	_ "github.com/lib/pq"
)

type Product struct {
	ID          int     `json:"id" db:"id"`
	Name        string  `json:"name" db:"name"`
	Type        string  `json:"type" db:"type"`
	Image       string  `json:"image" db:"image"`
	Price       float64 `json:"price" db:"price"`
	Description string  `json:"description" db:"description"`
}

var db *pgxpool.Pool

func initDB() {
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s", dbUser, dbPassword, dbHost, dbPort, dbName)

	// Connect to PostgreSQL
	var err error
	db, err = pgxpool.Connect(context.Background(), connStr)
	if err != nil {
		log.Fatal("Unable to connect to database: ", err)
	}

	fmt.Println("Database connected!")
}

func healthCheck(c *gin.Context) {
	const message = "eshop service ok!"
	c.JSON(http.StatusOK, message)
}

func getProducts(c *gin.Context) {

	rows, err := db.Query(context.Background(), "SELECT id, name, type, image, price, description FROM products")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var product Product
		err := rows.Scan(&product.ID, &product.Name, &product.Type, &product.Image, &product.Price, &product.Description)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan products"})
			return
		}
		products = append(products, product)
	}

	c.JSON(http.StatusOK, products)
}

func createProduct(c *gin.Context) {
	name := c.PostForm("name")
	productType := c.PostForm("type")
	price := c.PostForm("price")
	description := c.PostForm("description")

	// Handle image upload
	imageURL := ""
	file, err := c.FormFile("image")
	if err == nil {
		uploadDir := "uploads"
		if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
			os.Mkdir(uploadDir, os.ModePerm)
		}
		filePath := filepath.Join(uploadDir, file.Filename)
		if err := c.SaveUploadedFile(file, filePath); err == nil {
			imageURL = fmt.Sprintf("http://localhost:8080/%s", filePath)
		}
	}

	query := `INSERT INTO products (name, type, image, price, description) VALUES ($1, $2, $3, $4, $5) RETURNING id`
	var id int
	err = db.QueryRow(context.Background(), query, name, productType, imageURL, price, description).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": id, "name": name, "type": productType, "image": imageURL, "price": price, "description": description})
}

func updateProduct(c *gin.Context) {
	id := c.Param("id")

	// Fetch existing product
	var existingProduct Product
	err := db.QueryRow(context.Background(), "SELECT id, name, type, image, price, description FROM products WHERE id=$1", id).
		Scan(&existingProduct.ID, &existingProduct.Name, &existingProduct.Type, &existingProduct.Image, &existingProduct.Price, &existingProduct.Description)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Read new values, keeping old ones if missing
	name := c.PostForm("name")
	productType := c.PostForm("type")
	priceStr := c.PostForm("price")
	description := c.PostForm("description")

	if name == "" {
		name = existingProduct.Name
	}
	if productType == "" {
		productType = existingProduct.Type
	}
	if description == "" {
		description = existingProduct.Description
	}

	price := existingProduct.Price
	if priceStr != "" {
		var parsedPrice float64
		parsedPrice, err = strconv.ParseFloat(priceStr, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid price format"})
			return
		}
		price = parsedPrice
	}

	// Handle new image upload
	imageURL := existingProduct.Image
	file, err := c.FormFile("image")
	if err == nil {
		uploadDir := "uploads"
		if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
			os.Mkdir(uploadDir, os.ModePerm)
		}
		filePath := filepath.Join(uploadDir, file.Filename)
		if err := c.SaveUploadedFile(file, filePath); err == nil {
			imageURL = fmt.Sprintf("http://localhost:8080/%s", filePath)
		}
	}

	// Update database
	query := `UPDATE products SET name=$1, type=$2, image=$3, price=$4, description=$5 WHERE id=$6`
	_, err = db.Exec(context.Background(), query, name, productType, imageURL, price, description, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product updated", "product": Product{
		ID:          existingProduct.ID,
		Name:        name,
		Type:        productType,
		Image:       imageURL,
		Price:       price,
		Description: description,
	}})

}

func deleteProduct(c *gin.Context) {
	id := c.Param("id")

	query := `DELETE FROM products WHERE id=$1`
	result, err := db.Exec(context.Background(), query, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted"})

}

func main() {
	initDB()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Allow all origins
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.Static("/uploads", "./uploads")

	r.GET("/", healthCheck)
	r.GET("/products", getProducts)
	r.POST("/products", createProduct)
	r.PUT("/products/:id", updateProduct)
	r.DELETE("/products/:id", deleteProduct)

	r.Run(":8080")
}
