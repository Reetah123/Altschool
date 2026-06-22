const cityInput         = document.getElementById("cityInput");
const searchButton      = document.getElementById("searchButton");
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
const unitToggle        = document.getElementById("unitToggle");

// save the last data so switching C/F doesnt hit the api again
let lastWeather  = null;
let lastLocation = null;
let currentUnit  = "C"; // start in celsius

searchButton.addEventListener("click", findWeather);
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") findWeather();
});

// the C / F buttons
unitToggle.addEventListener("click", (e) => {
  const button = e.target.closest("button[data-unit]");
  if (!button) return;
  const unit = button.dataset.unit;
  if (unit === currentUnit) return;
  currentUnit = unit;
  updateToggleUI();
  renderWeather(); // just redraw, no new fetch
});

// try to load local weather right away
loadLocalWeather();

// ask the browser where we are when the page opens
function loadLocalWeather() {
  if (!navigator.geolocation) {
    showError("This browser doesn't support geolocation — search for a city instead.");
    return;
  }

  // geolocation only works on localhost or https
  if (!window.isSecureContext) {
    showError("Location needs https:// or http://localhost — search for a city instead.");
    return;
  }

  showLoading("Detecting your location…");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const place       = await reverseGeocode(latitude, longitude);
        const weatherData = await getWeatherData(latitude, longitude);

        lastWeather  = weatherData;
        lastLocation = place;

        renderWeather();
        setVisible(true);
      } catch (err) {
        showError("Couldn't load weather for your location — search for a city instead.");
      } finally {
        loadingMessage.textContent = "";
      }
    },
    (error) => {
      // figure out why it failed so the message is useful
      loadingMessage.textContent = "";
      if (error.code === error.PERMISSION_DENIED) {
        showError("Location permission was blocked — search for a city instead.");
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        showError("Your location couldn't be determined — search for a city instead.");
      } else if (error.code === error.TIMEOUT) {
        showError("Location request timed out — search for a city instead.");
      }
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
  );
}

// convert coordinates back to a city name
async function reverseGeocode(lat, lon) {
  try {
    const url =
      "https://api.bigdatacloud.net/data/reverse-geocode-client" +
      "?latitude=" + lat +
      "&longitude=" + lon +
      "&localityLanguage=en";
    const response = await fetch(url);
    const data     = await response.json();
    const name     = data.city || data.locality || data.principalSubdivision || "Your location";
    return { name: name, country: data.countryName || "" };
  } catch (err) {
    return { name: "Your location", country: "" };
  }
}

// runs when you search a city
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

    lastWeather  = weatherData;
    lastLocation = { name: location.name, country: location.country };

    renderWeather();
    setVisible(true);
    loadingMessage.textContent = "";
  } catch (err) {
    showError("City not found. Please try another city.");
    loadingMessage.textContent = "";
  }
}

// city name -> lat/lon
async function getCityCoordinates(city) {
  const url      = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1&language=en&format=json";
  const response = await fetch(url);
  const data     = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }
  return data.results[0];
}

// current weather + 5 day forecast from open-meteo
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

// gets from the saved data. used by search and the C/F toggle
function renderWeather() {
  if (!lastWeather || !lastLocation) return;
  displayCurrentWeather(lastWeather, lastLocation.name, lastLocation.country);
  displayForecast(lastWeather.daily);
}

// fill in the big card at the top
function displayCurrentWeather(data, city, country) {
  const current = data.current;
  const info    = getWeatherDescription(current.weather_code);
  const feels   = Math.round(convertTemp(current.apparent_temperature));
  const uv      = data.daily.uv_index_max ? data.daily.uv_index_max[0] : null;

  weatherIcon.textContent = info.icon;
  cityName.textContent    = country ? city + ", " + country : city;
  temperature.textContent = Math.round(convertTemp(current.temperature_2m)) + unitSymbol();
  description.textContent = info.description + " · Feels like " + feels + unitSymbol();
  humidity.textContent    = current.relative_humidity_2m + "%";
  windSpeed.textContent   = current.wind_speed_10m + " km/h";
  uvIndex.textContent     = uv !== null ? getUVLabel(uv) : "N/A";
}

// build the 5 day list
function displayForecast(daily) {
  forecastContainer.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const date    = new Date(daily.time[i] + "T00:00:00");
    const dayName = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "long" });
    const info    = getWeatherDescription(daily.weather_code[i]);
    const high    = Math.round(convertTemp(daily.temperature_2m_max[i]));
    const low     = Math.round(convertTemp(daily.temperature_2m_min[i]));

    const li = document.createElement("li");

    const timeEl = document.createElement("time");
    timeEl.dateTime    = daily.time[i];
    timeEl.textContent = dayName;

    const iconEl = document.createElement("span");
    iconEl.className = "icon";
    iconEl.setAttribute("aria-hidden", "true");
    iconEl.textContent = info.icon;

    const tempsEl = document.createElement("p");
    const strong  = document.createElement("strong");
    const small   = document.createElement("small");
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

// c to f when needed
function convertTemp(celsius) {
  return currentUnit === "F" ? (celsius * 9) / 5 + 32 : celsius;
}

function unitSymbol() {
  return currentUnit === "F" ? "°F" : "°C";
}

// highlight whichever button is active
function updateToggleUI() {
  const buttons = unitToggle.querySelectorAll("button[data-unit]");
  buttons.forEach((button) => {
    const isActive = button.dataset.unit === currentUnit;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

// weather code -> text + emoji. codes are from the open-meteo docs
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

// uv number -> a word
function getUVLabel(uv) {
  if (uv < 3)  return "Low";
  if (uv < 6)  return "Moderate";
  if (uv < 8)  return "High";
  if (uv < 11) return "Very High";
  return "Extreme";
}

// show/hide the weather sections
function setVisible(on) {
  hero.classList.toggle("visible", on);
  statsRow.classList.toggle("visible", on);
  forecastSection.classList.toggle("visible", on);
}

function showError(msg) { errorMessage.textContent = msg; }
function clearError() { errorMessage.textContent = ""; }
function showLoading(m) { loadingMessage.textContent = m; }