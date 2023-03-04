package main 

import (
    "log"

    "github.com/Timotej979/Automatic-virtual-meassurement-systems/Server/webserver/pkg/config"
    "github.com/Timotej979/Automatic-virtual-meassurement-systems/Server/webserver/pkg/db"
    "github.com/Timotej979/Automatic-virtual-meassurement-systems/Server/webserver/pkg/methods"

    "github.com/gofiber/fiber/v2"
)

func main() {
    c, err := config.LoadConfig()

    if err != nil {
        log.Fatalln("Failed at config", err)
    }

    h := db.Init(&c)
    app := fiber.New()

    products.RegisterRoutes(app, h)

    app.Listen(c.Port)
}