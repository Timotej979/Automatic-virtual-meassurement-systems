import logging, os, time
import Adafruit_DHT


class RPI_dal():

    def __init__(self):
        # Initialize logger
        self.logger = logging.getLogger(__name__)
        self.logger.info("RPI_dal init")

        # Initialize DHT sensor
        self.DHT_SENSOR = Adafruit_DHT.DHT22
        self.DHT_PIN = os.getenv('DHT_PIN')

        # Initialize capacitive soil moisture sensor
        self.SOIL_MOISTURE_PIN = os.getenv('SOIL_MOISTURE_PIN')
        


    # GET one Temperature meassurement
    async def get_air_temperature_humidity(self):
        # Read temperature from sensor and get timestamp
        humidity, temperature = Adafruit_DHT.read_retry(self.DHT_SENSOR, self.DHT_PIN)
        timestamp = time.time()
        json_response = {"timestamp": timestamp, "temperature": temperature, "humidity": humidity}
        return json_response
        


    # GET N Temperature meassurements
    async def get_air_temperature_bulk(json_data):
        #TODO: Read temperature at certain timestamps N-times
        

        

    # GET one Humidity meassurement
    async def get_air_humidity():
        #TODO: Read humidity from sensor and get timestamp

    # GET N Humidity meassurements
    async def get_air_humidity_bulk(json_data):
        #TODO: Read humidity at certain timestamps N-times

    async def get_soil_moisture():
        #TODO: Read soil moisture from sensor and get timestamp

    async def get_soil_moisture_bulk(json_data):
        #TODO: Read soil moisture at certain timestamps N-times

    # GET relay state
    async def get_relay_state():
        #TODO: Get relay state

    # POST change relay state
    async def change_relay_state():
        #TODO: Change relay state

