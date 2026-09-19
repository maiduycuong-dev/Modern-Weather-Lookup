This is a lightweight, front-end-only weather application built as a static website.
Overview:
Allows users to search for cities and displays current weather information.
Utilizes Open-Meteo APIs:
Geocoding API to identify the city.
Forecast API to retrieve data on temperature, humidity, wind speed, and weather condition codes.
The application then updates the page with the following information:
City name
Local time in that area
Current temperature
Weather description
Humidity and wind speed
Temperature unit toggle (°C/°F)
Repository structure:
index.html: Application structure and UI layout.
style.css: Design style inspired by glassmorphism/Fluent design, gradients, card-based layout, settings panel, and responsive design.
script.js: All interaction logic, API calls, options for themes/fonts/units, and local clock functionality.
favicon.png: Application icon (branding asset).
LICENSE: MIT License.
User Experience (UX) and Design:
Modern weather display card with a frosted glass effect.
Theme switching (Blue, Sunset, Emerald, Dark).
Font customization.
Temperature unit toggle.
User settings saved via browser localStorage.
Technologies used:
Vanilla HTML, CSS, and JavaScript.
No frameworks, build processes, or backend.
Runs directly in the browser.
Overall, this is a polished single-page application (SPA) weather dashboard prototype rather than a large-scale application; it serves as a lightweight, modern UI demo that utilizes real weather data.
