import logging, os, sys

import asyncio
from aiohttp import web

from rpi_dal import RPI_dal


# Get env variables
APP_CONFIG = os.getenv("APP_CONFIG")
URL_PREFIX = os.getenv("API_URL_PREFIX")

#########################################################################
### API CLASS ###
class RPI_API():
    """
    RPI API class to control the server
    """

    # Configure routes table
    routes = web.RouteTableDef()
    

    # Healthcheck
    @routes.get('/healthz')
    async def health_check(request):
        log.info("## RPI API health check ##")
        return web.Response(text="## API test successfull ##\n")

    # GET one air temperature reading
    @routes.get('/singleAirTemperatureHumidityReading')
    async def single_air_temperature_humidity_reading(request):
        log.info("## GET single air temperature/humidity reading ##")

        try:
            # Create DAL object using context manager
            with RPI_dal() as dataAbstractionLayer:
                json_response = await dataAbstractionLayer.get_air_temperature_humidity()
                # Check if DAL returned False
                if json_response == False:
                    raise web.HTTPInternalServerError("!! GET single air temperature/humidity reading error: Couldn't read the temperature !!")
                else:
                    return web.json_response({"status": 200, "message": json_response})
        except:
            log.exception("!! GET single air temperature/humidity reading error: Couldn't read the temperature !!")
            raise web.HTTPInternalServerError("!! GET single air temperature/humidity reading error: Couldn't read the temperature !!")

    # GET N air temperature readings
    @routes.get('/bulkAirTemperatureHumidityReading')
    async def bulk_air_temperature_humidity_reading(request):
        log.info("## GET bulk air temperature/humidity reading ##")

        try:
            numOfReadingsJSON = await request.json()
        except:
            log.exception("!! GET bulk air temperature/humidity reading error: Couldn't fetch request JSON !!")
            raise web.HTTPBadRequest("!! GET bulk air temperature/humidity reading error: Couldn't fetch request JSON !!")
        else:
            try:
                # Create DAL object using context manager
                with RPI_dal() as dataAbstractionLayer:
                    json_response = await dataAbstractionLayer.get_air_temperature_humidity_bulk(numOfReadingsJSON)
                    # Check if DAL returned False
                    if json_response == False:
                        raise web.HTTPInternalServerError("!! GET bulk air temperature/humidity reading error: Couldn't read the temperature !!")
                    else:
                        return web.json_response({"status": 200, "message": json_response})
            except:
                log.exception("!! GET bulk air temperature/humidity reading error: Couldn't read the temperature !!")
                raise web.HTTPInternalServerError("!! GET bulk air temperature/humidity reading error: Couldn't read the temperature !!")

    # GET one soil moisture reading
    @routes.get('/singleSoilMoistureReading')
    async def single_soil_moisture_reading(request):
        log.info("## GET single soil moisture reading ##")

        try:
            # Create DAL object using context manager
            with RPI_dal() as dataAbstractionLayer:
                json_response = await dataAbstractionLayer.get_soil_moisture()
                
                # Check if DAL returned False
                if json_response == False:
                    raise web.HTTPInternalServerError("!! GET single soil moisture reading error: Couldn't read the soil_moisture !!")
                else:
                    return web.json_response({"status": 200, "message": json_response})
        except:
            log.exception("!! GET single soil moisture reading error: Couldn't read the soil moisture !!")
            raise web.HTTPInternalServerError("!! GET single soil moisture reading error: Couldn't read the soil moisture !!")

    # GET N soil moisture readings
    @routes.get('/bulkSoilMoistureReading')
    async def bulk_soil_moisture_reading(request):
        log.info("## GET bulk soil moisture reading ##")

        try:
            numOfReadingsJSON = await request.json()
        except:
            log.exception("!! GET bulk soil moisture reading error: Couldn't fetch request JSON !!")
            raise web.HTTPBadRequest("!! GET bulk soil moisture reading error: Couldn't fetch request JSON !!")
        else:
            try:
                # Create DAL object using context manager
                with RPI_dal() as dataAbstractionLayer:
                    json_response = await dataAbstractionLayer.get_soil_moisture_bulk(numOfReadingsJSON)
                    # Check if DAl returned False
                    if json_response == False:
                        raise web.HTTPInternalServerError("!! GET bulk soil moisture reading error: Couldn't read the soil_moisture !!")
                    else:
                        return web.json_response({"status": 200, "message": json_response})
            except:
                log.exception("!! GET bulk soil moisture reading error: Couldn't get the soil moisture !!")
                raise web.HTTPInternalServerError("!! GET bulk soil moisture reading error: Couldn't get the soil moisture !!")

    @routes.get('/relayState')
    async def get_relay_state(request):
        log.info("## GET relay state ##")

        try:
            # Create DAL object using context manager
            with RPI_dal() as dataAbstractionLayer:
                json_response = await dataAbstractionLayer.get_relay_state()
                # Check if DAL returned False
                if json_response == False:
                    raise web.HTTPInternalServerError("!! GET relay state error: Couldn't fetch relay state !!")
                else:
                    return web.json_response({"status": 200, "message": json_response})
        except:
            log.exception("!! GET relay state error: Couldn't fetch relay state !!")
            raise web.HTTPInternalServerError("!! GET relay state error: Couldn't fetch relay state !!")

    @routes.post('/changeRealyState')
    async def change_relay_state(request):
        log.info("## POST change relay state ##")

        try:
            # Create DAL object using context manager
            with RPI_dal() as dataAbstractionLayer:
                json_response = await dataAbstractionLayer.change_relay_state()
                # Check if DAl returned False
                if json_response == False:
                    raise web.HTTPInternalServerError("!! POST change relay state error: Couldn't change relay state !!")
                else:
                    return web.json_response({"status": 200, "message": json_response})
        except:
            log.exception("!! POST change relay state error: Couldn't change relay state !!")
            raise web.HTTPInternalServerError("!! POST change relay state error: Couldn't change relay state !!")

    ############################################################################################################################################
    # Initialization for RPI_API app object
    def __init__(self):
        log.info("## RPI_API initialization started ##")
        self.subapp = web.Application()

        log.info("## Adding routes to application object ##")
        self.subapp.router.add_routes(self.routes)

        # Add sub-app to set the correct IP/rpi-api request
        self.app = web.Application()
        self.app.add_subapp(URL_PREFIX, self.subapp)

        log.info("## RPI API initialization complete ##")

    # Run RPI API
    def start_server(self, host, port, loop):
        log.info("## Server starting on address: http://{}:{}".format(host, port))
        web.run_app(self.app, host=host, port=port, loop=loop)


if __name__ == '__main__':
    # Set up server mode config
    if APP_CONFIG == 'dev':
        logging.basicConfig(level=logging.DEBUG)
        log = logging.getLogger()
        log.info("## Running RPI API in development mode ##")

    elif APP_CONFIG == 'prod':
        logging.basicConfig(level=logging.INFO)
        log = logging.getLogger()
        log.info("## Running RPI API inproduction mode ##")

    else:
        # If env variable is not set abort RPI API launch
        logging.basicConfig(level=logging.INFO)
        log = logging.getLogger()
        log.info("Environment variable APP_CONFIG in not set (Current value is {}), please set it in the environment file".format(APP_CONFIG))
        sys.exit(1)

    # Get asyncio event loop
    loop = asyncio.get_event_loop()

    # Create WebServer object and initialize it
    server = RPI_API()
    #loop.run_until_complete(server.initialize())

    # Start the RPI_API
    server.start_server(host='0.0.0.0', port=5000, loop=loop)