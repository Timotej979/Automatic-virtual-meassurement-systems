package main

import (
	"encoding/json"
	"html"
	"net/http"
	"os"
	"log"
)

func healthzHandler (responseWriter http.ResponseWriter, request *http.Request) {
	responseWriter.Write([]byte("Health check successfull"))
}

func main {
	err := godotenv.Load()
	if err != nil {
		log.Println("$$ Error loading .env file $$")
	}

	port := os.Getenv("WEBSERVER_PORT")
	if port == "" {
		port = "3000"
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/healthz", healthzHandler)
	http.ListenAndServe(":" + port, mux)
}