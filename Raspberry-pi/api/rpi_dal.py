import logging, os, time
import adafruit_dht as adafruit_dht



class RPI_dal():

    def __init__(self):
        # Initialize logger
        self.logger = logging.getLogger(__name__)
        self.logger.info("RPI_dal init")

        # Initialize DHT sensor
        self.DHT_PIN = os.getenv('DHT_PIN')
        self.DHT_SENSOR = adafruit_dht.DHT22()
        
        # Initialize capacitive soil moisture sensor
        self.SOIL_MOISTURE_PIN = os.getenv('SOIL_MOISTURE_PIN')

        # Initialize relay
        self.RELAY_PIN = os.getenv('RELAY_PIN')
        
    # GET one Temperature meassurement
    async def get_air_temperature_humidity(self):
        # Read temperature from sensor and get timestamp
        try:
            # Log start of readings
            logging.info("## GET bulk air temperature/humidity reading started ##")
            
            # Read temperature from sensor and get timestamp
            humidity, temperature = adafruit_dht.read_retry(self.DHT_SENSOR, self.DHT_PIN)
            timestamp = time.time()
            json_response = {"timestamp": timestamp, "temperature": temperature, "humidity": humidity}
            return json_response
        except:
            logging.exception("!! GET single air temperature/humidity reading error: Couldn't read DHT22 temperature/humidity !!")
            return False


    # GET N Humidity meassurements
    async def get_air_temperature_humidity_bulk(self, json_data):
        # Read temperature N-times and get timestamps
        try:
            numOfReadings = json_data.get("numOfReadings")
        except:
            logging.exception("!! GET bulk air temperature/humidity reading error: Couldn't fetch request JSON !!")
            return False
        else:
            try:
                # Log start of readings
                logging.info("## GET bulk air temperature/humidity reading started ##")
                # Log number of readings
                logging.info("Number of readings: " + str(numOfReadings))

                # Initialize lists
                timestamp_list = []
                temperature_list = []
                humidity_list = []

                # Read temperature N-times
                for i in range(numOfReadings):
                    # Read temperature from sensor and get timestamp
                    humidity, temperature = adafruit_dht.read_retry(self.DHT_SENSOR, self.DHT_PIN)
                    timestamp = time.time()
                
                    # Append to lists
                    timestamp_list.append(timestamp)
                    temperature_list.append(temperature)
                    humidity_list.append(humidity)

                json_response = {"timestamp-list": timestamp_list, "temperature-list": temperature_list, "humidity-list": humidity_list}
                return json_response
            
            except:
                logging.exception("!! GET bulk air temperature/humidity reading error: Couldn't read DHT22 temperature/humidity !!")
                return False
            
    # GET one soil moisture reading
    async def get_soil_moisture(self):
        # Read soil moisture from sensor and get timestamp
        try:
            # Log start of readings
            logging.info("## GET single soil moisture reading started ##")

            # Read soil moisture from sensor and get timestamp
            # TODO: Read soil moisture
            soil_moisture = 0
            timestamp = time.time()
            json_response = {"timestamp": timestamp, "soil_moisture": soil_moisture}
            return json_response
        except:
            return False

    async def get_soil_moisture_bulk(self, json_data):
        # Read soil moisture at certain timestamps N-times
        try:
            numOfReadings = json_data.get("numOfReadings")
        except:
            logging.exception("!! GET bulk soil moisture reading error: Couldn't fetch request JSON !!")
        else:
            try:
                # Log start of readings
                logging.info("## GET bulk soil moisture reading started ##")
                # Log number of readings
                logging.info("Number of readings: " + str(numOfReadings))

                # Initialize lists
                timestamp_list = []
                soil_moisture_list = []

                # Read soil moisture N-times
                for i in range(numOfReadings):
                    # Read soil moisture from sensor and get timestamp
                    #TODO: Read soil moisture
                    soil_moisture = 0
                    timestamp = time.time()

                    # Append to lists
                    timestamp_list.append(timestamp)
                    soil_moisture_list.append(soil_moisture)

                json_response = {"timestamp-list": timestamp_list, "soil_moisture-list": soil_moisture_list}
                return json_response

            except:
                logging.exception("!! GET bulk soil moisture reading error: Couldn't read soil moisture !!")
                return False
        

    # GET relay state
    async def get_relay_state():
        try:
            # Log start of readings
            logging.info("## GET relay state started ##")

            #TODO: Get relay state

        except:
            logging.exception("!! GET relay state error: Couldn't read relay state !!")
            return False
        

    # POST change relay state
    async def change_relay_state():
        try:
            # Log start of readings
            logging.info("## POST change relay state started ##")

            #TODO: Change relay state

        except:
            logging.exception("!! POST change relay state error: Couldn't change relay state !!")
            return False
