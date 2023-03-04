package models

import(
	"github.com/shopspring/decimal"
)

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