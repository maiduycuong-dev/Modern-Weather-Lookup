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
const langBtns = document.querySelectorAll('.lang-btn');

const historyModalBtn = document.getElementById('historyModalBtn');
const historyModal = document.getElementById('historyModal');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const calGrid = document.getElementById('calGrid');
const calMonthYear = document.getElementById('calMonthYear');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const calTodayBtn = document.getElementById('calTodayBtn');
const calWeekdaysContainer = document.getElementById('calWeekdaysContainer');

const cardTitle = document.getElementById('cardTitle');
const labelTheme = document.getElementById('labelTheme');
const labelFont = document.getElementById('labelFont');
const labelUnit = document.getElementById('labelUnit');
const labelLang = document.getElementById('labelLang');
const labelHistoryTitle = document.getElementById('labelHistoryTitle');
const labelHumidity = document.getElementById('labelHumidity');
const labelWind = document.getElementById('labelWind');

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
let currentLang = 'en';
let lastWeatherCode = null;
let selectedArchiveDate = null;

let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();

const translations = {
    en: {
        title: "Check the Weather",
        searchPlaceholder: "Enter city name...",
        searchBtn: "Search",
        loading: "Loading Regional Weather Data Now...",
        error: "City Not Found or Network Error!",
        humidity: "Humidity",
        wind: "Wind",
        theme: "Background Theme",
        font: "Fonts Theme",
        unit: "Temperature Unit",
        lang: "Languages",
        historyBtnText: "📅 Select past weather date",
        historyTitle: "Select Past Date",
        today: "Today",
        weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
    },
    zh: {
        title: "查看天气",
        searchPlaceholder: "输入城市名称...",
        searchBtn: "搜索",
        loading: "正在加载区域天气数据...",
        error: "未找到城市或网络错误！",
        humidity: "湿度",
        wind: "风速",
        theme: "背景主题",
        font: "字体主题",
        unit: "温度单位",
        lang: "语言",
        historyBtnText: "📅 选择历史天气日期",
        historyTitle: "选择过去日期",
        today: "今天",
        weekdays: ["一", "二", "三", "四", "五", "六", "日"]
    },
    vi: {
        title: "Tra cứu thời tiết",
        searchPlaceholder: "Nhập tên thành phố...",
        searchBtn: "Tìm kiếm",
        loading: "Đang tải dữ liệu thời tiết khu vực...",
        error: "Không tìm thấy thành phố hoặc lỗi mạng!",
        humidity: "Độ ẩm",
        wind: "Gió",
        theme: "Chủ đề nền",
        font: "Phông chữ",
        unit: "Đơn vị nhiệt độ",
        lang: "Ngôn ngữ",
        historyBtnText: "📅 Chọn ngày xem lịch sử thời tiết",
        historyTitle: "Chọn Ngày Quá Khứ",
        today: "Hôm nay",
        weekdays: ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"]
    }
};

function initCalendar() {
    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    
    if (!selectedArchiveDate) {
        selectedArchiveDate = today.toISOString().split('T')[0];
    }
    renderCalendar();
}

function renderCalendar() {
    calGrid.innerHTML = '';
    
    const monthNames = {
        en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        zh: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        vi: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
    };

    const currentMonthList = monthNames[currentLang] || monthNames.en;
    calMonthYear.innerText = `${currentMonthList[viewMonth]} ${viewYear}`;

    const t = translations[currentLang];
    calWeekdaysContainer.innerHTML = t.weekdays.map(day => `<span>${day}</span>`).join('');

    const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevTotalDays = new Date(viewYear, viewMonth, 0).getDate();

    const todayObj = new Date();
    const todayStr = todayObj.toISOString().split('T')[0];

    const pastLimitObj = new Date();
    pastLimitObj.setDate(todayObj.getDate() - 30);

    for (let i = firstDayIndex; i > 0; i--) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('cal-day', 'inactive');
        dayCell.innerText = prevTotalDays - i + 1;
        calGrid.appendChild(dayCell);
    }

    for (let d = 1; d <= totalDays; d++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('cal-day');
        dayCell.innerText = d;

        const mStr = String(viewMonth + 1).padStart(2, '0');
        const dStr = String(d).padStart(2, '0');
        const currentCellDateStr = `${viewYear}-${mStr}-${dStr}`;

        const cellDateObj = new Date(viewYear, viewMonth, d);

        if (cellDateObj > todayObj || cellDateObj < pastLimitObj) {
            dayCell.classList.add('disabled');
        } else {
            if (currentCellDateStr === selectedArchiveDate) {
                dayCell.classList.add('selected');
            }
            if (currentCellDateStr === todayStr) {
                dayCell.classList.add('today');
            }

            dayCell.addEventListener('click', () => {
                selectedArchiveDate = currentCellDateStr;
                renderCalendar();
                historyModal.classList.add('hidden');
                
                if (cityInput.value.trim() !== '') {
                    getWeather(cityInput.value.trim(), selectedArchiveDate);
                } else {
                    historyModalBtn.innerText = `${currentLang === 'vi' ? '📅 Đã chọn: ' : (currentLang === 'zh' ? '📅 已选择: ' : '📅 Selected: ')}${selectedArchiveDate}`;
                }
            });
        }

        calGrid.appendChild(dayCell);
    }

    const totalRendered = firstDayIndex + totalDays;
    const nextDaysCount = totalRendered <= 35 ? (35 - totalRendered) : (42 - totalRendered);
    for (let i = 1; i <= nextDaysCount; i++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('cal-day', 'inactive');
        dayCell.innerText = i;
        calGrid.appendChild(dayCell);
    }
}

prevMonthBtn.addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
    }
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
    }
    renderCalendar();
});

calTodayBtn.addEventListener('click', () => {
    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    selectedArchiveDate = today.toISOString().split('T')[0];
    renderCalendar();
    historyModal.classList.add('hidden');
    if (cityInput.value.trim() !== '') {
        getWeather(cityInput.value.trim(), selectedArchiveDate);
    } else {
        historyModalBtn.innerText = translations[currentLang].historyBtnText;
    }
});

settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
});

historyModalBtn.addEventListener('click', () => {
    historyModal.classList.remove('hidden');
    renderCalendar();
});

closeHistoryBtn.addEventListener('click', () => {
    historyModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === historyModal) historyModal.classList.add('hidden');
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

langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentLang = btn.getAttribute('data-lang');
        localStorage.setItem('selectedLang', currentLang);

        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        updateLanguageUI();
        renderCalendar();
        if (lastWeatherCode !== null) {
            description.innerText = getWeatherDescription(lastWeatherCode);
        }
    });
});

window.addEventListener('DOMContentLoaded', () => {
    initCalendar();

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
    unitBtns.forEach(btn => {
        if (btn.getAttribute('data-unit') === savedUnit) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const savedLang = localStorage.getItem('selectedLang') || 'en';
    currentLang = savedLang;
    langBtns.forEach(btn => {
        if (btn.getAttribute('data-lang') === savedLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    updateLanguageUI();
});

function applyFont(fontName) {
    let fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    if (fontName === 'inter') fontFamily = "'Inter', sans-serif";
    else if (fontName === 'roboto') fontFamily = "'Roboto', sans-serif";
    else if (fontName === 'helvetica') fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
    
    document.documentElement.style.setProperty('--current-font', fontFamily);
    document.body.style.fontFamily = fontFamily;
}

function updateLanguageUI() {
    const t = translations[currentLang];
    cardTitle.innerText = t.title;
    cityInput.placeholder = t.searchPlaceholder;
    searchBtn.innerText = t.searchBtn;
    loadingMsg.innerText = t.loading;
    errorMsg.innerText = t.error;
    labelTheme.innerText = t.theme;
    labelFont.innerText = t.font;
    labelUnit.innerText = t.unit;
    labelLang.innerText = t.lang;
    labelHistoryTitle.innerText = t.historyTitle;
    labelHumidity.innerText = t.humidity;
    labelWind.innerText = t.wind;
    calTodayBtn.innerText = t.today;
    
    if (!cityInput.value.trim() && selectedArchiveDate === new Date().toISOString().split('T')[0]) {
        historyModalBtn.innerText = t.historyBtnText;
    }
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city === '') return;
    getWeather(city, selectedArchiveDate);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

async function getWeather(city, targetDate) {
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

        let weatherUrl = '';
        const todayStr = new Date().toISOString().split('T')[0];

        if (targetDate && targetDate !== todayStr) {
            weatherUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${targetDate}&end_date=${targetDate}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
        } else {
            weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
        }

        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (targetDate && targetDate !== todayStr) {
            const idx = 12; 
            currentTempC = weatherData.hourly.temperature_2m[idx];
            humidity.innerText = weatherData.hourly.relative_humidity_2m[idx];
            wind.innerText = weatherData.hourly.wind_speed_10m[idx];
            lastWeatherCode = weatherData.hourly.weather_code[idx];
            localTime.innerText = `Archive: ${targetDate}`;
        } else {
            currentTempC = weatherData.current.temperature_2m;
            humidity.innerText = weatherData.current.relative_humidity_2m;
            wind.innerText = weatherData.current.wind_speed_10m;
            lastWeatherCode = weatherData.current.weather_code;
            startLocalClock(currentCityTimezone);
        }

        cityName.innerText = displayName;
        updateTemperatureDisplay();
        description.innerText = getWeatherDescription(lastWeatherCode);

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
            localTime.innerText = `${hour}:${minute}:${second} - ${month}/${day}/${year}`;
        } catch (e) {
            localTime.innerText = "Unable To Determine The Time!";
        }
    }
    update();
    clockInterval = setInterval(update, 1000);
}

function getWeatherDescription(code) {
    const descMap = {
        en: { clear: "Clear Skies", cloudy: "Cloudy", foggy: "Foggy", rain: "Light Rain or Showers", snow: "Snowing", storm: "Thunderstorms", normal: "Normal Weather" },
        zh: { clear: "晴朗", cloudy: "多云", foggy: "有雾", rain: "小雨或阵雨", snow: "下雪", storm: "雷阵雨", normal: "正常天气" },
        vi: { clear: "Trời quang đãng", cloudy: "Có mây", foggy: "Sương mù", rain: "Mưa phùn hoặc mưa rào", snow: "Tuyết rơi", storm: "Dông bão", normal: "Thời tiết bình thường" }
    };

    const langDict = descMap[currentLang] || descMap.en;
    if (code === 0) return langDict.clear;
    if (code >= 1 && code <= 3) return langDict.cloudy;
    if (code >= 45 && code <= 48) return langDict.foggy;
    if (code >= 51 && code <= 67) return langDict.rain;
    if (code >= 71 && code <= 77) return langDict.snow;
    if (code >= 95) return langDict.storm;
    return langDict.normal;
}