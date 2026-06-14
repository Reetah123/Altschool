// For selecting HTML elements
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");

const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");

const weatherIcon = document.getElementById("weatherIcon");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

const forecastContainer = document.getElementById("forecastContainer");

// Run findWeather when the form is submitted
searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  findWeather();
});

// Main function triggered when user searches for a city
async function findWeather() {
  const city = cityInput.value.trim();

  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  showLoading("Loading...");
  clearError();

  try {
    const location = await getCityCoordinates(city);
    const weatherData = await getWeather(location.latitude, location.longitude);

    displayCurrentWeather(weatherData, location.name, location.country);
    displayForecast(weatherData.daily);

    loadingMessage.textContent = "";
  } catch (error) {
    showError("City not found. Please try another city.");
    loadingMessage.textContent = "";
  }
}

// Get coordinates for a city name using Open-Meteo Geocoding API
async function getCityCoordinates(city) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?name=" +
    city +
    "&count=1&language=en&format=json";

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }

  return data.results[0];
}

// Fetch current weather and 5-day forecast using latitude and longitude
async function getWeather(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=" +
    lat +
    "&longitude=" +
    lon +
    "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
    "&daily=temperature_2m_max,temperature_2m_min,weather_code" +
    "&timezone=auto";

  const response = await fetch(url);
  const data = await response.json();

  return data;
}

// Update the page with current weather data
function displayCurrentWeather(data, city, country) {
  const current = data.current;
  const weatherInfo = getWeatherDescription(current.weather_code);

  weatherIcon.textContent = weatherInfo.icon;
  cityName.textContent = city + ", " + country;
  temperature.textContent = current.temperature_2m + "°C";
  description.textContent = weatherInfo.description;

  humidity.textContent = "Humidity: " + current.relative_humidity_2m + "%";
  windSpeed.textContent = "Wind Speed: " + current.wind_speed_10m + " km/h";
}

// Update the page with 5-day forecast data
function displayForecast(daily) {
  forecastContainer.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const date = new Date(daily.time[i]);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    const weatherInfo = getWeatherDescription(daily.weather_code[i]);

    const forecastItem = document.createElement("div");

    forecastItem.innerHTML =
      "<p><strong>" +
      dayName +
      "</strong></p>" +
      "<p>" +
      weatherInfo.icon +
      " " +
      weatherInfo.description +
      "</p>" +
      "<p>High: " +
      daily.temperature_2m_max[i] +
      "°C</p>" +
      "<p>Low: " +
      daily.temperature_2m_min[i] +
      "°C</p>" +
      "<hr>";

    forecastContainer.appendChild(forecastItem);
  }
}

// Convert WMO weather code into readable description and icon
function getWeatherDescription(code) {
  if (code === 0) {
    return { description: "Clear sky", icon: "☀" };
  } else if (code === 1 || code === 2 || code === 3) {
    return { description: "Partly cloudy", icon: "⛅" };
  } else if (code === 45 || code === 48) {
    return { description: "Foggy", icon: "🌫" };
  } else if (code === 51 || code === 53 || code === 55) {
    return { description: "Drizzle", icon: "" 🌦};
  } else if (code === 61 || code === 63 || code === 65) {
    return { description: "Rain", icon: "🌧" };
  } else if (code === 71 || code === 73 || code === 75) {
    return { description: "Snow", icon: "❄️" };
  } else if (code === 80 || code === 81 || code === 82) {
    return { description: "Rain showers", icon: "🌦️" };
  } else if (code === 95) {
    return { description: "Thunderstorm", icon: "⛈️" };
  } else {
    return { description: "Unknown weather", icon: "❔" };
  }
}

// Show an error message on the page
function showError(message) {
  errorMessage.textContent = message;
}

// Clear error message
function clearError() {
  errorMessage.textContent = "";
}

// Show loading message while fetching data
function showLoading(message) {
  loadingMessage.textContent = message;
}
