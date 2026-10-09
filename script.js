const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const message = document.getElementById("message");
const weatherSection = document.getElementById("weather");

const weatherDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm"
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  message.textContent = "Loading weather...";
  weatherSection.hidden = true;

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error("Could not search for this city.");

    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) {
      showError("City not found. Check the spelling and try again.");
      return;
    }

    const place = geoData.results[0];
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error("Could not get weather information.");

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    document.getElementById("city-name").textContent =
      `${place.name}${place.country ? ", " + place.country : ""}`;
    document.getElementById("temperature").textContent =
      `${Math.round(current.temperature_2m)}°C`;
    document.getElementById("description").textContent =
      weatherDescriptions[current.weather_code] || "Current conditions";
    document.getElementById("details").textContent =
      `Feels like ${Math.round(current.apparent_temperature)}°C · Humidity ${current.relative_humidity_2m}% · Wind ${current.wind_speed_10m} km/h`;

    message.textContent = "";
    weatherSection.hidden = false;
  } catch (error) {
    showError("Unable to load weather right now. Check your internet connection and try again.");
  }
});

function showError(text) {
  message.textContent = text;
}
