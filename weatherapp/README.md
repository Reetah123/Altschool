# Weather App

**Name:** Rita Ogar

**Student ID:** ALT/SOE/BAR/026/0125

## About

This is a small weather app built with plain HTML, CSS, and JavaScript - no frameworks. When the page loads it asks the browser for your location and shows the local weather right away, but you can also type in any city and search for it. The weather data comes from the Open-Meteo API, and the city-name lookups use Open-Meteo's geocoding plus BigDataCloud for turning your coordinates back into a place name. It shows the current temperature, what it feels like, humidity, wind, and the UV index, along with a 5-day forecast. There's also a °C / °F toggle that switches the units without making a new request, since the last result is saved and just re-drawn.

## How to run

Open `index.html` in a browser. Geolocation only works over `https://` or `http://localhost`, so if you open the file directly the location feature won't run — but searching for a city still works fine.

## Files

- `index.html` - page structure
- `styles.css` - styling
- `script.js` - fetching the data and updating the page
