import { Inter } from 'next/font/google'
import React, { Component } from 'react';
import { Dashboard, FirstPart, SecondPart, ThirdPart, BoundaryBox, ButtonSensor, ButtonAuto, ButtonWater, ThresholdDiscreteSlider, WateringDiscreteSlider, AxisLabel } from '@/components/Dashboard'

// Graph imports
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

const inter = Inter({ subsets: ['latin'] })

//////////////////////////////////////////////////////////////////////////////////////////
// Webpage component
const DashboardPage: React.FC = () => {    
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Update table class
    class updateTables {
        // Number of rows to display
        numOfRows: number;
        // Constructor
        constructor() {
            // Set the number of rows to display (-1)
            this.numOfRows = 5;
        }
        // Update air temperature table
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
            newCell1.innerHTML = temperature.toString() + "°C";
            timestamp = timestamp.replace("T", " ");
            timestamp = timestamp.replace("Z", "");
            newCell2.innerHTML = timestamp;
            // Remove the last row if there are more than 10 rows
            if (airTemperatureTable.rows.length > this.numOfRows) {
                airTemperatureTable.deleteRow(this.numOfRows);
            }
        }
        // Update air humidity table
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
            newCell1.innerHTML = humidity.toString() + "%";
            timestamp = timestamp.replace("T", " ");
            timestamp = timestamp.replace("Z", "");
            newCell2.innerHTML = timestamp;
            // Remove the last row if there are more than 10 rows
            if (airHumidityTable.rows.length > this.numOfRows) {
                airHumidityTable.deleteRow(this.numOfRows);
            }
        }
        // Update soil moisture table
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
            newCell1.innerHTML = moisture.toString() + "%";
            timestamp = timestamp.replace("T", " ");
            timestamp = timestamp.replace("Z", "");
            newCell2.innerHTML = timestamp;
            // Remove the last row if there are more than 10 rows
            if (soilMoistureTable.rows.length > this.numOfRows) {
                soilMoistureTable.deleteRow(this.numOfRows);
            }
        }
        // Update relay state table
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
        // Get air temperature and humidity
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
          // Get bulk air temperature and humidity
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
              // Update the tables and graphs
              for (let i = 0; i < numOfReadings; i++) {
                  this.updateTables.updateAirTemperatureTable(airTemperatureList[i], timestampList[i]);
                  this.updateTables.updateAirHumidityTable(airHumidityList[i], timestampList[i]);
              }
              // Return the data
              return [airTemperatureList, airHumidityList, timestampList];
          }
          // Get soil moisture
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
          // Get bulk soil moisture
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
              // Update the tables and graphs
              for (let i = 0; i < numOfReadings; i++) {
                  this.updateTables.updateSoilMoistureTable(soilMoistureList[i], timestampList[i]);
              }
              // Return the data
              return [soilMoistureList, timestampList];
          }
          // Set relay state ON
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
          // Set relay state OFF
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
    //////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////
    // Manual sensor class
    class manualSensorClass {
        // Api request class instance
        apiRequestClassInstance: apiRequestClass;
        // Number of sensor values to get
        numOfValues: number
        // Constructor
        constructor() {
            // Create an instance of the api request class
            this.apiRequestClassInstance = new apiRequestClass();
            this.numOfValues = 4;
        }
        // Start get numOfValues times air temperature and humidity values function
        async manualGetAirTemperatureHumidityValues() {
            console.log("## Manual get air temperature and humidity values started ##");
            // Get the sensor values
            await this.apiRequestClassInstance.getBulkAirTemperatureHumidity(this.numOfValues);
            console.log("## Manual get air temperature and humidity values stopped ##");
        }
        // Start get numOfValues times soil moisture values function
        async manualGetSoilMoistureValues() {
            console.log("## Manual get soil moisture values started ##");
            // Get the sensor values
            await this.apiRequestClassInstance.getBulkSoilMoisture(this.numOfValues);
            console.log("## Manual get soil moisture values stopped ##");
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////
    // Manula watering class
    class manualWateringClass {
        // Api request class instance
        apiRequestClassInstance: apiRequestClass;
        // Constructor
        constructor() {
            // Create an instance of the api request class
            this.apiRequestClassInstance = new apiRequestClass();
        }
        // Start manual watering function
        async manualWatering(time: number) {
            console.log("## Manual watering started ##");
            // Set the relay state to ON
            this.apiRequestClassInstance.setRelayStateON();
            // Wait for the specified time in seconds (*1000 to convert to milliseconds)
            await new Promise<void>((resolve) => setTimeout(() => resolve(), time*1000));
            // Set the relay state to OFF
            this.apiRequestClassInstance.setRelayStateOFF();
            console.log("## Manual watering stopped ##");
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////
    // Automatic watering class
    class automaticWateringClass {
        // Sample time in miliseconds
        sampleTime: number;
        // Kill switch
        killSwitch: boolean;
        // Api request class instance
        apiRequestClassInstance: apiRequestClass;
        // Constructor
        constructor() {
            // Set the sample time to 2500 miliseconds
            this.sampleTime = 2500;
            // Set the kill switch to false
            this.killSwitch = false;
            // Create an instance of the api request class
            this.apiRequestClassInstance = new apiRequestClass();
        }
        // Start automatic watering
        async startAutomaticWatering(threshold: number) {
            console.log("## Automatic watering started ##");
            // Set the kill switch to false
            this.killSwitch = false;
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
                // Get the current air temperature and humidity
                await this.apiRequestClassInstance.getAirTemperatureHumidity();
                // If the soil is wet enough, stop watering
                if (soilMoistureArray[0] >= threshold) {
                    // Stop watering the plant
                    const relayState = await this.apiRequestClassInstance.setRelayStateOFF();
                    // While loop to make sure the relay state is off
                    while (relayState[0] != false) {
                        // Wait for 2 seconds and try again
                        new Promise((resolve) => setTimeout(resolve, 2000));
                        const relayState = await this.apiRequestClassInstance.setRelayStateOFF();
                    }
                } else {
                    // Water the plant for 5 seconds
                    const relayState = await this.apiRequestClassInstance.setRelayStateON();
                    // While loop to make sure the relay state is on
                    while (relayState[0] != true) {
                        // Wait for 2 second and try again
                        new Promise((resolve) => setTimeout(resolve, 2000));
                        const relayState = await this.apiRequestClassInstance.setRelayStateON();
                    }
                }
                // Wait for the sample time
                new Promise((resolve) => setTimeout(resolve, this.sampleTime));
                // If the kill switch is on, stop watering
                if (this.killSwitch) {
                    // Exit while loop
                    break;
                }
            }
        }
    }   
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Soil moisture graph component
    class SoilMoistureGraphComponent extends Component {
        // Interval time in miliseconds
        intervalTime: number = 60000;
        // Define the api request class instance
        apiRequestClassInstance = new apiRequestClass();
        // Define the state
        state = {
            chartData: Array<{ soilMoisture: number, date: string }>()
        };
        // Fetch the data and set the state
        fetchData = async () => {
            // Fetch the latest data point
            const [soilMoisture, timestamp] = await this.apiRequestClassInstance.getSoilMoisture();
            // Create the new chart data
            const newChartData = [...this.state.chartData];
            // Split the timestamp into date and time and format it
            const [datePart, timePart] = timestamp.split('T');
            // If the chart data array is empty, add the first data point
            if (newChartData.length === 0) {
                newChartData.push({ soilMoisture: soilMoisture, date: timePart.replace("Z", "") });
            } else {
                // Remove the first data point and add the new data point at the end
                newChartData.shift();
                newChartData.push({ soilMoisture: soilMoisture, date: timePart.replace("Z", "") });
            }
            // Set the state
            this.setState({ chartData: newChartData });
        };
        // Fetch the data initially and start the interval
        componentDidMount() {
            // Fetch the initial 10 data points
            this.apiRequestClassInstance.getBulkSoilMoisture(10).then(requestArray => {
                // Create the chart data array and format the timestamp
                const soilMoistureArray = requestArray[0];
                const timestampArray = requestArray[1];
                const chartData = [];
                for (let i = 0; i < soilMoistureArray.length; i++) {
                    const [datePart, timePart] = timestampArray[i].split('T');
                    chartData.push({ soilMoisture: soilMoistureArray[i], date: timePart.replace("Z", "") });
                }
                // Add the initial 10 data points to the chart data
                this.setState({ chartData });
                // Fetch the latest data point and start the interval
                this.fetchData();
                setInterval(this.fetchData, this.intervalTime);
            });
        }
        // Render the chart
        render() {
            const { chartData } = this.state;
            return (
                <LineChart width={1400} height={300} data={chartData} margin={{ left: 25, bottom: 30 }}>
                    <Line type="monotone" dataKey="soilMoisture" stroke="#32cd32" strokeWidth={5} />
                    <CartesianGrid stroke="#fff" strokeWidth={2} strokeDasharray="5 5" />
                    <XAxis
                        dataKey="date"
                        label={{ value: "Timestamp [hh:mm:ss]", position: "insideBottom", offset: -20, fontSize: 18, fill: "#fff" }}
                        stroke="#fff"
                        strokeWidth={3}
                    />
                    <YAxis
                        label={<AxisLabel axisType="yAxis" x={45} y={105} width={0} height={0} fill="#fff">Soil moisture [%]</AxisLabel>}
                        stroke="#fff"
                        strokeWidth={3}
                        min={0}
                        max={100}
                    />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div style={{ backgroundColor: "#808080", padding: "5px", borderRadius: 12, color: '#32cd32' }}>
                                        <p style={{ color: "#fff", margin: "0" }}>
                                            Timestamp: {label}
                                        </p>
                                        <p style={{ color: "#fff", margin: "0" }}>
                                            Soil moisture: {payload[0].value}%
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                </LineChart>
            );
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Air temperature and humidity graph component
    class AirTemperatureHumidityGraphComponent extends Component {
        // Interval time in seconds
        intervalTime: number = 60000;
        // Define the api request class instance
        apiRequestClassInstance = new apiRequestClass();
        // Define the state
        state = {
            chartData: Array<{ airTemperature: number, airHumidity: number, date: string }>()
        };
        // Fetch the data and set the state
        fetchData = async () => {
            // Fetch the latest data point
            const [airTemperature, airHumidity, timestamp] = await this.apiRequestClassInstance.getAirTemperatureHumidity();
            // Create the new chart data
            const newChartData = [...this.state.chartData];
            // Split the timestamp into date and time and format it
            const [datePart, timePart] = timestamp.split('T');
            // If the chart data array is empty, add the first data point
            if (newChartData.length === 0) {
                newChartData.push({ airTemperature, airHumidity, date: timePart.replace("Z", "") });
            } else {
                // Remove the oldest data point and add the new one at the end
                newChartData.shift();
                newChartData.push({ airTemperature, airHumidity, date: timePart.replace("Z", "") });
            }
            // Update the chart data state
            this.setState({ chartData: newChartData });
        }
        // Fetch the data initially and start the interval
        componentDidMount() {
            // Fetch the initial 10 data points
            this.apiRequestClassInstance.getBulkAirTemperatureHumidity(10).then(requestArray => {
                const airTemperatureArray = requestArray[0];
                const airHumidityArray = requestArray[1];
                const timestampArray = requestArray[2];
                const chartData = [];
                for (let i = 0; i < airTemperatureArray.length; i++) {
                    const [datePart, timePart] = timestampArray[i].split('T');
                    chartData.push({ airTemperature: airTemperatureArray[i], airHumidity: airHumidityArray[i], date: timePart.replace("Z", "") });
                }
                // Add the initial 10 data points to the chart data
                this.setState({ chartData });
                // Fetch the latest data point and start the interval
                this.fetchData();
                setInterval(this.fetchData, this.intervalTime);
            });
        }
        // Render the chart
        render() {
            const { chartData } = this.state;
            return (
                <LineChart width={1400} height={300} data={chartData} margin={{ left: 25, bottom: 30 }}>
                    <Line type="monotone" dataKey="airTemperature" stroke="#ff0" strokeWidth={5} />
                    <Line type="monotone" dataKey="airHumidity" stroke="#87ceeb" strokeWidth={5} />
                    <CartesianGrid stroke="#fff" strokeWidth={2} strokeDasharray="5 5" />
                    <XAxis
                        dataKey="date"
                        label={{ value: "Timestamp [hh:mm:ss]", position: "insideBottom", offset: -20, fontSize: 18, fill: "#fff" }}
                        stroke="#fff"
                        strokeWidth={3}
                    />
                    <YAxis label={<AxisLabel axisType="yAxis" x={25} y={105} width={0} height={0} fill='#fff'>Air Temperature [°C]{'\n'}Air Humidity [%]</AxisLabel>}
                        stroke="#fff"
                        strokeWidth={3}
                        min={0}
                        max={100}/>
                    <Tooltip content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div style={{ backgroundColor: "#808080", padding: "5px", borderRadius: 12, color: '#32cd32' }}>
                                    <p style={{ color: "#fff", margin: "0" }}>
                                        Timestamp: {label}
                                    </p>
                                    <p style={{ color: "#fff", margin: "0" }}>
                                        Air Temperature: {payload[0].value}°C
                                    </p>
                                    <p style={{ color: "#fff", margin: "0" }}>
                                        Air Humidity: {payload[1].value}%
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    }}/>
                </LineChart>
            );
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Create automatic watering class instance
    const manualSensorClassInstance = new manualSensorClass;
    const manualWateringClassInstance = new manualWateringClass;
    const automaticWateringClassInstance = new automaticWateringClass;
    // Create api request class instance and initialize the relay state to fill the relay state table
    const apiRequestClassInstance = new apiRequestClass;
    for(let i = 0; i < 6; i++) {
        apiRequestClassInstance.setRelayStateOFF();
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Return the webpage
    return (
      <main>
        <Dashboard>
          <FirstPart >
            <BoundaryBox title="AIR TEMPERATURE AND HUMIDITY">
              <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                <AirTemperatureHumidityGraphComponent />
              </div>  
            </BoundaryBox>
            <BoundaryBox title="SOIL MOISTURE">
              <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                <SoilMoistureGraphComponent />
              </div>
            </BoundaryBox>
          </FirstPart>
          <SecondPart>
            <BoundaryBox title="LATEST MEASUREMENTS">
            <div className="flex flex-col gap-4 h-full">
                <div className="flex-grow">
                  <table id="airTemperatureTable" className="table-auto w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Air Temperature</th>
                        <th className="px-4 py-2 w-3/5">Timestamp</th>
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
                        <th className="px-4 py-2 w-3/5">Timestamp</th>
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
                        <th className="px-4 py-2 w-3/5">Timestamp</th>
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
                        <th className="px-4 py-2 w-3/5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>
            </BoundaryBox>
          </SecondPart>
          <ThirdPart>
            <BoundaryBox title="CONTROL PANEL">
              <div className="mb-32 grid lg:mb-0 lg:grid-cols-4">
                <div className="flex flex-col justify-center items-left">
                  <ButtonSensor onClick={() => manualSensorClassInstance.manualGetAirTemperatureHumidityValues()}>
                    READ AIR TEMPERATURE AND HUMIDITY
                  </ButtonSensor>
                </div>
                <div className="flex flex-col justify-center items-left">
                  <ButtonSensor onClick={() => manualSensorClassInstance.manualGetSoilMoistureValues()}>
                    READ SOIL MOISTURE
                  </ButtonSensor>
                </div>
                <div id="WaterSlider" className="flex flex-col justify-center items-center">
                  <WateringDiscreteSlider/>
                </div>
                <div className="flex flex-col justify-center items-left">
                  <ButtonWater onClick={() => { const waterSliderText = document.getElementById("WaterSlider")?.innerText;
                                                if (waterSliderText !== undefined) {
                                                  const waterSliderValue = parseInt(waterSliderText);
                                                  manualWateringClassInstance.manualWatering(waterSliderValue);
                                                }
                                              }}>
                    WATER THE PLANT
                  </ButtonWater>
                </div>
              </div>
              <div className="mb-32 grid lg:mb-0 lg:grid-cols-4">
                <div className="flex flex-col justify-center items-left">
                  <ButtonAuto onClick={() => { const thresholdSliderText = document.getElementById("ThresholdSlider")?.innerText;
                                                if (thresholdSliderText !== undefined) {
                                                  const thresholdSliderValue = parseInt(thresholdSliderText);
                                                  automaticWateringClassInstance.startAutomaticWatering(thresholdSliderValue);
                                                }
                                             }}>
                    START AUTOMATIC WATERING
                  </ButtonAuto>
                </div>
                <div className="flex flex-col justify-center items-left">
                  <ButtonAuto onClick={() => automaticWateringClassInstance.stopAutomaticWatering()}>
                    STOP AUTOMATIC WATERING
                  </ButtonAuto>
                </div>
                <div id="ThresholdSlider" className="flex flex-col justify-center items-center">
                  <ThresholdDiscreteSlider/>                
                </div>
              </div>
            </BoundaryBox>
          </ThirdPart>
          {}
        </Dashboard>
      </main>
    );
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Export the page
export default DashboardPage;