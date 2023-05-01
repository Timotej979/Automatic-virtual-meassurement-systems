import { Inter } from 'next/font/google'
import { Dashboard, FirstPart, SecondPart, ThirdPart, Box, ButtonSensor, ButtonAuto, ButtonWater } from '@/components/Dashboard'

const inter = Inter({ subsets: ['latin'] })


// Automatic watering class
class automaticWateringClass {
  // Kill switch
  killSwitch: boolean;
  
  // Constructor
  constructor() {
    // Set the kill switch to false
    this.killSwitch = false;
  }

  // Start automatic watering
  async startAutomaticWatering() {
    console.log("## Automatic watering started ##");
    // Set the kill switch to false
    this.killSwitch = false;

    // Start automatic watering
    this.automaticWatering(50);
  }

  // Stop automatic watering
  async stopAutomaticWatering() {
    console.log("## Automatic watering stopped ##");
    // Stop automatic watering by setting the kill switch to true
    this.killSwitch = true;
  }

  // Automatic watering loop
  async automaticWatering(threshold: number) {
    // While loop to keep watering until the soil is wet enough then wait
    while (true) {
      // Get the current soil moisture
      const soilHumidity = 0;

      // If the soil is wet enough, stop watering
      if (soilHumidity >= threshold) {
        // Stop watering the plant
        // Send request to localhost/changeRelayState
        console.log("# Stop watering #");
      } else {
        // Water the plant for 5 seconds
        // Send request to localhost/changeRelayState
        console.log("# Watering #");
      }

      // If the kill switch is on, stop watering
      if (this.killSwitch) {
        // Exit while loop
        break;
      }
    }
  }
}

class apiRequestClass {
  
  // Define root url to make requests to API
  rootUrl: string;

  // Constructor
  constructor() {
    // Set the root url
    this.rootUrl = "http://localhost:5001/goserver/v1/api";
  }

  async getAirTemperatureHumidity() {
    // Make a request to the server
    const response = await fetch(`${this.rootUrl}/get-air-temperature-humidity`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Get the response data
    const data = await response.json();

    // Get the JSON data
    const jsonData = JSON.parse(data);

    // Get "message" from the JSON data
    const message = jsonData["message"];

    // Get air-temperature and air-humidity and timestamp from the message
    const airTemperature = message["air-temperature"];
    const airHumidity = message["air-humidity"];
    const timestamp = message["timestamp"];

    // Print the data
    console.log("## Air temperature and humidity ##");
    console.log(`Air temperature: ${airTemperature}`);
    console.log(`Air humidity: ${airHumidity}`);
    console.log(`Timestamp: ${timestamp}`);

    // Return the data
    return [airTemperature, airHumidity, timestamp];
  }

  async getBulkAirTemperatureHumidity(numOfReadings: number) {
    // Make a request to the server and add JSON data "numOfReadings"
    const response = await fetch(`${this.rootUrl}/get-bulk-air-temperature-humidity`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        numOfReadings: numOfReadings,
      }),
    });

    // Get the response data
    const data = await response.json();

    // Get the JSON data
    const jsonData = JSON.parse(data);

    // Get "message" from the JSON data
    const message = jsonData["message"];

    // Get air-temperature-list, air-humidity-list and timestamp-list from the message    
    const airTemperatureList = message["air-temperature-list"];
    const airHumidityList = message["air-humidity-list"];
    const timestampList = message["timestamp-list"];

    // Print the data
    console.log("## Bulk air temperature and humidity ##");
    console.log(`Air temperature list: ${airTemperatureList}`);
    console.log(`Air humidity list: ${airHumidityList}`);
    console.log(`Timestamp list: ${timestampList}`);

    // Return the data
    return [airTemperatureList, airHumidityList, timestampList];
  }

  async getSoilMoisture() {
    // Make a request to the server
    const response = await fetch(`${this.rootUrl}/get-soil-moisture`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Get the response data
    const data = await response.json();

    // Get the JSON data
    const jsonData = JSON.parse(data);

    // Get "message" from the JSON data
    const message = jsonData["message"];

    // Get soil-moisture and timestamp from the message
    const soilMoisture = message["soil-moisture"];
    const timestamp = message["timestamp"];

    // Print the data
    console.log("## Soil moisture ##");
    console.log(`Soil moisture: ${soilMoisture}`);
    console.log(`Timestamp: ${timestamp}`);

    // Return the data
    return [soilMoisture, timestamp];
  }

  async getBulkSoilMoisture(numOfReadings: number) {
    // Make a request to the server and add JSON data "numOfReadings"
    const response = await fetch(`${this.rootUrl}/get-bulk-soil-moisture`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        numOfReadings: numOfReadings,
      }),
    });
    
    // Get the response data
    const data = await response.json();

    // Get the JSON data
    const jsonData = JSON.parse(data);

    // Get "message" from the JSON data
    const message = jsonData["message"];

    // Get soil-moisture-list and timestamp-list from the message
    const soilMoistureList = message["soil-moisture-list"];
    const timestampList = message["timestamp-list"];

    // Print the data
    console.log("## Bulk soil moisture ##");
    console.log(`Soil moisture list: ${soilMoistureList}`);
    console.log(`Timestamp list: ${timestampList}`);

    // Return the data
    return [soilMoistureList, timestampList];
  }

  async setRelayStateON() {
    // Make a request to the server
    const response = await fetch(`${this.rootUrl}/set-relay-state-ON`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Get the response data
    const data = await response.json();

    // Get the JSON data
    const jsonData = JSON.parse(data);

    // Get "message" from the JSON data
    const message = jsonData["message"];

    // Get relay-state from the message
    const relayState = message["relay-state"];

    // Print the data
    console.log("## Relay state ##");
    console.log(`Relay state: ${relayState}`);

    // Return the data
    return relayState;
  }

  async setRelayStateOFF() {
    // Make a request to the server
    const response = await fetch(`${this.rootUrl}/set-relay-state-OFF`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Get the response data
    const data = await response.json();

    // Get the JSON data
    const jsonData = JSON.parse(data);

    // Get "message" from the JSON data
    const message = jsonData["message"];

    // Get relay-state from the message
    const relayState = message["relay-state"];

    // Print the data
    console.log("## Relay state ##");
    console.log(`Relay state: ${relayState}`);

    // Return the data
    return relayState;
  }

}


// Create instances of used classes
const apiRequestClassInstance = new apiRequestClass();
const automaticWateringClassInstance = new automaticWateringClass();

// Call the methods from apiRequestClassInstance
apiRequestClassInstance.getAirTemperatureHumidity();
apiRequestClassInstance.getBulkAirTemperatureHumidity(10);
apiRequestClassInstance.getSoilMoisture();
apiRequestClassInstance.getBulkSoilMoisture(10);
apiRequestClassInstance.setRelayStateON();
apiRequestClassInstance.setRelayStateOFF();


// Webpage component
const DashboardPage: React.FC = () => {
    return (
      <main>
        <Dashboard>

          <FirstPart >
            
            <Box title="AIR TEMPERATURE AND HUMIDITY">
              <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                
              </div>  
            </Box>
            
            <Box title="SOIL MOISTURE">
              <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                

              </div>
            </Box>
            
          </FirstPart>

          <SecondPart>
            <Box title="MEASSUREMENT TABLE">
              <div>
                <table className="table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Air temperature</th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
              </div>

              <div>
                <table className="table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Air humidity</th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
              </div>

              <div>
                <table className="table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Soil moisture</th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
              </div>

              <div>
                <table className="table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Watering</th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
              </div>
            </Box>
          </SecondPart>
          
          <ThirdPart>
            <Box title="CONTROL PANEL">
              <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                <ButtonSensor onClick={() => console.log("READ AIR TEMPERATURE AND HUMIDITY")}>
                  READ AIR TEMPERATURE AND HUMIDITY
                </ButtonSensor>

                <ButtonSensor onClick={() => console.log("READ SOIL MOISTURE")}>
                  READ SOIL MOISTURE
                </ButtonSensor>

                <ButtonAuto onClick={() => console.log("START AUTOMATIC WATERING")}>
                  START AUTOMATIC WATERING
                </ButtonAuto>

                <ButtonAuto onClick={() => console.log("STOP AUTOMATIC WATERING")}>
                  STOP AUTOMATIC WATERING
                </ButtonAuto>
              </div>

              <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                <ButtonWater onClick={() => console.log("WATER THE PLANT")}>
                  WATER THE PLANT
                </ButtonWater>
              </div>
            </Box>
          </ThirdPart>
          {}
        </Dashboard>
      </main>
    );
};

export default DashboardPage;