import logging, os, time, board, busio, digitalio
import adafruit_dht as adafruit_dht
import adafruit_mcp3xxx.mcp3008 as MCP
from adafruit_mcp3xxx.analog_in import AnalogIn

class RPI_dal():

    def __init__(self):
        # Initialize logger
        self.logger = logging.getLogger(__name__)
        self.logger.info("RPI_dal init")

        # Initialize DHT sensor
        self.DHT_PIN = os.getenv('DHT_PIN')
        if not self.DHT_PIN:
            self.logger.warning("DHT_PIN environment variable not set!")
        else:
            self.DHT_SENSOR = adafruit_dht.DHT22(getattr(board, self.DHT_PIN))
        
        # Initialize capacitive soil moisture sensor
        self.SOIL_MOISTURE_PIN = os.getenv('SOIL_MOISTURE_PIN')
        self.SOIL_MOISTURE_CS_PIN = os.getenv('SOIL_MOISTURE_CS_PIN')
        if not self.SOIL_MOISTURE_PIN:
            self.logger.warning("SOIL_MOISTURE_PIN environment variable not set!")
        else:
            # Create the SPI bus
            self.spi = busio.SPI(clock=board.SCK, MISO=board.MISO, MOSI=board.MOSI)
            # Create the chip select (CS) pin
            self.cs = digitalio.DigitalInOut(getattr(board, self.SOIL_MOISTURE_PIN))
            # Create the MCP3008 object
            self.mcp = MCP.MCP3008(self.spi, self.cs)
            # Create an analog input channel on pin 0
            self.soil_moisture_chan = AnalogIn(self.mcp, getattr(MCP, self.SOIL_MOISTURE_CS_PIN))

        # Initialize relay
        self.RELAY_PIN = os.getenv('RELAY_PIN')
        if not self.RELAY_PIN:
            self.logger.warning("RELAY_PIN environment variable not set!")
        else:
            self.relay = digitalio.DigitalInOut(getattr(board, self.RELAY_PIN))
            self.relay.direction = digitalio.Direction.OUTPUT

        
    # GET one Temperature meassurement
    async def get_air_temperature_humidity(self):
        # Read temperature from sensor and get timestamp
        try:
            # Log start of readings
            self.logger.info("## GET bulk air temperature/humidity reading started ##")
            
            # Read temperature from sensor and get timestamp
            humidity, temperature = adafruit_dht.read_retry(self.DHT_SENSOR, getattr(board, self.DHT_PIN))
            timestamp = time.time()
            json_response = {"timestamp": timestamp, "air-temperature": temperature, "air-humidity": humidity}
            return json_response
        
        except:
            self.logger.exception("!! GET single air temperature/humidity reading error: Couldn't read DHT22 temperature/humidity !!")
            return False


    # GET N Humidity meassurements
    async def get_air_temperature_humidity_bulk(self, json_data):
        # Read temperature N-times and get timestamps
        try:
            numOfReadings = json_data.get("numOfReadings")
        except:
            self.logger.exception("!! GET bulk air temperature/humidity reading error: Couldn't fetch request JSON !!")
            return False
        else:
            try:
                # Log start of readings
                self.logger.info("## GET bulk air temperature/humidity reading started ##")
                # Log number of readings
                self.logger.info("Number of readings: " + str(numOfReadings))

                # Initialize lists
                timestamp_list = []
                temperature_list = []
                humidity_list = []

                # Read temperature N-times
                for i in range(numOfReadings):
                    # Read temperature from sensor and get timestamp
                    humidity, temperature = adafruit_dht.read_retry(self.DHT_SENSOR, getattr(board, self.DHT_PIN))
                    timestamp = time.time()
                
                    # Append to lists
                    timestamp_list.append(timestamp)
                    temperature_list.append(temperature)
                    humidity_list.append(humidity)

                json_response = {"timestamp-list": timestamp_list, "air-temperature-list": temperature_list, "air-humidity-list": humidity_list}
                return json_response
            
            except:
                self.logger.exception("!! GET bulk air temperature/humidity reading error: Couldn't read DHT22 temperature/humidity !!")
                return False
            
    # GET one soil moisture reading
    async def get_soil_moisture(self):
        # Read soil moisture from sensor and get timestamp
        try:
            # Log start of readings
            self.logger.info("## GET single soil moisture reading started ##")

            # Read soil moisture from sensor and get timestamp
            soil_moisture = self.soil_moisture_chan.value
            timestamp = time.time()
            json_response = {"timestamp": timestamp, "soil-moisture": soil_moisture}
            return json_response
        
        except:
            self.logger.exception("!! GET single soil moisture reading error: Couldn't read soil moisture !!")
            return False

    async def get_soil_moisture_bulk(self, json_data):
        # Read soil moisture at certain timestamps N-times
        try:
            numOfReadings = json_data.get("numOfReadings")
        except:
            self.logger.exception("!! GET bulk soil moisture reading error: Couldn't fetch request JSON !!")
        else:
            try:
                # Log start of readings
                self.logger.info("## GET bulk soil moisture reading started ##")
                # Log number of readings
                self.logger.info("Number of readings: " + str(numOfReadings))

                # Initialize lists
                timestamp_list = []
                soil_moisture_list = []

                # Read soil moisture N-times
                for i in range(numOfReadings):
                    # Read soil moisture from sensor and get timestamp
                    soil_moisture = self.soil_moisture_chan.value
                    timestamp = time.time()

                    # Append to lists
                    timestamp_list.append(timestamp)
                    soil_moisture_list.append(soil_moisture)

                json_response = {"timestamp-list": timestamp_list, "soil-moisture-list": soil_moisture_list}
                return json_response

            except:
                self.logger.exception("!! GET bulk soil moisture reading error: Couldn't read soil moisture !!")
                return False
        

    # GET relay state
    async def get_relay_state(self):
        try:
            # Log start of readings
            self.logger.info("## GET relay state started ##")

            # Read relay state
            relay_state = self.relay.value
            json_response = {"relay-state": relay_state}
            return json_response
        
        except:
            self.logger.exception("!! GET relay state error: Couldn't read relay state !!")
            return False
        

    # POST change relay state
    async def change_relay_state(self):
        try:
            # Log start of readings
            self.logger.info("## POST change relay state started ##")

            # Change relay state
            self.relay.value = not self.relay.value

            # Return new relay state
            relay_state = self.relay.value
            json_response = {"relay-state": relay_state}
            return json_response
        
        except:
            self.logger.exception("!! POST change relay state error: Couldn't change relay state !!")
            return False
