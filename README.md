<h1 align="center">Automatic-virtual-meassurement-systems</h1>

<div align="center">
  <img src="./docs/assets/logo.png" style="border-radius: 50%;">
</div>

<p>This is a custom solution for monitoring plant growth using an analog soil moisture sensor, DHT22 air temperature and humidity sensor, and a relay module for controlling the water pump. The system is designed to run on a Raspberry Pi, with a Python asyncio API, and is deployed using Docker. The Raspberry Pi is connected to the server via Tailscale Zero Tier VPN, and on the server side, there is a middleware Golang API that forwards all data to a PostgreSQL database. Additionally, there is a NextJS frontend server written in React and Typescript that serves a real-time website of the sensors that are connected to the Raspberry Pi.</p>

<p>Both the RPi API and Server are forwarded through nginx reverse proxy for aditional customization and security.</p>

<h2>Getting Started</h2>

<h3>Hardware prerequsites</h3>
<ul>
  <li>RaspberryPi 3/4 (These were tested and work, should also work for others by editing the .env files in `/Raspberry-pi` folder)</li>
  <li>Analog soil moisture sensor (Tested with the simple capacitive one that is readily available)</li>
  <li>DHT22 sensor</li>
  <li>Relay module to work with RPi</li>
  <li>Analog-digital-converter MCP3008 for the soil moisture sensor (or any equivalent that is compatible with *CircuitPython* library)</li>
  <li>Breakout board (With correct pinout to the sensors and ADC)</li>
</ul>

<div align="center">
  <img src="./docs/assets/circuit1.jpg" style="width: 48%;">
  <img src="./docs/assets/circuit2.jpg" style="width: 48%;">
  <img src="./docs/assets/circuit3.jpg" style="width: 48%;">
</div>

<h3>Software prerequisites</h3>
<ul>
  <li>Docker and Docker compose</li>
  <li>Tailscale VPN (or any other viable VPN that connects RPI with the server)</li>
  <li>Optional software for non-containerized development:
    <ul>
      <li>Next.js</li>
      <li>PostgreSQL</li>
      <li>Nginx</li>
    </ul>
  </li>
</ul>

<h3>Installing and running the code</h3>
<ol>
  <li>Clone this repository:
    <pre>
      ```bash
      git clone https://github.com/Timotej979/Automatic-virtual-meassurement-systems.git
      cd Automatic-virtual-meassurement-systems
      ```
    </pre>
  </li>
  <li>Set up Tailscale and make sure the Raspberry Pi and Server are connected to the same Tailscale network.</li>
  <li>Build and run the Docker containers in respective folders (/Raspberry-pi and /Server):
    <pre>
      ```bash
      docker compose build
      docker-compose up
      ```
    </pre>
  </li>
  <li>Navigate to the frontend website that is proxied through nginx: <a href="http://localhost:5001/dashboard">http://localhost:5001/dashboard</a></li>
</ol>

<div align="center">
  <img src="./docs/assets/dashboard.png" style="border-radius: 50%;">
</div>

<h2>Usage</h2>

<p>Once the system is set up and running, the sensors connected to the Raspberry Pi will begin sending data to the Python asyncio API, which will forward the data to the middleware Golang API on the server. The middleware API will then store the data in the PostgreSQL database. The frontend website will display the real-time data from the sensors, allowing you to monitor the plant growth and control the water pump using the relay module.</p>

<div align="center">
  <img src="./docs/assets/arch.png" style="border-radius: 50%;">
</div>

More in-detail documentation is available in the PDF report in **/docs** folder currently in Slovene language.

Code for server-side/raspberry-side is available in the respective folders **/raspberry-pi** and **/server**.


<h2>Contributing</h2>

<p>Contributions are welcome! To contribute to this project, fork this repository and make your changes. Once you're ready to submit your changes, create a pull request.</p>

<h2>License</h2>

<p>This project is licensed under the BSD-3-Clause License. See the LICENSE file for details.</p>
