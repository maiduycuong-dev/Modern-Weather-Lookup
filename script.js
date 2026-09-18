const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherResult = document.getElementById('weatherResult');
const errorMsg = document.getElementById('errorMsg');
const loadingMsg = document.getElementById('loadingMsg');

const cityName = document.getElementById('cityName');
const localTime = document.getElementById('localTime');
const temp = document.getElementById('temp');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');

let currentCityTimezone = null;
let clockInterval = null;

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city === '') return;
    getWeather(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

async function getWeather(city) {
    try {
        if (clockInterval) clearInterval(clockInterval);

        loadingMsg.classList.remove('hidden');
        weatherResult.classList.add('hidden');
        errorMsg.classList.add('hidden');

        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=vi&format=json`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Không tìm thấy thành phố');
        }

        const location = geoData.results[0];
        const lat = location.latitude;
        const lon = location.longitude;
        const displayName = location.name;
        currentCityTimezone = location.timezone;

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`);
        const weatherData = await weatherResponse.json();

        const weatherCode = weatherData.current.weather_code;
        const weatherText = getWeatherDescription(weatherCode);

        cityName.innerText = displayName;
        temp.innerText = Math.round(weatherData.current.temperature_2m);
        description.innerText = weatherText;
        humidity.innerText = weatherData.current.relative_humidity_2m;
        wind.innerText = weatherData.current.wind_speed_10m;

        startLocalClock(currentCityTimezone);

        loadingMsg.classList.add('hidden');
        weatherResult.classList.remove('hidden');

    } catch (error) {
        if (clockInterval) clearInterval(clockInterval);
        loadingMsg.classList.add('hidden');
        weatherResult.classList.add('hidden');
        errorMsg.classList.remove('hidden');
    }
}

function startLocalClock(timezone) {
    function update() {
        try {
            const now = new Date();
            const options = {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour12: false
            };
            
            const formatter = new Intl.DateTimeFormat('vi-VN', options);
            const parts = formatter.formatToParts(now);
            
            let hour = '', minute = '', second = '', day = '', month = '', year = '';
            for (let part of parts) {
                if (part.type === 'hour') hour = part.value;
                if (part.type === 'minute') minute = part.value;
                if (part.type === 'second') second = part.value;
                if (part.type === 'day') day = part.value;
                if (part.type === 'month') month = part.value;
                if (part.type === 'year') year = part.value;
            }

            localTime.innerText = `🕒 ${hour}:${minute}:${second} - ${day}/${month}/${year}`;
        } catch (e) {
            localTime.innerText = "🕒 Không xác định được giờ";
        }
    }

    update();
    clockInterval = setInterval(update, 1000);
}

function getWeatherDescription(code) {
    if (code === 0) return "Trời quang mây tạnh ☀️";
    if (code >= 1 && code <= 3) return "Trời có mây ⛅";
    if (code >= 45 && code <= 48) return "Có sương mù 🌫️";
    if (code >= 51 && code <= 67) return "Có mưa nhỏ / mưa rào 🌧️";
    if (code >= 71 && code <= 77) return "Có tuyết rơi ❄️";
    if (code >= 95) return "Có dông bão ⛈️";
    return "Thời tiết bình thường";
}