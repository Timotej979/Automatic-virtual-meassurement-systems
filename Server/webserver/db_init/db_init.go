package db

import (
    "fmt"
    "log"

    "github.com/spf13/viper"
    "github.com/shopspring/decimal"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

////////////////////// DB MODEL DEINITIONS //////////////////////
type AirTemperature struct {
    ID    int    `gorm:"primaryKey"`
	Value decimal.Decimal `gorm:"type:decimal(7,6);"`
	Timestamp time.Time	
}

type AirHumidity struct {
	ID    int    `gorm:"primaryKey"`
	Value decimal.Decimal `gorm:"type:decimal(7,6);"`
	Timestamp time.Time	
}

type SoilHumidity struct {
	ID    int    `gorm:"primaryKey"`
	Value decimal.Decimal `gorm:"type:decimal(7,6);"`
	Timestamp time.Time	
}

type RelayState struct {
	ID    int    `gorm:"primaryKey"`
	Value int
	Timestamp time.Time	
}


////////////////////// DB CONFIG //////////////////////
type Config struct {
    Port   string `mapstructure:"PORT"`
    DBHost string `mapstructure:"DB_HOST"`
    DBUser string `mapstructure:"DB_USER"`
    DBPass string `mapstructure:"DB_PASS"`
    DBName string `mapstructure:"DB_NAME"`
    DBPort string `mapstructure:"DB_PORT"`
}

func LoadConfig() (c Config, err error) {
    viper.AddConfigPath("./")
    viper.SetConfigName(".env")
    viper.SetConfigType("env")
    viper.AutomaticEnv()

    err = viper.ReadInConfig()

    if err != nil {
        return
    }

    err = viper.Unmarshal(&c)

    return
}


////////////////////// DB INIT //////////////////////
func Init(c *config.Config) *gorm.DB {
    url := fmt.Sprintf("postgres://%s:%s@%s:%s/%s", c.DBUser, c.DBPass, c.DBHost, c.DBPort, c.DBName)
    db, err := gorm.Open(postgres.Open(url), &gorm.Config{})

    if err != nil {
        log.Fatalln(err)
    }

    db.AutoMigrate(&models.AirTemperature{}, &models.AirHumidity{}, &models.SoilHumidity{}, &models.RelayState{})

    return db
}

////////////////////// DB HANDLER //////////////////////
type handler struct {
    DB *gorm.DB
}