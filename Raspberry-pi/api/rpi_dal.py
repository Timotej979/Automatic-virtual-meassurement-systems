import logging


class RPI_dal():

    # GET one Temperature meassurement
    async def get_temperature():
        #TODO: Read temperature from sensor and get timestamp

    # GET N Temperature meassurements
    async def get_temperature_bulk(json_data):
        #TODO: Read temperature at certain timestamps N-times

    # GET one Humidity meassurement
    async def get_humidity():
        #TODO: Read humidity from sensor and get timestamp

    # GET N Humidity meassurements
    async def get_humidity_bulk(json_data):
        #TODO: Read humidity at certain timestamps N-times

    # GET relay state
    async def get_relay_state():
        #TODO: Get relay state

    # POST change relay state
    async def change_relay_state():
        #TODO: Change relay state

