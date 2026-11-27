const weatherCard = document.querySelector(".weather-card");
const weatherButton = document.querySelector("#weather-button");
const weatherStatus = document.querySelector("#weather-status");
const weatherDetails = document.querySelector("#weather-details");

const weatherDescriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    56: "Light freezing drizzle",
    57: "Freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light rain showers",
    81: "Rain showers",
    82: "Heavy rain showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with light hail",
    99: "Thunderstorm with heavy hail",
};

function describeWeather(code) {
    return weatherDescriptions[code] || "Conditions unavailable";
}

function setWeatherStatus(message) {
    weatherStatus.textContent = message;
}

function getLocationErrorMessage(error) {
    if (error.code === 1) {
        return "Location access was denied. Allow location access in your browser settings, then try again.";
    }
    if (error.code === 3) {
        return "Your location request timed out. Please try again.";
    }
    return "Your location is unavailable right now. Check your device settings and try again.";
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            maximumAge: 300000,
            timeout: 10000,
        });
    });
}

async function loadLocalWeather() {
    if (!window.isSecureContext) {
        setWeatherStatus("Location access requires a secure connection. Open this page over HTTPS and try again.");
        return;
    }
    if (!navigator.geolocation) {
        setWeatherStatus("Your browser does not support location access.");
        return;
    }

    weatherButton.disabled = true;
    weatherCard.setAttribute("aria-busy", "true");
    setWeatherStatus("Finding your location...");

    try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        const query = new URLSearchParams({
            latitude: String(latitude),
            longitude: String(longitude),
            current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",
            temperature_unit: "fahrenheit",
            wind_speed_unit: "mph",
            timezone: "auto",
        });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`);
        if (!response.ok) {
            throw new Error(`Weather service returned ${response.status}`);
        }

        const data = await response.json();
        const current = data.current;
        if (
            !current ||
            !Number.isFinite(current.temperature_2m) ||
            !Number.isFinite(current.apparent_temperature) ||
            !Number.isFinite(current.wind_speed_10m) ||
            !Number.isFinite(current.weather_code)
        ) {
            throw new Error("Weather service returned incomplete current conditions");
        }

        document.querySelector("#weather-condition").textContent = describeWeather(current.weather_code);
        document.querySelector("#weather-temperature").textContent = `${Math.round(current.temperature_2m)}°F`;
        document.querySelector("#weather-apparent").textContent = `${Math.round(current.apparent_temperature)}°F`;
        document.querySelector("#weather-wind").textContent = `${Math.round(current.wind_speed_10m)} mph`;
        weatherDetails.hidden = false;
        setWeatherStatus("Current conditions for your approximate location.");
    } catch (error) {
        if (error && typeof error.code === "number") {
            setWeatherStatus(getLocationErrorMessage(error));
        } else {
            console.error("Unable to load local weather.", error);
            setWeatherStatus("Weather could not be loaded. Check your internet connection and try again.");
        }
    } finally {
        weatherButton.disabled = false;
        weatherCard.setAttribute("aria-busy", "false");
    }
}

if (weatherCard && weatherButton && weatherStatus && weatherDetails) {
    weatherButton.addEventListener("click", loadLocalWeather);
}
