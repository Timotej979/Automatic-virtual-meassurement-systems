import { Inter } from 'next/font/google'
import { Dashboard, FirstPart, SecondPart, ThirdPart, Box, ButtonSensor, ButtonAuto, ButtonWater, ThresholdSlider } from '@/components/Dashboard'

const inter = Inter({ subsets: ['latin'] })


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Update table class
class updateTables {
  // Number of rows to display
  numOfRows: number;

  // Constructor
  constructor() {
    // Set the number of rows to display (-1)
    this.numOfRows = 4;
  }

  async updateAirTemperatureTable(temperature: number, timestamp: string) {
    // Get AirTemperatureTable and add a new row
    const airTemperatureTable = document.getElementById("airTemperatureTable")! as  HTMLTableElement;

    // Create a new row and cells
    const newRow = airTemperatureTable.insertRow(1);
    const newCell1 = newRow.insertCell(0);
    const newCell2 = newRow.insertCell(1);

    // Set cell style
    newCell1.style.textAlign = "center";
    newCell2.style.textAlign = "center";

    // Add the data to the cell and reformat the timestamp
    newCell1.innerHTML = temperature.toString();
    timestamp = timestamp.replace("T", " ");
    timestamp = timestamp.replace("Z", "");
    newCell2.innerHTML = timestamp;

    // Remove the last row if there are more than 10 rows
    if (airTemperatureTable.rows.length > this.numOfRows) {
      airTemperatureTable.deleteRow(this.numOfRows);
    }
  }

  async updateAirHumidityTable(humidity: number, timestamp: string) {
    // Get AirHumidityTable and add a new row
    const airHumidityTable = document.getElementById("airHumidityTable")! as HTMLTableElement;

    // Create a new row and cells
    const newRow = airHumidityTable.insertRow(1);
    const newCell1 = newRow.insertCell(0);
    const newCell2 = newRow.insertCell(1);

     // Set cell style
     newCell1.style.textAlign = "center";
     newCell2.style.textAlign = "center";

    // Add the data to the cell and reformat the timestamp
    newCell1.innerHTML = humidity.toString();
    timestamp = timestamp.replace("T", " ");
    timestamp = timestamp.replace("Z", "");
    newCell2.innerHTML = timestamp;

    // Remove the last row if there are more than 10 rows
    if (airHumidityTable.rows.length > this.numOfRows) {
      airHumidityTable.deleteRow(this.numOfRows);
    }
  }

  async updateSoilMoistureTable(moisture: number, timestamp: string) {
    // Get SoilMoistureTable and add a new row
    const soilMoistureTable = document.getElementById("soilMoistureTable")! as HTMLTableElement;

    // Create a new row and cells
    const newRow = soilMoistureTable.insertRow(1);
    const newCell1 = newRow.insertCell(0);
    const newCell2 = newRow.insertCell(1);

     // Set cell style
     newCell1.style.textAlign = "center";
     newCell2.style.textAlign = "center";

    // Add the data to the cell and reformat the timestamp
    newCell1.innerHTML = moisture.toString();
    timestamp = timestamp.replace("T", " ");
    timestamp = timestamp.replace("Z", "");
    newCell2.innerHTML = timestamp;

    // Remove the last row if there are more than 10 rows
    if (soilMoistureTable.rows.length > this.numOfRows) {
      soilMoistureTable.deleteRow(this.numOfRows);
    }
  }

  async updateRelayStateTable(relayState: boolean, timestamp: string) {
    // Get RelayStateTable and add a new row
    const relayStateTable = document.getElementById("relayStateTable")! as HTMLTableElement;

    // Create a new row and cells
    const newRow = relayStateTable.insertRow(1);
    const newCell1 = newRow.insertCell(0);
    const newCell2 = newRow.insertCell(1);

     // Set cell style
     newCell1.style.textAlign = "center";
     newCell2.style.textAlign = "center";

    // Add the data to the celland rephrase the boolean and reformat the timestamp
    if (relayState) {
      newCell1.innerHTML = "ON";
      timestamp = timestamp.replace("T", " ");
      timestamp = timestamp.replace("Z", "");
      newCell2.innerHTML = timestamp;
    } else {
      newCell1.innerHTML = "OFF";
      timestamp = timestamp.replace("T", " ");
      timestamp = timestamp.replace("Z", "");
      newCell2.innerHTML = timestamp;
    }

    // Remove the last row if there are more than 10 rows
    if (relayStateTable.rows.length > this.numOfRows) {
      relayStateTable.deleteRow(this.numOfRows);
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API REQUEST CLASS 
class apiRequestClass {
  // Define root url to make requests to API
  rootUrl: string;
  // Define updateTables class
  updateTables: updateTables;

  // Constructor
  constructor() {
    // Set the root url
    this.rootUrl = "http://localhost:5001/goserver/v1/api";
    // Set the updateTables class
    this.updateTables = new updateTables();
  }

  async getAirTemperatureHumidity() {
    // Make a request to the server
    const response = await fetch(`${this.rootUrl}/get-air-temperature-humidity`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Get the response data, stringify it, and parse it correctly
    const data = await response.json();
    const dataString = JSON.stringify(data);
    const jsonData = JSON.parse(dataString);
    const message = jsonData["message"];
    const airTemperature = message["air-temperature"];
    const airHumidity = message["air-humidity"];
    const timestamp = message["timestamp"];

    // Update the tables
    this.updateTables.updateAirTemperatureTable(airTemperature, timestamp);
    this.updateTables.updateAirHumidityTable(airHumidity, timestamp);

    // Return the data
    return [airTemperature, airHumidity, timestamp];
  }

  async getBulkAirTemperatureHumidity(numOfReadings: number) {
    // Make a request to the server and add JSON data "numOfReadings"
    const response = await fetch(`${this.rootUrl}/get-bulk-air-temperature-humidity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        numOfReadings: numOfReadings,
      }),
    });

    // Get the response data, stringify it, and parse it correctly
    const data = await response.json();
    const dataString = JSON.stringify(data);
    const jsonData = JSON.parse(dataString);
    const message = jsonData["message"];   
    const airTemperatureList = message["air-temperature-list"];
    const airHumidityList = message["air-humidity-list"];
    const timestampList = message["timestamp-list"];

    // Update the tables
    for (let i = 0; i < numOfReadings; i++) {
      this.updateTables.updateAirTemperatureTable(airTemperatureList[i], timestampList[i]);
      this.updateTables.updateAirHumidityTable(airHumidityList[i], timestampList[i]);
    }

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

    // Get the response data, stringify it, and parse it correctly
    const data = await response.json();
    const dataString = JSON.stringify(data);
    const jsonData = JSON.parse(dataString);
    const message = jsonData["message"];
    const soilMoisture = message["soil-moisture"];
    const timestamp = message["timestamp"];

    // Update the tables
    this.updateTables.updateSoilMoistureTable(soilMoisture, timestamp);

    // Return the data
    return [soilMoisture, timestamp];
  }

  async getBulkSoilMoisture(numOfReadings: number) {
    // Make a request to the server and add JSON data "numOfReadings"
    const response = await fetch(`${this.rootUrl}/get-bulk-soil-moisture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        numOfReadings: numOfReadings,
      }),
    });
    
    // Get the response data, stringify it, and parse it correctly
    const data = await response.json();
    const dataString = JSON.stringify(data);
    const jsonData = JSON.parse(dataString);
    const message = jsonData["message"];
    const soilMoistureList = message["soil-moisture-list"];
    const timestampList = message["timestamp-list"];

    // Update the tables
    for (let i = 0; i < numOfReadings; i++) {
      this.updateTables.updateSoilMoistureTable(soilMoistureList[i], timestampList[i]);
    }

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

    // Get the response data, stringify it, and parse it correctly
    const data = await response.json();
    const dataString = JSON.stringify(data);
    const jsonData = JSON.parse(dataString);
    const message = jsonData["message"];
    const relayState = message["relay-state"];
    const timestamp = message["timestamp"];

    // Update the tables
    this.updateTables.updateRelayStateTable(relayState, timestamp);

    // Return the data
    return [relayState, timestamp];
  }

  async setRelayStateOFF() {
    // Make a request to the server
    const response = await fetch(`${this.rootUrl}/set-relay-state-OFF`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Get the response data, stringify it, and parse it correctly
    const data = await response.json();
    const dataString = JSON.stringify(data);
    const jsonData = JSON.parse(dataString);
    const message = jsonData["message"];
    const relayState = message["relay-state"];
    const timestamp = message["timestamp"];

    // Update the tables
    this.updateTables.updateRelayStateTable(relayState, timestamp);

    // Return the data
    return [relayState, timestamp];
  }
} 



// Automatic watering class
class automaticWateringClass {
  // Kill switch
  killSwitch: boolean;
  // Api request class instance
  apiRequestClassInstance: apiRequestClass;
  
  // Constructor
  constructor() {
    // Set the kill switch to false
    this.killSwitch = false;
    // Create an instance of the api request class
    this.apiRequestClassInstance = new apiRequestClass();
  }

  // Start automatic watering
  async startAutomaticWatering() {
    console.log("## Automatic watering started ##");
    // Set the kill switch to false
    this.killSwitch = false;

    // Get the threshold
    const threshold = 50//document.getElementById("threshold")!.value;

    // Start automatic watering
    this.automaticWatering(threshold);
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
      const soilMoistureArray = await this.apiRequestClassInstance.getSoilMoisture();

      // If the soil is wet enough, stop watering
      if (soilMoistureArray[0] >= threshold) {
        // Stop watering the plant
        const relayState = await this.apiRequestClassInstance.setRelayStateOFF();

        while (relayState[0] != false) {
          // Wait for 2 seconds and try again
          new Promise((resolve) => setTimeout(resolve, 2000));
          const relayState = await this.apiRequestClassInstance.setRelayStateOFF();
        }

      } else {
        // Water the plant for 5 seconds
        const relayState = await this.apiRequestClassInstance.setRelayStateON();

        while (relayState[0] != true) {
          // Wait for 2 second and try again
          new Promise((resolve) => setTimeout(resolve, 2000));
          const relayState = await this.apiRequestClassInstance.setRelayStateON();
        }
      }

      // If the kill switch is on, stop watering
      if (this.killSwitch) {
        // Exit while loop
        break;
      }
    }
  }
}

// Create automatic watering class instance
const automaticWateringClassInstance = new automaticWateringClass;
const apiRequestClassInstance = new apiRequestClass;

// Make 10 requests for the air temperature and humidity
apiRequestClassInstance.getBulkAirTemperatureHumidity(10);

// Make 10 requests for the soil moisture
apiRequestClassInstance.getBulkSoilMoisture(10);

// Make 10 changes to the relay state
apiRequestClassInstance.setRelayStateON();
apiRequestClassInstance.setRelayStateOFF();
apiRequestClassInstance.setRelayStateON();
apiRequestClassInstance.setRelayStateOFF();
apiRequestClassInstance.setRelayStateON();
apiRequestClassInstance.setRelayStateOFF();
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
            <Box title="LATEST MEASUREMENTS">
              <div className="flex flex-col gap-4 h-full">
                <div className="flex-grow lg:flex-basis-25">
                  <table id="airTemperatureTable" className="table-auto w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Air Temperature</th>
                        <th className="px-4 py-2">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>

                <div className="flex-grow lg:flex-basis-25">
                  <table id="airHumidityTable" className="table-auto w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Air humidity</th>
                        <th className="px-4 py-2">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>

                <div className="flex-grow lg:flex-basis-25">
                  <table id="soilMoistureTable" className="table-auto w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Soil moisture</th>
                        <th className="px-4 py-2">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>

                <div className="flex-grow lg:flex-basis-25">
                  <table id="relayStateTable" className="table-auto w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Watering</th>
                        <th className="px-4 py-2">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
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