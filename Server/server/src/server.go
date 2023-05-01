package main

import (
	// Import standard libraries
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"time"
	"bytes"

	// Library for http requests
	"net/http"

	// Import decimal, goccy/go-json
	"github.com/goccy/go-json"
	"github.com/shopspring/decimal"

	// Import gorm and postgres driver
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	// Import fiber
	"github.com/gofiber/fiber/v2"
)

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////// DB MODEL DEFINITIONS //////////////////////

type AirTemperature struct {
	ID        int             `gorm:"primaryKey"`
	Value     decimal.Decimal `gorm:"type:decimal(8,2);column:value"`
	Timestamp time.Time       `gorm:"column:timestamp"`
}

type AirHumidity struct {
	ID        int             `gorm:"primaryKey"`
	Value     decimal.Decimal `gorm:"type:decimal(8,2);column:value"`
	Timestamp time.Time       `gorm:"column:timestamp"`
}

type SoilMoisture struct {
	ID        int             `gorm:"primaryKey"`
	Value     decimal.Decimal `gorm:"type:decimal(8,2);column:value"`
	Timestamp time.Time       `gorm:"column:timestamp"`
}

type RelayState struct {
	ID              int       `gorm:"primaryKey"`
	Value           bool      `gorm:"type:boolean;column:value"`
	ChangeTimestamp time.Time `gorm:"column:change_timestamp"`
}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////// DB CONFIG //////////////////////
type Config struct {
	DBHost           string `mapstructure:"DB_HOST"`
	DBUser           string `mapstructure:"DB_USER"`
	DBPass           string `mapstructure:"DB_PASS"`
	DBName           string `mapstructure:"DB_NAME"`
	DBPort           string `mapstructure:"DB_PORT"`
	RPIapiConnString string `mapstructure:"RPI_API_CONNECTION_STRING"`
}

func LoadConfig() (conf Config, err error) {
	// Get environment variables from Config struct using os.Getenv()
	conf.DBHost = os.Getenv("DB_HOST")
	conf.DBUser = os.Getenv("DB_USER")
	conf.DBPass = os.Getenv("DB_PASS")
	conf.DBName = os.Getenv("DB_NAME")
	conf.DBPort = os.Getenv("DB_PORT")
	conf.RPIapiConnString = os.Getenv("RPI_API_CONNECTION_STRING")

	// Check if environment variables are set
	if conf.DBHost == "" || conf.DBUser == "" || conf.DBPass == "" || conf.DBName == "" || conf.DBPort == "" || conf.RPIapiConnString == "" {
		// Genarate an error if environment variables are not set
		log.Fatalln("!! Environment variables are not set !!")
		return
	} else {
		return
	}
}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////// DB INIT //////////////////////
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
	db.AutoMigrate(AirTemperature{}, AirHumidity{}, SoilMoisture{}, RelayState{})

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

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////// DB CONNECTION POOL INIT //////////////////////
func DBPoolInit(conf *Config) (*gorm.DB, error) {
	// Build the data source name (DSN) string
	url := fmt.Sprintf("postgres://%s:%s@%s:%s/%s", conf.DBUser, conf.DBPass, conf.DBHost, conf.DBPort, conf.DBName)

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

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////// JSON API RESPONSE STRUCTS //////////////////////
type CustomTime struct {
	time.Time
}

func (t *CustomTime) UnmarshalJSON(b []byte) error {
	layout := "2006-01-02 15:04:05.000" // adjust to your input format
	s := string(b)
	s = s[1 : len(s)-1] // remove quotes from the string
	parsed, err := time.Parse(layout, s)
	if err != nil {
		return err
	}
	*t = CustomTime{parsed}
	return nil
}

type AirTemperatureHumidityResponse struct {
	Status  int `json:"status"`
	Message struct {
		Temperature float64    `json:"air-temperature"`
		Humidity    float64    `json:"air-humidity"`
		Timestamp   CustomTime `json:"timestamp"`
	} `json:"message"`
}

type BulkAirTemperatureHumidityResponse struct {
	Status  int `json:"status"`
	Message struct {
		TemperatureList []float64    `json:"air-temperature-list"`
		HumidityList    []float64    `json:"air-humidity-list"`
		TimestampList   []CustomTime `json:"timestamp-list"`
	} `json:"message"`
}

type SoilMoistureResponse struct {
	Status  int `json:"status"`
	Message struct {
		Humidity  float64    `json:"soil-moisture"`
		Timestamp CustomTime `json:"timestamp"`
	} `json:"message"`
}

type BulkSoilMoistureResponse struct {
	Status  int `json:"status"`
	Message struct {
		HumidityList  []float64    `json:"soil-moisture-list"`
		TimestampList []CustomTime `json:"timestamp-list"`
	} `json:"message"`
}

type RelayStateResponse struct {
	Status  int `json:"status"`
	Message struct {
		RelayState bool       `json:"relay-state"`
		Timestamp  CustomTime `json:"timestamp"`
	} `json:"message"`
}

type RequestBody struct {
    NumOfReadings int `json:"numOfReadings"`
}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////// FIBER ROUTES //////////////////////
// //// API routes ////////
// Health test
func healthzRouteHandler(c *fiber.Ctx) error {
	return c.SendString("## API: Health test succesfull ##")
}

// Get air temperature and humidity
func getAirTemperatureHumidityRouteHandler(db *gorm.DB, RPI_API_CONNECTION_STRING string) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		// Log start of function
		log.Println("## Get air temperature and humidity ##")

		// Make a request to a backend API
		res, err := http.Get(RPI_API_CONNECTION_STRING + "/singleAirTemperatureHumidityReading")
		if err != nil {
			log.Fatalln("!! GET Go-server API error: ", RPI_API_CONNECTION_STRING+"/singleAirTemperatureHumidityReading"+" !!")
			log.Fatalln(err)
		}
		defer res.Body.Close()

		// Read the response body
		body, err := ioutil.ReadAll(res.Body)
		if err != nil {
			log.Fatalln("!! Read Go-server API response error: ", err)
		}

		// Unmarshal the message response body into a struct
		var resp AirTemperatureHumidityResponse
		if err := json.Unmarshal(body, &resp); err != nil {
			log.Fatalln("!! Unmarshal Go-server API response error: ", err)
		}

		// Access the values in the struct
		log.Println("## Temperature:", resp.Message.Temperature, " ##")
		log.Println("## Humidity:", resp.Message.Humidity, " ##")
		log.Println("## Timestamp:", resp.Message.Timestamp, " ##")

		// Save the data to the database
		err = executeInTransaction(db, func(tx *gorm.DB) error {
			// Save the data to the database
			db.Create(&AirTemperature{
				Value:     decimal.NewFromFloat(resp.Message.Temperature),
				Timestamp: time.Time(resp.Message.Timestamp.Time),
			})

			db.Create(&AirHumidity{
				Value:     decimal.NewFromFloat(resp.Message.Humidity),
				Timestamp: time.Time(resp.Message.Timestamp.Time),
			})

			return nil
		})
		if err != nil {
			log.Fatalf("Transaction failed: %s", err.Error())
		}

		// Return the data to the frontend in JSON format
		return c.JSON(resp)
	}
}

// Get bulk air temperature and humidity
func getBulkAirTemperatureHumidityRouteHandler(db *gorm.DB, RPI_API_CONNECTION_STRING string) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		// Log start of function
		log.Println("## Get bulk air temperature and humidity ##")

		// Make a request to a backend API
		req, err := http.NewRequest("GET", RPI_API_CONNECTION_STRING+"/bulkAirTemperatureHumidityReading", bytes.NewBuffer(c.Body()))
		if err != nil {
			log.Fatalln("!! GET Go-server API error: ", RPI_API_CONNECTION_STRING+"/bulkAirTemperatureHumidityReading"+" !!")
		}
		req.Header.Set("Content-Type", "application/json")

		// Make the request and handle the response
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Fatalln("!! GET Go-server API error: ", RPI_API_CONNECTION_STRING+"/bulkAirTemperatureHumidityReading"+" !!")
		}
		defer res.Body.Close()

		// Check the response status code
		if res.StatusCode != 200 {
			log.Fatalln("!! GET Go-server API error: ", RPI_API_CONNECTION_STRING+"/bulkAirTemperatureHumidityReading"+" !!")
		}

		// Read the response body
		body, err := ioutil.ReadAll(res.Body)
		if err != nil {
			log.Fatalln("!! Read Go-server API response error: ", err)
		}

		var resp BulkAirTemperatureHumidityResponse
		if err := json.Unmarshal(body, &resp); err != nil {
			log.Fatalln("!! Unmarshal Go-server API response error: ", err)
		}

		// Access the values in the struct
		log.Println("## Temperature-list:", resp.Message.TemperatureList)
		log.Println("## Humidity-list:", resp.Message.HumidityList)
		log.Println("## Timestamp-list:", resp.Message.TimestampList)

		// Save the data to the database
		err = executeInTransaction(db, func(tx *gorm.DB) error {
			// Save the data to the database
			for i := 0; i < len(resp.Message.TemperatureList); i++ {
				db.Create(&AirTemperature{
					Value:     decimal.NewFromFloat(resp.Message.TemperatureList[i]),
					Timestamp: time.Time(resp.Message.TimestampList[i].Time),
				})

				db.Create(&AirHumidity{
					Value:     decimal.NewFromFloat(resp.Message.HumidityList[i]),
					Timestamp: time.Time(resp.Message.TimestampList[i].Time),
				})
			}

			return nil
		})
		if err != nil {
			log.Fatalf("## Transaction failed:\n%s", err.Error())
		}

		// Return the data to the frontend in JSON format
		return c.JSON(resp)
	}
}

// Get soil moisture
func getSoilMoistureRouteHandler(db *gorm.DB, RPI_API_CONNECTION_STRING string) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		// Log start of function
		log.Println("## Get soil humidity ##")

		// Make a request to a backend API
		res, err := http.Get(RPI_API_CONNECTION_STRING + "/singleSoilMoistureReading")
		if err != nil {
			log.Fatalln("!! GET Go-server API error: ", RPI_API_CONNECTION_STRING+"/singleSoilMoistureReading"+" !!")
			log.Fatalln(err)
		}
		defer res.Body.Close()

		// Read the response body
		body, err := ioutil.ReadAll(res.Body)
		if err != nil {
			log.Fatalln("!! Read Go-server API response error: ", err)
		}

		var resp SoilMoistureResponse
		if err := json.Unmarshal(body, &resp); err != nil {
			log.Fatalln("!! Unmarshal Go-server API response error: ", err)
		}

		// Access the values in the struct
		log.Println("## Humidity: ", resp.Message.Humidity, " ##")
		log.Println("## Timestamp: ", resp.Message.Timestamp, " ##")

		// Save data to database in a transaction
		err = executeInTransaction(db, func(tx *gorm.DB) error {
			// Save the data to the database
			db.Create(&SoilMoisture{
				Value:     decimal.NewFromFloat(resp.Message.Humidity),
				Timestamp: time.Time(resp.Message.Timestamp.Time),
			})

			return nil
		})
		if err != nil {
			log.Fatalf("!! Transaction failed:\n%s", err.Error())
		}

		// Return the data to the frontend in JSON format
		return c.JSON(resp)
	}
}

// Get bulk soil moisture
func getBulkSoilMoistureRouteHandler(db *gorm.DB, RPI_API_CONNECTION_STRING string) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		// Log start of function
		log.Println("## Get bulk soil humidity ##")

		// Make a request to a backend API
		req, err := http.NewRequest("GET", RPI_API_CONNECTION_STRING+"/bulkSoilMoistureReading", bytes.NewBuffer(c.Body()))
		if err != nil {
			log.Fatalln("!! GET Go-server API error: ", RPI_API_CONNECTION_STRING+"/bulkSoilMoistureReading"+" !!")
		}
		req.Header.Set("Content-Type", "application/json")

		// Make the request and handle the response
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Fatalln("!! GET Go-server API error: ", RPI_API_CONNECTION_STRING+"/bulkSoilMoistureReading"+" !!")
		}
		defer res.Body.Close()

		// Check the response status code
		if res.StatusCode != 200 {
			log.Fatalln("!! GET Go-server API error: ", RPI_API_CONNECTION_STRING+"/bulkSoilMoistureReading"+" !!")
		}

		// Read the response body
		body, err := ioutil.ReadAll(res.Body)
		if err != nil {
			log.Fatalln("!! Read Go-server API response error: ", err)
		}

		// Print the response body
		log.Println("## Response body: ", string(body))

		var resp BulkSoilMoistureResponse
		if err := json.Unmarshal(body, &resp); err != nil {
			log.Fatalln("!! Unmarshal Go-server API response error: ", err)
		}

		// Access the values in the struct
		log.Println("## Humidity-list:", resp.Message.HumidityList)
		log.Println("## Timestamp-list:", resp.Message.TimestampList)

		// Save the data to the database
		err = executeInTransaction(db, func(tx *gorm.DB) error {
			// Save the data to the database
			for i := 0; i < len(resp.Message.HumidityList); i++ {
				db.Create(&SoilMoisture{
					Value:     decimal.NewFromFloat(resp.Message.HumidityList[i]),
					Timestamp: time.Time(resp.Message.TimestampList[i].Time),
				})
			}

			return nil
		})
		if err != nil {
			log.Fatalf("!! Transaction failed:\n%s", err.Error())
		}

		// Return the data to the frontend in JSON format
		return c.JSON(resp)
	}
}

// Get relay state
func setRelayStateOFF(db *gorm.DB, RPI_API_CONNECTION_STRING string) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		// Log start of function
		log.Println("## Set relay state OFF ##")

		// Make a request to a backend API
		res, err := http.Post(RPI_API_CONNECTION_STRING+"/setRelayOFF", "application/json", nil)
		if err != nil {
			log.Fatalln("!! POST Go-server API error !!")
			log.Fatalln(err)
		}

		// Read the response body
		body, err := ioutil.ReadAll(res.Body)
		if err != nil {
			log.Fatalln("!! Read Go-server API response error !!")
			log.Fatalln(err)
		}

		var resp RelayStateResponse
		if err := json.Unmarshal(body, &resp); err != nil {
			log.Fatalln("!! Unmarshal Go-server API response error !!")
			log.Fatalln(err)
		}

		// Access the values in the struct
		log.Println("## Relay state:", resp.Message.RelayState, " ##")

		// Save the data to the database
		err = executeInTransaction(db, func(tx *gorm.DB) error {
			// Save the data to the database
			db.Create(&RelayState{
				Value:           resp.Message.RelayState,
				ChangeTimestamp: time.Time(resp.Message.Timestamp.Time),
			})

			return nil
		})
		if err != nil {
			log.Fatalf("!! Transaction failed:\n%s", err.Error())
		}

		// Return the data to the frontend in JSON format
		return c.JSON(resp)
	}
}

// Change relay state
func setRelayStateON(db *gorm.DB, RPI_API_CONNECTION_STRING string) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		// Log start of function
		log.Println("## Set relay state ON ##")

		// Make a request to a backend API
		res, err := http.Post(RPI_API_CONNECTION_STRING+"/setRelayON", "application/json", nil)
		if err != nil {
			log.Fatalln("!! POST Go-server API error !!")
			log.Fatalln(err)
		}

		// Read the response body
		body, err := ioutil.ReadAll(res.Body)
		if err != nil {
			log.Fatalln("!! Read Go-server API response error !!")
			log.Fatalln(err)
		}

		var resp RelayStateResponse
		if err := json.Unmarshal(body, &resp); err != nil {
			log.Fatalln("!! Unmarshal Go-server API response error !!")
			log.Fatalln(err)
		}

		// Access the values in the struct
		log.Println("## Relay state:", resp.Message.RelayState, " ##")

		// Save the data to the database
		err = executeInTransaction(db, func(tx *gorm.DB) error {
			// Save the data to the database
			db.Create(&RelayState{
				Value:           resp.Message.RelayState,
				ChangeTimestamp: time.Time(resp.Message.Timestamp.Time),
			})

			return nil
		})
		if err != nil {
			log.Fatalf("!! Transaction failed:\n%s", err.Error())
		}

		// Return the data to the frontend in JSON format
		return c.JSON(resp)
	}
}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////// FIBER WEBSERVER //////////////////////
func fiber_server(db *gorm.DB, conf *Config) {
	// Start server app
	app := fiber.New(fiber.Config{
		AppName:        "GoServer:v1",
		JSONEncoder:    json.Marshal,
		JSONDecoder:    json.Unmarshal,
		RequestMethods: []string{"GET", "POST", "HEAD"},
		ServerHeader:   "GoServer",
	})

	// Write conf variable RPIapiIP to a local variable
	RPI_API_CONNECTION_STRING := conf.RPIapiConnString
	log.Println("## RPIapiIP requests will be made to: ", RPI_API_CONNECTION_STRING, " ##")

	// Start api routes
	api := app.Group("/goserver/v1/api/")

	//////// API routes ////////
	// API health test
	api.Get("/healthz", healthzRouteHandler)

	// Get air temperature and humidity
	api.Get("/get-air-temperature-humidity", getAirTemperatureHumidityRouteHandler(db, RPI_API_CONNECTION_STRING))

	// Get bulk air temperature and humidity
	api.Get("/get-bulk-air-temperature-humidity", getBulkAirTemperatureHumidityRouteHandler(db, RPI_API_CONNECTION_STRING))

	// Get soil humidity
	api.Get("/get-soil-moisture", getSoilMoistureRouteHandler(db, RPI_API_CONNECTION_STRING))

	// Get bulk soil humidity
	api.Get("/get-bulk-soil-moisture", getBulkSoilMoistureRouteHandler(db, RPI_API_CONNECTION_STRING))

	// Get relay state
	api.Post("/set-relay-state-OFF", setRelayStateOFF(db, RPI_API_CONNECTION_STRING))

	// Post change relay state
	api.Post("/set-relay-state-ON", setRelayStateON(db, RPI_API_CONNECTION_STRING))

	//////// Start API server ////////
	err := app.Listen(":5050")
	if err != nil {
		log.Fatalln("## Failed at listening to app ##", err)
	} else {
		log.Println("## Listening to app worked ##")
	}
}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////// MAIN APP //////////////////////
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
