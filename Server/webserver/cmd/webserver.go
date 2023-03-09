package main 

import (
    // Import standard libraries
    "fmt"
    "log"
    "time"
    "os"

    // Import decimal, goccy/go-json
    "github.com/shopspring/decimal"
    "github.com/goccy/go-json"

    // Import gorm
    "gorm.io/driver/postgres"
    "gorm.io/gorm"

    // Import fiber
    "github.com/gofiber/fiber/v2"
)


////////////////////// DB MODEL DEFINITIONS //////////////////////
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
    Port   string `mapstructure:"WEB_PORT"`
    DBHost string `mapstructure:"DB_HOST"`
    DBUser string `mapstructure:"DB_USER"`
    DBPass string `mapstructure:"DB_PASS"`
    DBName string `mapstructure:"DB_NAME"`
    DBPort string `mapstructure:"DB_PORT"`
}

func LoadConfig() (conf Config, err error) {
    // Get environment variables from Config struct using os.Getenv()
    conf.Port = os.Getenv("WEB_PORT")
    conf.DBHost = os.Getenv("DB_HOST")
    conf.DBUser = os.Getenv("DB_USER")
    conf.DBPass = os.Getenv("DB_PASS")
    conf.DBName = os.Getenv("DB_NAME")
    conf.DBPort = os.Getenv("DB_PORT")

    // Check if environment variables are set
    if conf.Port == "" || conf.DBHost == "" || conf.DBUser == "" || conf.DBPass == "" || conf.DBName == "" || conf.DBPort == "" {
        // Genarate an error if environment variables are not set
        log.Fatalln("## Environment variables are not set ##")
        return
    } else {
        return
    }
}


////////////////////// DB INIT //////////////////////
func DBInit(conf *Config) int {
    // Connect to database
    url := fmt.Sprintf("postgres://%s:%s@%s:%s/%s", conf.DBUser, conf.DBPass, conf.DBHost, conf.DBPort, conf.DBName)
    db, err := gorm.Open(postgres.Open(url), &gorm.Config{})
    
    // Check if db connection worked
    if err != nil {
        log.Fatalln(err)
        return 0
    } else {
        log.Println("## Connected to database ##")
    }

    // Migrate the schema and close the connection
    db.AutoMigrate(AirTemperature{}, AirHumidity{}, SoilHumidity{}, RelayState{})

    // Check if db.AutoMigrate() worked
    if db.Error != nil {
        log.Fatalln("## Failed at db.AutoMigrate() ##", db.Error)
        return 0
    } else {
        log.Println("## db.AutoMigrate() worked ##") 
        return 1    
    }

    // Close the connection using error check
    dbSQL, err := db.DB()
    if err != nil {
        log.Fatalln("## Failed at closing the connection ##", err)
        return 0
    } else {
        log.Println("## Closed the connection ##")
    }
    defer dbSQL.Close()

    return 0
}

func healthzRouteHandler (c *fiber.Ctx) error {
    // return a healthz webpage
}



////////////////////// FIBER WEBSERVER //////////////////////
func fiber_webserver() {

    // Start webserver app
    app := fiber.New(fiber.Config{
        AppName: "RPI-Webserver:v1",
        Concurrency: 256*1024,
        JSONEncoder: json.Marshal,
        JSONDecoder: json.Unmarshal,
        RequestMethods: "GET",
    })

    app.Get("/healthz", healthzRouteHandler)

    
    err := app.Listen(conf.Port)
    if err != nil {
        log.Fatalln("## Failed at listening to app ##", err)
    } else {
        log.Println("## Listening to app worked ##")
    }
}


////////////////////// MAIN APP //////////////////////
func main() {
    // Get config and error check it
    conf, err := LoadConfig()

    if err != nil {
        log.Fatalln("Failed at config", err)
    }

    if DBInit(&conf) == 1 {
        log.Println("## DB schema initialized ##")
    } else {
        log.Fatalln("## DB schema failed at initialization ##")
    }

    fiber_webserver()   
}