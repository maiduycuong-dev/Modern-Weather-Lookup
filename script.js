let currentUnit = 'C';
let currentLang = 'en';
let selectedDate = null;
let selectedHour = '12:00';
let activeTheme = 'default';
let currentCity = '';
let currentWeatherData = null;

document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    initCalendar();
    updateDateTimeDisplay();
});

function initEvents() {
    document.getElementById('searchBtn').addEventListener('click', () => {
        const city = document.getElementById('cityInput').value.trim();
        if (city) fetchWeather(city);
    });

    document.getElementById('cityInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = document.getElementById('cityInput').value.trim();
            if (city) fetchWeather(city);
        }
    });

    const settingsModal = document.getElementById('settingsModal');
    document.getElementById('settingsBtn').addEventListener('click', () => settingsModal.classList.remove('hidden'));
    document.getElementById('closeSettingsBtn').addEventListener('click', () => settingsModal.classList.add('hidden'));
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.classList.add('hidden'); });

    const historyModal = document.getElementById('historyModal');
    document.getElementById('historyModalBtn').addEventListener('click', () => historyModal.classList.remove('hidden'));
    document.getElementById('closeHistoryBtn').addEventListener('click', () => historyModal.classList.add('hidden'));
    historyModal.addEventListener('click', (e) => { if (e.target === historyModal) historyModal.classList.add('hidden'); });

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeTheme = e.target.dataset.theme;
            document.body.className = `theme-${activeTheme}`;
        });
    });

    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentUnit = e.target.dataset.unit;
            document.getElementById('unitSymbol').innerText = currentUnit === 'K' ? 'K' : `°${currentUnit}`;
            if (currentWeatherData) displayWeatherData(currentWeatherData);
        });
    });

    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            applyFont(e.target.dataset.font);
        });
    });

    const glassSlider = document.getElementById('glassSlider');
    if (glassSlider) {
        glassSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            const card = document.getElementById('weatherCard');
            card.style.backdropFilter = `blur(${val}px)`;
            card.style.webkitBackdropFilter = `blur(${val}px)`;
        });
    }
}

function applyFont(fontKey) {
    let fontFamily = "'Segoe UI', sans-serif";
    if (fontKey === 'inter') fontFamily = "'Inter', sans-serif";
    else if (fontKey === 'roboto') fontFamily = "'Roboto', sans-serif";
    else if (fontKey === 'lato') fontFamily = "'Lato', sans-serif";
    else if (fontKey === 'outfit') fontFamily = "'Outfit', sans-serif";
    else if (fontKey === 'quicksand') fontFamily = "'Quicksand', sans-serif";
    document.documentElement.style.setProperty('--current-font', fontFamily);
}

async function fetchWeather(city) {
    currentCity = city;
    showLoading(true);
    hideError();

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            showError("Không tìm thấy thành phố này!");
            showLoading(false);
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        document.getElementById('cityName').innerText = `${name}, ${country}`;

        let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;

        if (selectedDate) {
            weatherUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${selectedDate}&end_date=${selectedDate}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
        }

        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        currentWeatherData = weatherData;
        displayWeatherData(weatherData);
        showLoading(false);
        document.getElementById('weatherResult').classList.remove('hidden');

    } catch (err) {
        console.error(err);
        showError("Đã xảy ra lỗi khi tải dữ liệu thời tiết!");
        showLoading(false);
    }
}

function displayWeatherData(data) {
    let tempCelsius, humidity, windSpeed;

    if (selectedDate && data.hourly) {
        const hourIndex = parseInt(selectedHour.split(':')[0]);
        tempCelsius = data.hourly.temperature_2m[hourIndex];
        humidity = data.hourly.relative_humidity_2m[hourIndex];
        windSpeed = data.hourly.wind_speed_10m[hourIndex];
    } else if (data.current) {
        tempCelsius = data.current.temperature_2m;
        humidity = data.current.relative_humidity_2m;
        windSpeed = data.current.wind_speed_10m;
    }

    let finalTemp = tempCelsius;
    if (currentUnit === 'F') finalTemp = (tempCelsius * 9/5) + 32;
    else if (currentUnit === 'K') finalTemp = tempCelsius + 273.15;

    document.getElementById('temp').innerText = Math.round(finalTemp);
    document.getElementById('humidity').innerText = humidity ?? '--';
    document.getElementById('wind').innerText = windSpeed ?? '--';
    document.getElementById('uvIndex').innerText = "3.2";
}

function showLoading(isLoading) {
    const el = document.getElementById('loadingMsg');
    isLoading ? el.classList.remove('hidden') : el.classList.add('hidden');
}

function showError(msg) {
    const el = document.getElementById('errorMsg');
    el.innerText = msg;
    el.classList.remove('hidden');
}

function hideError() {
    document.getElementById('errorMsg').classList.add('hidden');
}

function updateDateTimeDisplay() {
    const now = new Date();
    document.getElementById('localTime').innerText = now.toLocaleDateString('vi-VN', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
}

function initCalendar() {
    const calGrid = document.getElementById('calGrid');
    const monthYearLabel = document.getElementById('calMonthYear');
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();

    function renderCalendar() {
        calGrid.innerHTML = '';
        const firstDay = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthYearLabel.innerText = `${monthNames[month]} ${year}`;

        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            calGrid.appendChild(document.createElement('div'));
        }

        for (let d = 1; d <= lastDay; d++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'cal-day';
            dayCell.innerText = d;
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            dayCell.addEventListener('click', () => {
                selectedDate = dateStr;
                document.getElementById('historyModalBtn').innerText = `📅 ${dateStr}`;
                document.getElementById('historyModal').classList.add('hidden');
                document.getElementById('hourSelectorBox').classList.remove('hidden');
                renderHourGrid();
                if (currentCity) fetchWeather(currentCity);
            });

            calGrid.appendChild(dayCell);
        }
    }

    document.getElementById('prevMonthBtn').addEventListener('click', () => {
        month--;
        if (month < 0) { month = 11; year--; }
        renderCalendar();
    });

    document.getElementById('nextMonthBtn').addEventListener('click', () => {
        month++;
        if (month > 11) { month = 0; year++; }
        renderCalendar();
    });

    document.getElementById('calTodayBtn').addEventListener('click', () => {
        selectedDate = null;
        document.getElementById('historyModalBtn').innerText = `📅 Today`;
        document.getElementById('historyModal').classList.add('hidden');
        document.getElementById('hourSelectorBox').classList.add('hidden');
        if (currentCity) fetchWeather(currentCity);
    });

    renderCalendar();
}

function renderHourGrid() {
    const hourGrid = document.getElementById('hourGrid');
    hourGrid.innerHTML = '';

    for (let h = 0; h < 24; h++) {
        const hourStr = `${String(h).padStart(2, '0')}:00`;
        const cell = document.createElement('div');
        cell.className = 'hour-cell';
        if (hourStr === selectedHour) cell.className += ' active';
        cell.innerText = hourStr;

        cell.addEventListener('click', () => {
            document.querySelectorAll('.hour-cell').forEach(c => c.classList.remove('active'));
            cell.classList.add('active');
            selectedHour = hourStr;
            document.getElementById('selectedHourDisplay').innerText = hourStr;
            if (currentWeatherData) displayWeatherData(currentWeatherData);
        });

        hourGrid.appendChild(cell);
    }
}