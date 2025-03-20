document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("getWeatherBtn").addEventListener("click", () => {
        const city = document.getElementById("city").value.trim();

        if (city) {
            getWeather(city);
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    getWeather(null, position.coords.latitude, position.coords.longitude);
                }, () => {
                    document.getElementById("weather-result").innerHTML = "<p>Location access denied. Please enter a city.</p>";
                });
            } else {
                document.getElementById("weather-result").innerHTML = "<p>Geolocation not supported. Enter a city instead.</p>";
            }
        }
    });
});

async function getWeather(city = null, lat = null, lon = null) {
    const apiKey = "255bf8702de30c15517c737803cb2420"; // Replace with your OpenWeather API key
    let url, forecastUrl;

    if (city) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    } else if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
        return;
    }

    try {
        const weatherResponse = await fetch(url);
        const weatherData = await weatherResponse.json();

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (weatherData.cod === 200 && forecastData.cod === "200") {
            const icon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
            document.getElementById("weather-result").innerHTML = `
                <h3>${weatherData.name}, ${weatherData.sys.country}</h3>
                <img src="${icon}" alt="Weather Icon">
                <p>Temperature: ${weatherData.main.temp}°C</p>
                <p>Weather: ${weatherData.weather[0].description}</p>
                <h4>Hourly Forecast</h4>
                <div id="hourly-forecast">${getHourlyForecast(forecastData)}</div>
            `;

            changeBackground(weatherData.weather[0].main);
        } else {
            document.getElementById("weather-result").innerHTML = `<p>City not found.</p>`;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("weather-result").innerHTML = "<p>Error fetching weather data.</p>";
    }
}

// Function to generate hourly forecast
function getHourlyForecast(data) {
    let forecastHTML = "<ul>";
    for (let i = 0; i < 5; i++) { // Show next 5 hours
        const time = new Date(data.list[i].dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        forecastHTML += `<li>${time}: ${data.list[i].main.temp}°C (${data.list[i].weather[0].description})</li>`;
    }
    forecastHTML += "</ul>";
    return forecastHTML;
}

// Function to change background based on weather condition
function changeBackground(condition) {
    let bg;
    switch (condition) {
        case "Clear":
            bg = "linear-gradient(to right, #ffcc00, #ff9900)";
            break;
        case "Clouds":
            bg = "linear-gradient(to right, #d3d3d3, #a6a6a6)";
            break;
        case "Rain":
            bg = "linear-gradient(to right, #4a90e2, #1c3b70)";
            break;
        case "Thunderstorm":
            bg = "linear-gradient(to right, #000000, #434343)";
            break;
        case "Snow":
            bg = "linear-gradient(to right, #ffffff, #cce7ff)";
            break;
        default:
            bg = "linear-gradient(to right, #87CEEB, #4682B4)";
    }
    document.body.style.background = bg;
}
