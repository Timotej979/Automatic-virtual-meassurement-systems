import logging, os, time, board, busio, digitalio
import adafruit_dht as adafruit_dht
import adafruit_mcp3xxx.mcp3008 as MCP
from adafruit_mcp3xxx.analog_in import AnalogIn

class RPI_dal():

    def __enter__(self):
        # Initialize logger
        self.logger = logging.getLogger(__name__)
        self.logger.info("RPI_dal enter")

        # Initialize DHT22 sensor
        self.DHT_PIN = os.getenv('DHT_PIN')
        if not self.DHT_PIN:
            self.logger.warning("DHT_PIN environment variable not set!")
        else:
            self.DHT_SENSOR = adafruit_dht.DHT22(getattr(board, "D" + str(self.DHT_PIN)), use_pulseio=False)
        
        # Initialize capacitive soil moisture sensor
        self.SOIL_MOISTURE_PIN = os.getenv('SOIL_MOISTURE_PIN')
        self.SOIL_MOISTURE_CS_PIN = os.getenv('SOIL_MOISTURE_CS_PIN')
        if not self.SOIL_MOISTURE_PIN:
            self.logger.warning("SOIL_MOISTURE_PIN environment variable not set!")
        elif not self.SOIL_MOISTURE_CS_PIN:
            self.logger.warning("SOIL_MOISTURE_CS_PIN environment variable not set!")
        else:
            # Create the SPI bus
            self.spi = busio.SPI(clock=board.SCK, MISO=board.MISO, MOSI=board.MOSI)
            # Create the chip select (CS) pin
            self.cs = digitalio.DigitalInOut(getattr(board, "D" + str(self.SOIL_MOISTURE_PIN)))
            # Create the MCP3008 object
            self.mcp = MCP.MCP3008(self.spi, self.cs)
            # Create an analog input channel on pin 0
            self.soil_moisture_chan = AnalogIn(self.mcp, getattr(MCP, "P" + str(self.SOIL_MOISTURE_CS_PIN)))

        # Initialize relay
        self.RELAY_PIN = os.getenv('RELAY_PIN')
        if not self.RELAY_PIN:
            self.logger.warning("RELAY_PIN environment variable not set!")
        else:
            self.relay = digitalio.DigitalInOut(getattr(board, "D" + str(self.RELAY_PIN)))
            self.relay.direction = digitalio.Direction.OUTPUT
            # Negative logic
            self.relay.value = True

    def __exit__(self, exc_type, exc_value, traceback):
        # Log exit
        self.logger.info("RPI_dal exit")
        # Exit DHT22 sensor, mcp and relay
        try:
            self.DHT_SENSOR.exit()
            self.mcp.deinit()
            self.relay.deinit()
        except:
            self.logger.exception("!! RPI_dal deinit error: Couldn't exit DHT22 sensor, mcp and relay !!")

    def remap_range(value, left_min, left_max, right_min, right_max):
        # This remaps a value from original (left) range to new (right) range
        # Figure out how 'wide' each range is
        left_span = left_max - left_min
        right_span = right_max - right_min
        # Convert the left range into a 0-1 range (int)
        valueScaled = int(value - left_min) / int(left_span)
        # Convert the 0-1 range into a value in the right range.
        return int(right_min + (valueScaled * right_span))

    # GET one Temperature meassurement
    async def get_air_temperature_humidity(self):
        # Read temperature from sensor and get timestamp
        try:
            # Log start of readings
            self.logger.info("## GET bulk air temperature/humidity reading started ##")
            
            # Set reading boolean to false
            reading = False
            # Read DHT22 sensor until successful
            while not reading:
                try:
                    # Read temperature from sensor and get timestamp
                    humidity, temperature = self.DHT_SENSOR.temperature, self.DHT_SENSOR.humidity
                    timestamp = time.time()
                    reading = True
                except RuntimeError as rerror:
                    # Reading failed, retry
                    self.logger.warning("!! GET single air temperature/humidity reading error: Couldn't read DHT22 temperature/humidity !!")
                    self.logger.warning("!! GET single air temperature/humidity reading error: Retrying in 1 seconds !!")
                    time.sleep(2.0)
                    continue
                except Exception as error:
                    # Reading failed, retry
                    self.logger.exception("!! GET single air temperature/humidity reading error: Fatal read DHT22 temperature/humidity !!")
                    self.DHT_SENSOR.exit()
                    return False

            # Log timestamp and temperature, humidity
            self.logger.info("## Timestamp: " + str(timestamp) + " ##")
            self.logger.info("## Air temperature: " + str(temperature) + " ##")
            self.logger.info("## Air humidity: " + str(humidity) + " ##")

            return {"timestamp": timestamp, "air-temperature": temperature, "air-humidity": humidity}
        
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
                self.logger.info("## Number of readings: " + str(numOfReadings))

                # Initialize lists
                timestamp_list = []
                temperature_list = []
                humidity_list = []

                # Read temperature N-times
                for i in range(numOfReadings):
                    # Set reading boolean to false
                    reading = False
                    # Read DHT22 sensor until successful
                    while not reading:
                        try:
                            # Read temperature from sensor and get timestamp
                            humidity, temperature = self.DHT_SENSOR.temperature, self.DHT_SENSOR.humidity
                            timestamp = time.time()
                            reading = True
                        except RuntimeError as rerror:
                            # Reading failed, retry
                            self.logger.warning("!! GET single air temperature/humidity reading error: Couldn't read DHT22 temperature/humidity !!")
                            self.logger.warning("!! GET single air temperature/humidity reading error: Retrying in 1 seconds !!")
                            time.sleep(2.0)
                            continue
                        except Exception as error:
                            # Reading failed, retry
                            self.logger.exception("!! GET single air temperature/humidity reading error: Fatal read DHT22 temperature/humidity !!")
                            self.DHT_SENSOR.exit()
                            return False
                
                    # Log timestamp and temperature, humidity
                    self.logger.info("## Timestamp: " + str(timestamp) + " ##")
                    self.logger.info("## Air temperature: " + str(temperature) + " ##")
                    self.logger.info("## Air humidity: " + str(humidity) + " ##")

                    # Append to lists
                    timestamp_list.append(timestamp)
                    temperature_list.append(temperature)
                    humidity_list.append(humidity)

                return {"timestamp-list": timestamp_list, "air-temperature-list": temperature_list, "air-humidity-list": humidity_list}
            
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

            # Remap soil moisture value
            soil_moisture = self.remap_range(soil_moisture, 0, 65535, 0, 100)

            # Log timestamp and soil moisture
            self.logger.info("## Timestamp: " + str(timestamp) + " ##")
            self.logger.info("## Soil moisture: " + str(soil_moisture) + " ##")

            return {"timestamp": timestamp, "soil-moisture": soil_moisture}
        
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
                self.logger.info("## Number of readings: " + str(numOfReadings))

                # Initialize lists
                timestamp_list = []
                soil_moisture_list = []

                # Read soil moisture N-times
                for i in range(numOfReadings):
                    # Read soil moisture from sensor and get timestamp
                    soil_moisture = self.soil_moisture_chan.value
                    timestamp = time.time()

                    # Remap soil moisture value
                    soil_moisture = self.remap_range(soil_moisture, 0, 65535, 0, 100)

                    # Log timestamp and soil moisture
                    self.logger.info("## Timestamp: " + str(timestamp) + " ##")
                    self.logger.info("## Soil moisture: " + str(soil_moisture) + " ##")

                    # Append to lists
                    timestamp_list.append(timestamp)
                    soil_moisture_list.append(soil_moisture)

                return {"timestamp-list": timestamp_list, "soil-moisture-list": soil_moisture_list}

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
            timestamp = time.time()

            # Log relay state
            self.logger.info("## Relay state: " + str(relay_state) + " ##")

            return {"timestamp": timestamp, "relay-state": relay_state}
        
        except:
            self.logger.exception("!! GET relay state error: Couldn't read relay state !!")
            return False
        

    # POST change relay state
    async def change_relay_state(self):
        try:
            # Log start of readings
            self.logger.info("## POST change relay state started ##")

            # Change relay state
            if self.relay.value == True:
                # Log current relay state
                self.logger.info("## Current relay state: True ##")

                # Change relay state
                self.relay.value = False
                timestamp = time.time()

                # Log new relay state
                self.logger.info("## New relay state: False ##")
                return {"timestamp": timestamp, "relay-state": False}

            if self.relay.value == False:
                # Log current relay state
                self.logger.info("## Current relay state: False ##")

                # Change relay state
                self.relay.value = True
                timestamp = time.time()
                
                # Log new relay state
                self.logger.info("## New relay state: True ##")
                return {"timestamp": timestamp, "relay-state": True}
        
        except:
            self.logger.exception("!! POST change relay state error: Couldn't change relay state !!")
            return False
