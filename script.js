let currentUnit = 'C';
let selectedDate = null;
let selectedHour = '12:00';
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

    const modal = document.getElementById('historyModal');
    document.getElementById('historyModalBtn').addEventListener('click', () => modal.classList.remove('hidden'));
    document.getElementById('closeHistoryBtn').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentUnit = e.target.dataset.unit;
            document.getElementById('unitSymbol').innerText = currentUnit === 'K' ? 'K' : `°${currentUnit}`;
            if (currentWeatherData) displayWeatherData(currentWeatherData);
        });
    });
}

async function fetchWeather(city) {
    currentCity = city;
    showLoading(true);
    hideError();

    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            showError("Không tìm thấy thành phố!");
            showLoading(false);
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        document.getElementById('cityName').innerText = `${name}, ${country}`;

        let url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;

        if (selectedDate) {
            url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${selectedDate}&end_date=${selectedDate}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
        }

        const res = await fetch(url);
        const data = await res.json();

        currentWeatherData = data;
        displayWeatherData(data);
        showLoading(false);

    } catch (err) {
        showError("Lỗi kết nối dữ liệu!");
        showLoading(false);
    }
}

function displayWeatherData(data) {
    let temp, hum, wind;

    if (selectedDate && data.hourly) {
        const idx = parseInt(selectedHour.split(':')[0]);
        temp = data.hourly.temperature_2m[idx];
        hum = data.hourly.relative_humidity_2m[idx];
        wind = data.hourly.wind_speed_10m[idx];
    } else if (data.current) {
        temp = data.current.temperature_2m;
        hum = data.current.relative_humidity_2m;
        wind = data.current.wind_speed_10m;
    }

    let finalTemp = temp;
    if (currentUnit === 'F') finalTemp = (temp * 9/5) + 32;
    else if (currentUnit === 'K') finalTemp = temp + 273.15;

    document.getElementById('temp').innerText = Math.round(finalTemp);
    document.getElementById('humidity').innerText = `${hum ?? '--'}%`;
    document.getElementById('wind').innerText = `${wind ?? '--'} m/s`;
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
    const grid = document.getElementById('calGrid');
    const label = document.getElementById('calMonthYear');
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();

    function render() {
        grid.innerHTML = '';
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        label.innerText = `${months[month]} ${year}`;

        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            grid.appendChild(document.createElement('div'));
        }

        for (let d = 1; d <= lastDate; d++) {
            const cell = document.createElement('div');
            cell.className = 'cal-day';
            cell.innerText = d;
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            cell.addEventListener('click', () => {
                selectedDate = dateStr;
                document.getElementById('historyModalBtn').innerText = `📅 ${dateStr}`;
                document.getElementById('historyModal').classList.add('hidden');
                document.getElementById('hourSelectorBox').classList.remove('hidden');
                renderHours();
                if (currentCity) fetchWeather(currentCity);
            });

            grid.appendChild(cell);
        }
    }

    document.getElementById('prevMonthBtn').addEventListener('click', () => {
        month--;
        if (month < 0) { month = 11; year--; }
        render();
    });

    document.getElementById('nextMonthBtn').addEventListener('click', () => {
        month++;
        if (month > 11) { month = 0; year++; }
        render();
    });

    document.getElementById('calTodayBtn').addEventListener('click', () => {
        selectedDate = null;
        document.getElementById('historyModalBtn').innerText = `📅 Chọn Ngày: Hôm nay`;
        document.getElementById('historyModal').classList.add('hidden');
        document.getElementById('hourSelectorBox').classList.add('hidden');
        if (currentCity) fetchWeather(currentCity);
    });

    render();
}

function renderHours() {
    const grid = document.getElementById('hourGrid');
    grid.innerHTML = '';

    for (let h = 0; h < 24; h++) {
        const hourStr = `${String(h).padStart(2, '0')}:00`;
        const cell = document.createElement('div');
        cell.className = `hour-cell ${hourStr === selectedHour ? 'active' : ''}`;
        cell.innerText = hourStr;

        cell.addEventListener('click', () => {
            document.querySelectorAll('.hour-cell').forEach(c => c.classList.remove('active'));
            cell.classList.add('active');
            selectedHour = hourStr;
            document.getElementById('selectedHourDisplay').innerText = hourStr;
            if (currentWeatherData) displayWeatherData(currentWeatherData);
        });

        grid.appendChild(cell);
    }
}