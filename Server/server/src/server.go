package main 

import (
    // Import standard libraries
    "fmt"
    "log"
    "time"
    "os"
    "io/ioutil"

    // Library for http requests 
    "net/http"

    // Import decimal, goccy/go-json
    "github.com/shopspring/decimal"
    "github.com/goccy/go-json"

    // Import gorm and postgres driver
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
	ChangeTimestamp time.Time	
    LookupTimestamp time.Time
}


////////////////////// DB CONFIG //////////////////////
type Config struct {
    DBHost string `mapstructure:"DB_HOST"`
    DBUser string `mapstructure:"DB_USER"`
    DBPass string `mapstructure:"DB_PASS"`
    DBName string `mapstructure:"DB_NAME"`
    DBPort string `mapstructure:"DB_PORT"`
    RPIapiIP string `mapstructure:"RPI_API_IP"`
}

func LoadConfig() (conf Config, err error) {
    // Get environment variables from Config struct using os.Getenv()
    conf.DBHost = os.Getenv("DB_HOST")
    conf.DBUser = os.Getenv("DB_USER")
    conf.DBPass = os.Getenv("DB_PASS")
    conf.DBName = os.Getenv("DB_NAME")
    conf.DBPort = os.Getenv("DB_PORT")
    conf.RPIapiIP = os.Getenv("RPI_API_IP")

    // Check if environment variables are set
    if conf.DBHost == "" || conf.DBUser == "" || conf.DBPass == "" || conf.DBName == "" || conf.DBPort == "" || conf.RPIapiIP == "" {
        // Genarate an error if environment variables are not set
        log.Fatalln("!! Environment variables are not set !!")
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
        log.Fatalln("!! Failed at db.AutoMigrate() !!")
        log.Fatalln(db.Error)
        return -1
    } else {
        log.Println("## db.AutoMigrate() worked ##")     
    }

    // Close the connection using error check
    dbSQL, err := db.DB()
    if err != nil {
        log.Fatalln("!! Failed at closing the connection !!")
        log.Fatalln(err)
        return -1
    } else {
        log.Println("## Closed the connection ##")
    }
    defer dbSQL.Close()

    return 0
}



////////////////////// DB CONNECTION POOL INIT //////////////////////
func DBPoolInit(conf *Config) (*gorm.DB, error) {
    // Build the data source name (DSN) string
    url := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
        conf.DBUser, conf.DBPass, conf.DBHost, conf.DBPort, conf.DBName)

    // Open a connection to the database
    db, err := gorm.Open(postgres.Open(url), &gorm.Config{})
    if err != nil {
        log.Fatalln("!! Failed to connect to DB !!")
        log.Fatalln(err)
    }

    // Set connection pool properties
    dbSQL, err := db.DB()
    if err != nil {
        log.Fatalln("!! Failed to get SQL DB object !!")
        log.Fatalln(err)
    }

    // Set connection pool properties
    dbSQL.SetMaxIdleConns(10)
    dbSQL.SetMaxOpenConns(100)
    dbSQL.SetConnMaxLifetime(1 * time.Hour)

    // Test the connection
    if err := dbSQL.Ping(); err != nil {
        return nil, fmt.Errorf("!! Failed to ping DB: %v", err)
    }

    log.Println("Connected to DB via pooling")
    return db, nil
}

// Context manager for DB transactions
func executeInTransaction(db *gorm.DB, f func(tx *gorm.DB) error) error {
    // Start a transaction
    tx := db.Begin()
    // Rollback the transaction if there is an error
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()
    
    // Execute the function
    err := f(tx)
    // Rollback the transaction if there is an error
    if err != nil {
        tx.Rollback()
        return err
    }
    
    // Commit the transaction
    return tx.Commit().Error
}



////////////////////// JSON API RESPONSE STRUCTS //////////////////////
type AirTemperatureHumidityResponse struct {
    Temperature float64 `json:"temperature"`
    Humidity    float64 `json:"humidity"`
    Timestamp   time.Time `json:"timestamp"`
}

type SoilHumidityResponse struct {
	Humidity float64 `json:"humidity"`
    Timestamp time.Time `json:"timestamp"`
}

type RelayStateResponse struct {
	State bool `json:"state"`
    Timestamp time.Time `json:"timestamp"`
}

type ChangeRelayStateRequest struct {
	State bool `json:"state"`
    Timestamp time.Time `json:"timestamp"`
}



////////////////////// FIBER ROUTES //////////////////////

////// API routes ////////
// Health test
func healthzRouteHandler(c *fiber.Ctx) error {
    return c.SendString("## API: Health test succesfull ##")
}

// Get air temperature and humidity
func getAirTemperatureHumidityRouteHandler(c *fiber.Ctx, db *gorm.DB, RPIapiIP string) error {
    // Log start of function
    log.Println("## Get air temperature and humidity ##")

    // Make a request to a backend API
    res, err := http.Get("http://" + RPIapiIP + "/rpi-server/v1/api/air-temperature-humidity")
    if err != nil {
        log.Fatalln("!! GET RPI-API error !!")
        log.Fatalln(err)
    }
    defer res.Body.Close()

    // Read the response body
    body, err := ioutil.ReadAll(res.Body)
    if err != nil {
        log.Fatalln("!! Read RPI-API response error !!")
        log.Fatalln(err)
    }



    return c.SendString("## API: Get air temperature and humidity succesfull ##")
}

// Get soil humidity
func getSoilHumidityRouteHandler(c *fiber.Ctx, db *gorm.DB, RPIapiIP string) error {
    // Log start of function
    log.Println("## Get soil humidity ##")

    return c.SendString("## API: Get soil humidity succesfull ##")
}

// Get relay state
func getRelayStateRouteHandler(c *fiber.Ctx, db *gorm.DB, RPIapiIP string) error {
    // Log start of function
    log.Println("## Get relay state ##")

    return c.SendString("## API: Get relay state succesfull ##")
}

// Change relay state
func postChangeRelayStateRouteHandler(c *fiber.Ctx, db *gorm.DB, RPIapiIP string) error {
    // Log start of function
    log.Println("## Change relay state ##")

    return c.SendString("## API: Change relay state succesfull ##")
}




////////////////////// FIBER WEBSERVER //////////////////////
func fiber_server(db *gorm.DB, conf *Config) {
    // Start server app
    app := fiber.New(fiber.Config{
        AppName: "RPI-Server:v1",
        JSONEncoder: json.Marshal,
        JSONDecoder: json.Unmarshal,
        RequestMethods: []string{"GET", "POST", "HEAD"},
        ServerHeader: "RPI-Server",
    })

    // Write conf variable RPIapiIP to a local variable
    RPIapiIP := conf.RPIapiIP
    log.Println("## RPIapiIP requests will be made to: ", RPIapiIP, " ##")

    // Start api routes
    api := app.Group("/go-server/v1/api")

    //////// API routes ////////
    // API health test
    api.Get("/healthz", healthzRouteHandler)

    // Get air temperature and humidity
    api.Get("/air-temperature-humidity", getAirTemperatureHumidityRouteHandler)

    // Get soil humidity
    api.Get("/soil-humidity", getSoilHumidityRouteHandler)

    // Get relay state
    api.Get("/relay-state", getRelayStateRouteHandler)

    // Post change relay state
    api.Post("/change-relay-state", postChangeRelayStateRouteHandler)

    //////// Start API server ////////
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
        log.Fatalln("!! DB schema failed at initialization !!")
    }

    // Initialize DB Pool and keep the connection open
    db, err := DBPoolInit(&conf)
    if err != nil {
        log.Fatalln("!! DB pool failed initialization !!", err)
    } else {
        log.Println("## DB pool initialized ##")
    }

    // Start fiber server
    fiber_server(db, &conf)   
}