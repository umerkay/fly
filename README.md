# Simple Flight Simulator

Welcome to the **Simple Flight Simulator**! This project is a lightweight, browser-based flight simulation experience designed to provide users with an interactive and engaging way to explore basic flight mechanics.

## Features

- **Map Selector**: Choose from different environments such as Desert, Hills, Mountains, and Snow Field.
- **Thrust Control**: Adjust thrust using the on-screen thrust bar or keyboard controls.
- **Interactive Gauges**:
  - **Speedometer**: Displays the current speed in mph.
  - **Compass**: Shows the current heading direction.
  - **Attitude Indicator**: Visualizes pitch and roll angles.
  - **Altimeter**: Displays altitude and vertical speed.
- **Night Mode**: Toggle night mode for a darker interface.
- **Engine Control**: Turn the engine off or on.
- **Parking Brakes**: Engage or disengage parking brakes.
- **Pause Functionality**: Pause the simulation at any time.
- **Loading Screen**: Displays a loading screen before the simulation starts.
- **Restart Button**: Restart the simulation from the beginning.

## Why did I build it?

For fun basically. It is a fun and experimental project designed to explore the basics of flight mechanics and user interaction in a 3D environment. It is intentionally simple.

It started off with those Gemini 2.5 vibe coding posts from LinkedIn and videos on YouTube. I wanted to see what I could do. I did use AI a lot, mostly for boilerplate codes. But I spent excruciating hours on the flight mechanics and terrain generation.

Really proud of the terrain generation. It uses Perlin and Fractal noise to generate realistic-looking terrains. All maps are generated procedurally, based on a seed, and are infinite. Every reasonable effort is made to make them look realistic and interesting (especially proud of the volcanic map). Every reasonable effort has also been made to make sure it runs on a potato. No, really. It has been performance optimized. Every decision step is taken to make sure of that.

Special thanks to [The Coding Train](https://www.youtube.com/@TheCodingTrain) (for inspiration for terrain generation) and [Mentour Pilot](https://www.youtube.com/@MentourPilot) (for making me interested in aviation).

## How to Use

1. **Start the Simulation**:
   - Open the `index.html` file in your browser.
   - On the welcome screen, select a map from the dropdown menu and click the "Start" button.

2. **Control the Aircraft**:
   - Use the thrust bar or keyboard controls (`W` to increase thrust) to take off.
   - Monitor the gauges to maintain control of the aircraft:
     - Speedometer for speed.
     - Compass for heading.
     - Attitude Indicator for pitch and roll.
     - Altimeter for altitude and vertical speed.

3. **Additional Controls**:
   - Use the buttons in the control panel to toggle night mode, turn off the engine, engage parking brakes, or pause the simulation.

4. **Restart**:
   - Click the "Restart" button to reset the simulation.

## Technologies Used

- **HTML/CSS**: For the structure and styling of the user interface.
- **JavaScript**: For interactive elements and simulation logic.
- **Three.js**: For rendering 3D environments and objects.
- **Noise.js**: For procedural noise generation.

## File Structure

- `index.html`: Main HTML file containing the structure of the simulator.
- `style.css`: Stylesheet for the simulator's UI.
- `index.js`: JavaScript file containing the logic for the simulation.
- External Libraries:
  - [Three.js](https://threejs.org/)
  - [Noise.js](https://github.com/josephg/noisejs)

## License

This project is open-source and available under the MIT License.

---

Made with 💖✨ by [umerkay](https://umerkay.github.io/)
