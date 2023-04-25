import { Inter } from 'next/font/google'
import { Dashboard, Box, Button } from '@/components/Dashboard'

const inter = Inter({ subsets: ['latin'] })

/*
// Automatic watering class
class automaticWateringClass {
  // Kill switch
  killSwitch: boolean;

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
  
  async getAirTemperatureHumidity() {



  async changeRelayState() {
    // Send request to localhost/changeRelayState
  }
}




// Create instances of used classes
const apiRequestClassInstance = new apiRequestClass();
const automaticWateringClassInstance = new automaticWateringClass();
*/


// Webpage component
const DashboardPage: React.FC = () => {
    return (
      <main>
        <Dashboard>
          
          <Box title="AIR TEMPERATURE AND HUMIDITY">
            {<p>Air temp</p>}
          </Box>

          <Box title="SOIL MOISTURE">
            {/* Add box 2 content here */}
          </Box>
          
          <Box title="CONTROL PANEL">
            <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
              <Button onClick={() => console.log("READ AIR TEMPERATURE AND HUMIDITY")}>
                READ AIR TEMPERATURE AND HUMIDITY
              </Button>

              <Button onClick={() => console.log("READ SOIL MOISTURE")}>
                READ SOIL MOISTURE
              </Button>
            </div>

            <div>
              <Button onClick={() => console.log("START AUTOMATIC WATERING")}>
                START AUTOMATIC WATERING
              </Button>

              <Button onClick={() => console.log("STOP AUTOMATIC WATERING")}>
                STOP AUTOMATIC WATERING
              </Button>
            </div>

            <div>
              <Button onClick={() => console.log("WATER THE PLANT")}>
                WATER THE PLANT
              </Button>
            </div>
          </Box>

          <Box title="MEASSUREMENT TABLE">
            <div>

            </div>
          </Box>

          {}
        </Dashboard>
      </main>
    );
};

export default DashboardPage;