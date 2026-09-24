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
const glassSlider = document.getElementById('glassSlider');
const weatherCard = document.getElementById('weatherCard');

const historyModalBtn = document.getElementById('historyModalBtn');
const historyModal = document.getElementById('historyModal');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const calGrid = document.getElementById('calGrid');
const calMonthYear = document.getElementById('calMonthYear');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const calTodayBtn = document.getElementById('calTodayBtn');
const calWeekdaysContainer = document.getElementById('calWeekdaysContainer');

const hourSelectorBox = document.getElementById('hourSelectorBox');
const hourGrid = document.getElementById('hourGrid');
const selectedHourDisplay = document.getElementById('selectedHourDisplay');
const labelHourSelect = document.getElementById('labelHourSelect');

const cardTitle = document.getElementById('cardTitle');
const labelTheme = document.getElementById('labelTheme');
const labelGlass = document.getElementById('labelGlass');
const labelFont = document.getElementById('labelFont');
const labelUnit = document.getElementById('labelUnit');
const labelLang = document.getElementById('labelLang');
const labelHistoryTitle = document.getElementById('labelHistoryTitle');
const labelHumidity = document.getElementById('labelHumidity');
const labelWind = document.getElementById('labelWind');
const labelUV = document.getElementById('labelUV');

const cityName = document.getElementById('cityName');
const localTime = document.getElementById('localTime');
const temp = document.getElementById('temp');
const unitSymbol = document.getElementById('unitSymbol');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const uvIndex = document.getElementById('uvIndex');

let currentCityTimezone = null;
let clockInterval = null;
let currentTempC = null;
let currentUnit = 'C';
let currentLang = 'en';
let lastWeatherCode = null;
let selectedArchiveDate = new Date().toISOString().split('T')[0];
let selectedHourValue = new Date().getHours();

let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();

let currentLat = null;
let currentLon = null;
let currentWeatherData = null;
let isArchiveMode = false;

const i18n = {
    en: {
        title: "Check the Weather",
        searchPlaceholder: "Enter city name...",
        searchBtn: "Search",
        loading: "Loading weather data...",
        error: "City not found or network error!",
        humidity: "Humidity",
        wind: "Wind",
        uv: "UV Index",
        theme: "Background Theme",
        glass: "Glass Effect (Blur & Opacity)",
        font: "Fonts Theme",
        unit: "Temperature Unit",
        lang: "Languages",
        historyTitle: "Select Date",
        today: "Today",
        selectHour: "Select Hour:",
        weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    zh: {
        title: "查看天气",
        searchPlaceholder: "输入城市名称...",
        searchBtn: "搜索",
        loading: "正在加载天气数据...",
        error: "未找到城市或网络错误！",
        humidity: "湿度",
        wind: "风速",
        uv: "紫外线指数",
        theme: "背景主题",
        glass: "玻璃效果",
        font: "字体主题",
        unit: "温度单位",
        lang: "语言",
        historyTitle: "选择日期",
        today: "今天",
        selectHour: "选择时间:",
        weekdays: ["一", "二", "三", "四", "五", "六", "日"],
        months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
    },
    vi: {
        title: "Tra cứu thời tiết",
        searchPlaceholder: "Nhập tên thành phố...",
        searchBtn: "Tìm kiếm",
        loading: "Đang tải dữ liệu thời tiết...",
        error: "Không tìm thấy thành phố hoặc lỗi mạng!",
        humidity: "Độ ẩm",
        wind: "Gió",
        uv: "Tia UV",
        theme: "Chủ đề nền",
        glass: "Hiệu ứng kính mờ",
        font: "Phông chữ",
        unit: "Đơn vị nhiệt độ",
        lang: "Ngôn ngữ",
        historyTitle: "Chọn Ngày",
        today: "Hôm nay",
        selectHour: "Chọn giờ:",
        weekdays: ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"],
        months: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
    },
    fr: {
        title: "Vérifier la météo",
        searchPlaceholder: "Entrez le nom de la ville...",
        searchBtn: "Chercher",
        loading: "Chargement des données...",
        error: "Ville introuvable ou erreur réseau !",
        humidity: "Humidité",
        wind: "Vent",
        uv: "Indice UV",
        theme: "Thème d'arrière-plan",
        glass: "Effet Verre",
        font: "Police",
        unit: "Unité de température",
        lang: "Langues",
        historyTitle: "Sélectionner la date",
        today: "Aujourd'hui",
        selectHour: "Sélectionner l'heure:",
        weekdays: ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"],
        months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    },
    de: {
        title: "Wetter prüfen",
        searchPlaceholder: "Stadtnamen eingeben...",
        searchBtn: "Suchen",
        loading: "Lade Wetterdaten...",
        error: "Stadt nicht gefunden oder Netzwerkfehler!",
        humidity: "Luftfeuchtigkeit",
        wind: "Wind",
        uv: "UV-Index",
        theme: "Hintergrundthema",
        glass: "Glas-Effekt",
        font: "Schriftart",
        unit: "Temperatureinheit",
        lang: "Sprachen",
        historyTitle: "Datum auswählen",
        today: "Heute",
        selectHour: "Stunde wählen:",
        weekdays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
        months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
    },
    ru: {
        title: "Проверить погоду",
        searchPlaceholder: "Введите название города...",
        searchBtn: "Поиск",
        loading: "Загрузка данных о погоде...",
        error: "Город не найден или ошибка сети!",
        humidity: "Влажность",
        wind: "Ветер",
        uv: "Индекс УФ",
        theme: "Тема фона",
        glass: "Эффект стекла",
        font: "Шрифт",
        unit: "Единица измерения",
        lang: "Языки",
        historyTitle: "Выбрать дату",
        today: "Сегодня",
        selectHour: "Выбрать час:",
        weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
        months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
    },
    ja: {
        title: "天気予報を確認",
        searchPlaceholder: "都市名を入力...",
        searchBtn: "検索",
        loading: "天気データを読み込み中...",
        error: "都市が見つからないか、ネットワークエラーです！",
        humidity: "湿度",
        wind: "風速",
        uv: "紫外線指数",
        theme: "背景テーマ",
        glass: "グラス効果",
        font: "フォントテーマ",
        unit: "温度単位",
        lang: "言語",
        historyTitle: "日付を選択",
        today: "今日",
        selectHour: "時間を選択:",
        weekdays: ["月", "火", "水", "木", "金", "土", "日"],
        months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    },
    ko: {
        title: "날씨 확인하기",
        searchPlaceholder: "도시 이름 입력...",
        searchBtn: "검색",
        loading: "날씨 데이터를 불러오는 중...",
        error: "도시를 찾을 수 없거나 네트워크 오류입니다!",
        humidity: "습도",
        wind: "바람",
        uv: "자외선 지수",
        theme: "배경 테마",
        glass: "유리 효과",
        font: "글꼴 테마",
        unit: "온도 단위",
        lang: "언어",
        historyTitle: "날씨 날짜 선택",
        today: "오늘",
        selectHour: "시간 선택:",
        weekdays: ["월", "화", "수", "목", "금", "토", "일"],
        months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
    }
};

function initHourGrid() {
    hourGrid.innerHTML = '';
    for (let i = 0; i < 24; i++) {
        const cell = document.createElement('div');
        const hourStr = String(i).padStart(2, '0') + ':00';
        cell.classList.add('hour-cell');
        cell.innerText = hourStr;
        cell.setAttribute('data-hour', i);
        
        if (i === selectedHourValue) {
            cell.classList.add('active');
        }
        
        cell.addEventListener('click', () => {
            selectedHourValue = i;
            selectedHourDisplay.innerText = hourStr;
            document.querySelectorAll('.hour-cell').forEach(c => c.classList.remove('active'));
            cell.classList.add('active');
            
            if (cityInput.value.trim() !== '' && isArchiveMode) {
                getWeather(cityInput.value.trim(), selectedArchiveDate, selectedHourValue);
            }
        });
        
        hourGrid.appendChild(cell);
    }
    selectedHourDisplay.innerText = String(selectedHourValue).padStart(2, '0') + ':00';
}

function initCalendar() {
    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    
    selectedArchiveDate = today.toISOString().split('T')[0];
    historyModalBtn.innerText = `📅 ${selectedArchiveDate}`;
    renderCalendar();
}

function renderCalendar() {
    calGrid.innerHTML = '';
    const t = i18n[currentLang] || i18n.en;

    calMonthYear.innerText = `${t.months[viewMonth]} ${viewYear}`;
    calWeekdaysContainer.innerHTML = t.weekdays.map(day => `<span>${day}</span>`).join('');

    const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevTotalDays = new Date(viewYear, viewMonth, 0).getDate();

    const todayObj = new Date();
    const todayStr = todayObj.toISOString().split('T')[0];
    
    const pastLimitObj = new Date();
    pastLimitObj.setDate(todayObj.getDate() - 60);

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
                historyModalBtn.innerText = `📅 ${selectedArchiveDate}`;
                renderCalendar();
                historyModal.classList.add('hidden');
                
                if (cityInput.value.trim() !== '') {
                    isArchiveMode = (selectedArchiveDate !== todayStr);
                    if (isArchiveMode) {
                        hourSelectorBox.classList.remove('hidden');
                    } else {
                        hourSelectorBox.classList.add('hidden');
                    }
                    getWeather(cityInput.value.trim(), selectedArchiveDate, selectedHourValue);
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
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
});

calTodayBtn.addEventListener('click', () => {
    const today = new Date();
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    selectedArchiveDate = today.toISOString().split('T')[0];
    historyModalBtn.innerText = `📅 ${selectedArchiveDate}`;
    renderCalendar();
    historyModal.classList.add('hidden');
    isArchiveMode = false;
    hourSelectorBox.classList.add('hidden');
    if (cityInput.value.trim() !== '') {
        getWeather(cityInput.value.trim(), selectedArchiveDate, 0);
    }
});

settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));
historyModalBtn.addEventListener('click', () => { historyModal.classList.remove('hidden'); renderCalendar(); });
closeHistoryBtn.addEventListener('click', () => historyModal.classList.add('hidden'));
window.addEventListener('click', (e) => { if (e.target === historyModal) historyModal.classList.add('hidden'); });

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        document.body.className = '';
        if (theme !== 'default') document.body.classList.add(`theme-${theme}`);
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        localStorage.setItem('selectedTheme', theme);
    });
});

glassSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    applyGlassEffect(val);
    localStorage.setItem('glassValue', val);
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
        
        if (currentUnit === 'K') {
            unitSymbol.innerText = ' K';
        } else {
            unitSymbol.innerText = `°${currentUnit}`;
        }

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
        if (lastWeatherCode !== null) description.innerText = getWeatherDescription(lastWeatherCode);
    });
});

window.addEventListener('DOMContentLoaded', () => {
    initCalendar();
    initHourGrid();
    
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    document.body.className = '';
    if (savedTheme !== 'default') document.body.classList.add(`theme-${savedTheme}`);
    themeBtns.forEach(b => { if (b.getAttribute('data-theme') === savedTheme) b.classList.add('active'); else b.classList.remove('active'); });

    const savedGlass = localStorage.getItem('glassValue') || '30';
    glassSlider.value = savedGlass;
    applyGlassEffect(savedGlass);

    const savedFont = localStorage.getItem('selectedFont') || 'segoe';
    applyFont(savedFont);
    fontBtns.forEach(b => { if (b.getAttribute('data-font') === savedFont) b.classList.add('active'); else b.classList.remove('active'); });

    const savedUnit = localStorage.getItem('selectedUnit') || 'C';
    currentUnit = savedUnit;
    if (currentUnit === 'K') {
        unitSymbol.innerText = ' K';
    } else {
        unitSymbol.innerText = `°${currentUnit}`;
    }
    unitBtns.forEach(b => { if (b.getAttribute('data-unit') === savedUnit) b.classList.add('active'); else b.classList.remove('active'); });

    const savedLang = localStorage.getItem('selectedLang') || 'en';
    currentLang = savedLang;
    langBtns.forEach(b => { if (b.getAttribute('data-lang') === savedLang) b.classList.add('active'); else b.classList.remove('active'); });

    updateLanguageUI();
});

function applyGlassEffect(val) {
    const opacityVal = (val / 100).toFixed(2);
    weatherCard.style.background = `rgba(255, 255, 255, ${opacityVal})`;
    weatherCard.style.backdropFilter = `blur(${val}px)`;
    weatherCard.style.webkitBackdropFilter = `blur(${val}px)`;
}

function applyFont(fontName) {
    let fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    if (fontName === 'inter') fontFamily = "'Inter', sans-serif";
    else if (fontName === 'roboto') fontFamily = "'Roboto', sans-serif";
    else if (fontName === 'aptos') fontFamily = "'Aptos', 'Segoe UI', sans-serif";
    else if (fontName === 'lato') fontFamily = "'Lato', sans-serif";
    else if (fontName === 'outfit') fontFamily = "'Outfit', sans-serif";
    else if (fontName === 'quicksand') fontFamily = "'Quicksand', sans-serif";
    else if (fontName === 'helvetica') fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
    document.documentElement.style.setProperty('--current-font', fontFamily);
    document.body.style.fontFamily = fontFamily;
}

function updateLanguageUI() {
    const t = i18n[currentLang] || i18n.en;
    cardTitle.innerText = t.title;
    cityInput.placeholder = t.searchPlaceholder;
    searchBtn.innerText = t.searchBtn;
    loadingMsg.innerText = t.loading;
    errorMsg.innerText = t.error;
    labelTheme.innerText = t.theme;
    labelGlass.innerText = t.glass;
    labelFont.innerText = t.font;
    labelUnit.innerText = t.unit;
    labelLang.innerText = t.lang;
    labelHistoryTitle.innerText = t.historyTitle;
    labelHumidity.innerText = t.humidity;
    labelWind.innerText = t.wind;
    labelUV.innerText = t.uv;
    calTodayBtn.innerText = t.today;
    labelHourSelect.innerText = t.selectHour;
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city === '') return;
    isArchiveMode = (selectedArchiveDate !== new Date().toISOString().split('T')[0]);
    if (isArchiveMode) hourSelectorBox.classList.remove('hidden');
    else hourSelectorBox.classList.add('hidden');
    getWeather(city, selectedArchiveDate, selectedHourValue);
});

cityInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchBtn.click(); });

async function getWeather(city, targetDate, selectedHour) {
    try {
        if (clockInterval) clearInterval(clockInterval);
        loadingMsg.classList.remove('hidden');
        weatherResult.classList.add('hidden');
        errorMsg.classList.add('hidden');

        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) throw new Error('City not found!');

        const location = geoData.results[0];
        currentLat = location.latitude;
        currentLon = location.longitude;
        const displayName = location.name;
        currentCityTimezone = location.timezone;

        let weatherUrl = '';
        const todayStr = new Date().toISOString().split('T')[0];
        if (targetDate && targetDate !== todayStr) {
            weatherUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${currentLat}&longitude=${currentLon}&start_date=${targetDate}&end_date=${targetDate}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,uv_index`;
        } else {
            weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${currentLat}&longitude=${currentLon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,uv_index`;
        }

        const weatherResponse = await fetch(weatherUrl);
        currentWeatherData = await weatherResponse.json();

        if (targetDate && targetDate !== todayStr) {
            const idx = selectedHour !== undefined ? selectedHour : 12;
            currentTempC = currentWeatherData.hourly.temperature_2m[idx];
            humidity.innerText = currentWeatherData.hourly.relative_humidity_2m[idx];
            wind.innerText = currentWeatherData.hourly.wind_speed_10m[idx];
            uvIndex.innerText = currentWeatherData.hourly.uv_index ? currentWeatherData.hourly.uv_index[idx] : 'N/A';
            lastWeatherCode = currentWeatherData.hourly.weather_code[idx];
            localTime.innerText = `${targetDate} - ${String(idx).padStart(2, '0')}:00`;
        } else {
            currentTempC = currentWeatherData.current.temperature_2m;
            humidity.innerText = currentWeatherData.current.relative_humidity_2m;
            wind.innerText = currentWeatherData.current.wind_speed_10m;
            uvIndex.innerText = currentWeatherData.current.uv_index !== undefined ? currentWeatherData.current.uv_index : '3.5'; 
            lastWeatherCode = currentWeatherData.current.weather_code;
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
        temp.innerText = tempF.toFixed(1);
        unitSymbol.innerText = '°F';
    } else if (currentUnit === 'K') {
        const tempK = currentTempC + 273.15;
        temp.innerText = tempK.toFixed(2);
        unitSymbol.innerText = ' K';
    } else {
        temp.innerText = Math.round(currentTempC);
        unitSymbol.innerText = '°C';
    }
}

function startLocalClock(timezone) {
    function update() {
        try {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false
            });
            const parts = formatter.formatToParts(now);
            let h = '', m = '', s = '', d = '', mo = '', y = '';
            for (let p of parts) {
                if (p.type === 'hour') h = p.value;
                if (p.type === 'minute') m = p.value;
                if (p.type === 'second') s = p.value;
                if (p.type === 'day') d = p.value;
                if (p.type === 'month') mo = p.value;
                if (p.type === 'year') y = p.value;
            }
            localTime.innerText = `${h}:${m}:${s} - ${mo}/${d}/${y}`;
        } catch (e) {
            localTime.innerText = "Time Error";
        }
    }
    update();
    clockInterval = setInterval(update, 1000);
}

function getWeatherDescription(code) {
    const descMap = {
        en: { clear: "Clear Skies", cloudy: "Cloudy", foggy: "Foggy", rain: "Light Rain", snow: "Snowing", storm: "Thunderstorms", normal: "Normal Weather" },
        zh: { clear: "晴朗", cloudy: "多云", foggy: "有雾", rain: "小雨", snow: "下雪", storm: "雷阵雨", normal: "正常天气" },
        vi: { clear: "Trời quang", cloudy: "Có mây", foggy: "Sương mù", rain: "Mưa nhẹ", snow: "Tuyết rơi", storm: "Dông bão", normal: "Thời tiết bình thường" },
        fr: { clear: "Ciel dégagé", cloudy: "Nuageux", foggy: "Brumeux", rain: "Pluie légère", snow: "Neige", storm: "Orages", normal: "Temps normal" },
        de: { clear: "Klarer Himmel", cloudy: "Wolkig", foggy: "Nebelig", rain: "Leichter Regen", snow: "Schnee", storm: "Gewitter", normal: "Normales Wetter" },
        ru: { clear: "Ясно", cloudy: "Облачно", foggy: "Туманно", rain: "Дождь", snow: "Снег", storm: "Гроза", normal: "Обычная погода" }
    };
    const langObj = descMap[currentLang] || descMap.en;
    if (code === 0) return langObj.clear;
    if (code >= 1 && code <= 3) return langObj.cloudy;
    if (code >= 45 && code <= 48) return langObj.foggy;
    if (code >= 51 && code <= 67) return langObj.rain;
    if (code >= 71 && code <= 77) return langObj.snow;
    if (code >= 95) return langObj.storm;
    return langObj.normal;
}