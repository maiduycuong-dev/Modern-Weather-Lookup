const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const dashboardGrid = document.getElementById('dashboardGrid');
const errorMsg = document.getElementById('errorMsg');
const loadingMsg = document.getElementById('loadingMsg');

const settingsBtn = document.getElementById('settingsBtn');
const settingsWidget = document.getElementById('settingsWidget');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');

const themeBtns = document.querySelectorAll('.theme-btn');
const fontBtns = document.querySelectorAll('.font-btn');
const unitBtns = document.querySelectorAll('.unit-btn');

const cityName = document.getElementById('cityName');
const localTime = document.getElementById('localTime');
const tempElem = document.getElementById('temp');
const unitSymbol = document.getElementById('unitSymbol');
const description = document.getElementById('description');
const humidityElem = document.getElementById('humidity');
const windElem = document.getElementById('wind');

let clockInterval = null;
let currentTempC = null;
let currentUnit = 'C';
let lastWeatherCode = null;

settingsBtn.addEventListener('click', () => {
    settingsWidget.classList.toggle('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsWidget.classList.add('hidden');
});

settingsWidget.addEventListener('click', (e) => {
    if (e.target === settingsWidget) {
        settingsWidget.classList.add('hidden');
    }
});

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        document.body.className = '';
        if (theme !== 'default') {
            document.body.classList.add(`theme-${theme}`);
        }
        localStorage.setItem('selectedTheme', theme);
    });
});

fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const fontName = btn.getAttribute('data-font');
        localStorage.setItem('selectedFont', fontName);

        fontBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        applyFont(fontName);
    });
});

unitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentUnit = btn.getAttribute('data-unit');
        localStorage.setItem('selectedUnit', currentUnit);

        unitBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (currentUnit === 'K') {
            unitSymbol.innerText = ` K`;
        } else {
            unitSymbol.innerText = `°${currentUnit}`;
        }

        if (currentTempC !== null) {
            updateTemperatureDisplay();
        }
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && savedTheme !== 'default') {
        document.body.classList.add(`theme-${savedTheme}`);
    }

    const savedFont = localStorage.getItem('selectedFont') || 'segoe';
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
    if (currentUnit === 'K') {
        unitSymbol.innerText = ` K`;
    } else {
        unitSymbol.innerText = `°${currentUnit}`;
    }
    unitBtns.forEach(btn => {
        if (btn.getAttribute('data-unit') === savedUnit) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
});

function applyFont(fontName) {
    let fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    if (fontName === 'inter') {
        fontFamily = "'Inter', sans-serif";
    } else if (fontName === 'roboto') {
        fontFamily = "'Roboto', sans-serif";
    }
    document.body.style.fontFamily = fontFamily;
}

searchBtn.addEventListener('click', fetchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchWeather();
});

async function fetchWeather() {
    const city = cityInput.value.trim();
    if (city === '') return;

    loadingMsg.classList.remove('hidden');
    errorMsg.classList.add('hidden');
    dashboardGrid.classList.add('hidden');

    try {
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=vi&format=json`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found");
        }

        const { latitude: lat, longitude: lon, name, country, timezone } = geoData.results[0];
        const displayName = `${name}, ${country || ''}`;

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=${timezone}`);
        const weatherData = await weatherResponse.json();

        lastWeatherCode = weatherData.current.weather_code;
        currentTempC = weatherData.current.temperature_2m;

        cityName.innerText = displayName;
        humidityElem.innerText = weatherData.current.relative_humidity_2m;
        windElem.innerText = weatherData.current.wind_speed_10m;
        description.innerText = getWeatherDescription(lastWeatherCode);

        updateTemperatureDisplay();

        if (clockInterval) clearInterval(clockInterval);
        updateLocalTime(timezone);
        clockInterval = setInterval(() => updateLocalTime(timezone), 1000);

        loadingMsg.classList.add('hidden');
        dashboardGrid.classList.remove('hidden');

    } catch (err) {
        loadingMsg.classList.add('hidden');
        errorMsg.classList.remove('hidden');
        console.error(err);
    }
}

function updateTemperatureDisplay() {
    if (currentUnit === 'F') {
        const tempF = (currentTempC * 9/5) + 32;
        tempElem.innerText = tempF.toFixed(1);
    } else if (currentUnit === 'K') {
        const tempK = currentTempC + 273.15;
        tempElem.innerText = tempK.toFixed(2);
    } else {
        tempElem.innerText = currentTempC;
    }
}

function updateLocalTime(timezone) {
    try {
        const options = { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formatter = new Intl.DateTimeFormat('vi-VN', options);
        localTime.innerText = formatter.format(new Date());
    } catch (e) {
        localTime.innerText = new Date().toLocaleString('vi-VN');
    }
}

function getWeatherDescription(code) {
    if (code === 0) return "Trời quang đãng";
    if (code >= 1 && code <= 3) return "Có mây rải rác";
    if (code >= 45 && code <= 48) return "Sương mù";
    if (code >= 51 && code <= 67) return "Mưa phùn hoặc mưa rào";
    if (code >= 71 && code <= 77) return "Tuyết rơi";
    if (code >= 95) return "Dông bão";
    return "Thời tiết bình thường";
}