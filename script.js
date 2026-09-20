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

const cardTitle = document.getElementById('cardTitle');
const labelTheme = document.getElementById('labelTheme');
const labelFont = document.getElementById('labelFont');
const labelUnit = document.getElementById('labelUnit');
const labelLang = document.getElementById('labelLang');
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
        lang: "Languages"
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
        lang: "语言"
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
        lang: "Ngôn ngữ"
    }
};

settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
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
        if (lastWeatherCode !== null) {
            description.innerText = getWeatherDescription(lastWeatherCode);
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
    
    if (fontName === 'inter') {
        fontFamily = "'Inter', sans-serif";
    } else if (fontName === 'roboto') {
        fontFamily = "'Roboto', sans-serif";
    } else if (fontName === 'helvetica') {
        fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
    } else if (fontName === 'segoe') {
        fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    }

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
    labelHumidity.innerText = t.humidity;
    labelWind.innerText = t.wind;
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

        lastWeatherCode = weatherData.current.weather_code;
        const weatherText = getWeatherDescription(lastWeatherCode);

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
        en: {
            clear: "Clear Skies",
            cloudy: "Cloudy",
            foggy: "Foggy",
            rain: "Light Rain or Showers",
            snow: "Snowing",
            storm: "Thunderstorms",
            normal: "Normal Weather"
        },
        zh: {
            clear: "晴朗",
            cloudy: "多云",
            foggy: "有雾",
            rain: "小雨或阵雨",
            snow: "下雪",
            storm: "雷阵雨",
            normal: "正常天气"
        },
        vi: {
            clear: "Trời quang đãng",
            cloudy: "Có mây",
            foggy: "Sương mù",
            rain: "Mưa phùn hoặc mưa rào",
            snow: "Tuyết rơi",
            storm: "Dông bão",
            normal: "Thời tiết bình thường"
        }
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