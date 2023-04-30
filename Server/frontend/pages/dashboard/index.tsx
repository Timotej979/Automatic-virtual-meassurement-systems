import { Inter } from 'next/font/google'
import { Dashboard, FirstPart, SecondPart, ThirdPart, Box, ButtonSensor, ButtonAuto, ButtonWater } from '@/components/Dashboard'

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

          <FirstPart >
            
            <Box title="AIR TEMPERATURE AND HUMIDITY">
              <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                Air temperature: 0°C
              </div>  
            </Box>
            
            <Box title="SOIL MOISTURE">
              <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                Soil moisture: 0%
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