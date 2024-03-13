#!/bin/bash

# Set the correct directory
RPI_DIR="$PWD/server"
cd $RPI_DIR

# Activate the virtual environment
source .env

# Run the docker-compose file
docker compose build
docker compose up