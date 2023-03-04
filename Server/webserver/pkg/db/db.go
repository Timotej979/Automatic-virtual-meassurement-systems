package db

import (
    "fmt"
    "log"

    "github.com/Timotej979/Automatic-virtual-meassurement-systems/Server/webserver/pkg/config"
    "github.com/Timotej979/Automatic-virtual-meassurement-systems/Server/webserver/pkg/models"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

func Init(c *config.Config) *gorm.DB {
    url := fmt.Sprintf("postgres://%s:%s@%s:%s/%s", c.DBUser, c.DBPass, c.DBHost, c.DBPort, c.DBName)
    db, err := gorm.Open(postgres.Open(url), &gorm.Config{})

    if err != nil {
        log.Fatalln(err)
    }

    db.AutoMigrate(&models.AirTemperature{}, &models.AirHumidity{}, &models.SoilHumidity{}, &models.RelayState{})

    return db
}