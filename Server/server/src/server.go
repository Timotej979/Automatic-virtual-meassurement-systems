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
    DBHost string `mapstructure:"DB_HOST"`
    DBUser string `mapstructure:"DB_USER"`
    DBPass string `mapstructure:"DB_PASS"`
    DBName string `mapstructure:"DB_NAME"`
    DBPort string `mapstructure:"DB_PORT"`
}

func LoadConfig() (conf Config, err error) {
    // Get environment variables from Config struct using os.Getenv()
    conf.DBHost = os.Getenv("DB_HOST")
    conf.DBUser = os.Getenv("DB_USER")
    conf.DBPass = os.Getenv("DB_PASS")
    conf.DBName = os.Getenv("DB_NAME")
    conf.DBPort = os.Getenv("DB_PORT")

    // Check if environment variables are set
    if conf.DBHost == "" || conf.DBUser == "" || conf.DBPass == "" || conf.DBName == "" || conf.DBPort == "" {
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
        return -1
    } else {
        log.Println("## Connected to database ##")
    }

    // Migrate the schema and close the connection
    db.AutoMigrate(AirTemperature{}, AirHumidity{}, SoilHumidity{}, RelayState{})

    // Check if db.AutoMigrate() worked
    if db.Error != nil {
        log.Fatalln("## Failed at db.AutoMigrate() ##", db.Error)
        return -1
    } else {
        log.Println("## db.AutoMigrate() worked ##")     
    }

    // Close the connection using error check
    dbSQL, err := db.DB()
    if err != nil {
        log.Fatalln("## Failed at closing the connection ##", err)
        return -1
    } else {
        log.Println("## Closed the connection ##")
    }
    defer dbSQL.Close()

    return 0
}

////////////////////// DB CONNECTION POOL INIT //////////////////////
func DBPoolInit(conf *Config) (*sql.DB, int) {
    // Connect to database
    url := fmt.Sprintf("postgres://%s:%s@%s:%s/%s", conf.DBUser, conf.DBPass, conf.DBHost, conf.DBPort, conf.DBName)
    db, err := gorm.Open(postgres.Open(url), &gorm.Config{})

    // Check if db connection worked
    if err != nil {
        log.Fatalln("## Connection to DB failed ##")
        panic(err.Error())
    } else {
        log.Println("## Connected to database ##")
    }

    // Open the SQL connection
    dbSQL, err := db.DB()
    if err != nil {
        log.Fatalln("## Creation of dbSQL failed ##")
        panic(err)
    } else {
        log.Println("## Closed the connection ##")
    }

    // Setup connection pool limits
    dbSQL.SetMaxIdleConns(10)
    dbSQL.SetMaxOpenConns(100)
    dbSQL.SetConnMaxLifetime(time.Hour)

    if err = dbSQL.Ping(); err != nil {
        log.Fatalln(err)
        return dbSQL, -1
    }

    return dbSQL, 0
}



////////////////////// FIBER ROUTES //////////////////////

////// Webserver routes ////////
// Healthz route
func healthzRouteHandler(c *fiber.Ctx) error {
    return c.SendString("## WEBSERVER: Healthz request successfull ##")
}

////// API routes ////////
// Pull PG database route
func pullDatabaseRouteHandler(c *fiber.Ctx) error {
    return c.SendString("## API: Pull database file ##")
}




////////////////////// FIBER WEBSERVER //////////////////////
func fiber_server() {


    // Start webserver app
    app := fiber.New(fiber.Config{
        AppName: "RPI-Webserver:v1",
        JSONEncoder: json.Marshal,
        JSONDecoder: json.Unmarshal,
        RequestMethods: []string{"GET", "POST", "HEAD"},
        ServerHeader: "RPI-Webserver",

    })

    // Start webserver and api routes
    webserver := app.Group("/rpi-server/v1/webserver/")
    api := app.Group("/rpi-server/v1/api/")

    //////// Webserver routes ////////
    // Healthz route
    webserver.Get("/healthz", healthzRouteHandler)
    
    //TODO: Add more routes

    //////// API routes ////////

    //TODO: Add more routes


    // Start webserver
    err := app.Listen(":5001")
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

    // Initialize DB schema and then close the connection
    if DBInit(&conf) == 0 {
        log.Println("## DB schema initialized ##")
    } else {
        log.Fatalln("## DB schema failed at initialization ##")
    }

    // Initialize DB Pool and keep the connection open
    db, status := DBPoolInit(&conf)
    if status == 0 {
        log.Println("## DB pool initialized ##")
    } else {
        log.Fatalln("## DB pool failed initialization ##")
    }

    // Start fiber server
    fiber_server()   
}