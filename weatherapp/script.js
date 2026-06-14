const cityInput         = document.getElementById("cityInput");
const searchButton         = document.getElementById("searchButton");
const loadingMessage    = document.getElementById("loadingMessage");
const errorMessage      = document.getElementById("errorMessage");
const hero              = document.getElementById("hero");
const statsRow          = document.getElementById("statsRow");
const forecastSection   = document.getElementById("forecastSection");
const weatherIcon       = document.getElementById("weatherIcon");
const cityName          = document.getElementById("cityName");
const temperature       = document.getElementById("temperature");
const description       = document.getElementById("description");
const humidity          = document.getElementById("humidity");
const windSpeed         = document.getElementById("windSpeed");
const uvIndex           = document.getElementById("uvIndex");
const forecastContainer = document.getElementById("forecastContainer");

searchButton.addEventListener("click", findWeather);
cityInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") findWeather();
});

// Handles the weather search when the user enters a city name
async function findWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  showLoading("Loading...");
  clearError();
  setVisible(false);

  try {
    const location    = await getCityCoordinates(city);
    const weatherData = await getWeatherData(location.latitude, location.longitude);
    displayCurrentWeather(weatherData, location.name, location.country);
    displayForecast(weatherData.daily);
    setVisible(true);
    loadingMessage.textContent = "";
  } catch (err) {
    showError("City not found. Please try another city.");
    loadingMessage.textContent = "";
  }
}

// Fetches latitude and longitude for the inputted city name
async function getCityCoordinates(city) {
  const url      = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1&language=en&format=json";
  const response = await fetch(url);
  const data     = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }
  return data.results[0];
}

// Fetches current weather and a 5-day forecast using coordinates returned from getCityCoordinates
async function getWeatherData(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + lat +
    "&longitude=" + lon +
    "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature" +
    "&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max" +
    "&timezone=auto";
  const response = await fetch(url);
  const data     = await response.json();
  return data;
}

// Displays current weather data — city name, temperature, description, humidity, wind speed and UV index
function displayCurrentWeather(data, city, country) {
  const current = data.current;
  const info    = getWeatherDescription(current.weather_code);
  const feels   = Math.round(current.apparent_temperature);
  const uv      = data.daily.uv_index_max ? data.daily.uv_index_max[0] : null;

  weatherIcon.textContent = info.icon;
  cityName.textContent    = city + ", " + country;
  temperature.textContent = Math.round(current.temperature_2m) + "°C";
  description.textContent = info.description + " · Feels like " + feels + "°C";
  humidity.textContent    = current.relative_humidity_2m + "%";
  windSpeed.textContent   = current.wind_speed_10m + " km/h";
  uvIndex.textContent     = uv !== null ? getUVLabel(uv) : "N/A";
}

// Shows a 5-day forecast list showing day name, weather icon, and high/low temperatures
function displayForecast(daily) {
  forecastContainer.innerHTML = "";

  for (var i = 0; i < 5; i++) {
    var date    = new Date(daily.time[i] + "T00:00:00");
    var dayName = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "long" });
    var info    = getWeatherDescription(daily.weather_code[i]);
    var high    = Math.round(daily.temperature_2m_max[i]);
    var low     = Math.round(daily.temperature_2m_min[i]);

    var li = document.createElement("li");

    var timeEl = document.createElement("time");
    timeEl.dateTime    = daily.time[i];
    timeEl.textContent = dayName;

    var iconEl = document.createElement("span");
    iconEl.className = "icon";
    iconEl.setAttribute("aria-hidden", "true");
    iconEl.textContent = info.icon;

    var tempsEl = document.createElement("p");
    var strong  = document.createElement("strong");
    var small   = document.createElement("small");
    strong.textContent = high + "°";
    small.textContent  = low + "°";
    tempsEl.appendChild(strong);
    tempsEl.appendChild(small);

    li.appendChild(timeEl);
    li.appendChild(iconEl);
    li.appendChild(tempsEl);
    forecastContainer.appendChild(li);
  }
}

// Maps the WMO weather code to a readable description and matching emoji icon
function getWeatherDescription(code) {
  if (code === 0)                 return { description: "Sunny",         icon: "🌤" };
  if (code <= 3)                  return { description: "Partly cloudy", icon: "⛅" };
  if (code === 45 || code === 48) return { description: "Foggy",         icon: "🌫" };
  if (code >= 51 && code <= 55)   return { description: "Drizzle",       icon: "🌦" };
  if (code >= 61 && code <= 65)   return { description: "Rain",          icon: "🌧" };
  if (code >= 71 && code <= 75)   return { description: "Snow",          icon: "❄" };
  if (code >= 80 && code <= 82)   return { description: "Rain showers",  icon: "🌦" };
  if (code === 95)                return { description: "Thunderstorm",  icon: "⛈" };
  return { description: "Unknown", icon: "~" };
}

// Converts a numeric UV index value into a plain-language risk label
function getUVLabel(uv) {
  if (uv < 3)  return "Low";
  if (uv < 6)  return "Moderate";
  if (uv < 8)  return "High";
  if (uv < 11) return "Very High";
  return "Extreme";
}

// Toggles visibility of the hero, stats, and forecast sections
function setVisible(on) {
  hero.classList.toggle("visible", on);
  statsRow.classList.toggle("visible", on);
  forecastSection.classList.toggle("visible", on);
}

// Displays an error message in the error paragraph
function showError(msg) { errorMessage.textContent = msg; }

// Clears any existing error message
function clearError() { errorMessage.textContent = ""; }

// Displays a loading message while data is being fetched
function showLoading(m) { loadingMessage.textContent = m; }
