const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherResult = document.getElementById('weatherResult');
const errorMsg = document.getElementById('errorMsg');
const loadingMsg = document.getElementById('loadingMsg');

const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const themeBtns = document.querySelectorAll('.theme-btn');
const fontBtns = document.querySelectorAll('.font-btn');
const unitBtns = document.querySelectorAll('.unit-btn');

const cityName = document.getElementById('cityName');
const localTime = document.getElementById('localTime');
const temp = document.getElementById('temp');
const unitSymbol = document.getElementById('unitSymbol');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');

let currentCityTimezone = null;
let clockInterval = null;
let currentTempC = null;
let currentUnit = 'C';

settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
});

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        document.body.className = '';
        if (theme !== 'blue') {
            document.body.classList.add(`theme-${theme}`);
        }
        localStorage.setItem('selectedTheme', theme);
    });
});

fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const fontName = btn.getAttribute('data-font');
        applyFont(fontName);
        localStorage.setItem('selectedFont', fontName);

        fontBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

unitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentUnit = btn.getAttribute('data-unit');
        localStorage.setItem('selectedUnit', currentUnit);

        unitBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (currentTempC !== null) {
            updateTemperatureDisplay();
        }
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && savedTheme !== 'blue') {
        document.body.classList.add(`theme-${savedTheme}`);
    }

    const savedFont = localStorage.getItem('selectedFont') || 'Segoe UI';
    applyFont(savedFont);
    fontBtns.forEach(btn => {
        if (btn.getAttribute('data-font') === savedFont) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const savedUnit = localStorage.getItem('selectedUnit') || 'C';
    currentUnit = savedUnit;
    unitBtns.forEach(btn => {
        if (btn.getAttribute('data-unit') === savedUnit) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
});

function applyFont(fontName) {
    document.documentElement.style.setProperty('--current-font', fontName);
    document.body.style.fontFamily = `${fontName}, sans-serif`;
}

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

        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found!');
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

        currentTempC = weatherData.current.temperature_2m;
        cityName.innerText = displayName;
        updateTemperatureDisplay();
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

function updateTemperatureDisplay() {
    if (currentUnit === 'F') {
        const tempF = (currentTempC * 9/5) + 32;
        temp.innerText = Math.round(tempF);
        unitSymbol.innerText = '°F';
    } else {
        temp.innerText = Math.round(currentTempC);
        unitSymbol.innerText = '°C';
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
            
            const formatter = new Intl.DateTimeFormat('en-US', options);
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

            localTime.innerText = `🕒 ${hour}:${minute}:${second} - ${month}/${day}/${year}`;
        } catch (e) {
            localTime.innerText = "🕒 Unable to determine the time!";
        }
    }

    update();
    clockInterval = setInterval(update, 1000);
}

function getWeatherDescription(code) {
    if (code === 0) return "Clear skies ☀️";
    if (code >= 1 && code <= 3) return "Cloudy ⛅";
    if (code >= 45 && code <= 48) return "It's foggy 🌫️";
    if (code >= 51 && code <= 67) return "Light rain / showers 🌧️";
    if (code >= 71 && code <= 77) return "It's snowing ❄️";
    if (code >= 95) return "Thunderstorms ⛈️";
    return "Normal weather";
}