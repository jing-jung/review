// --- HTML 요소 선택하기 ---
const apiKeyInput = document.getElementById('apiKeyInput');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const controlsSection = document.getElementById('controls');

const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');
const weatherDataContainer = document.getElementById('weatherData');

// 좌측 열 요소
const cityNameEl = document.getElementById('cityName');
const weatherIconEl = document.getElementById('weatherIcon');
const temperatureValueEl = document.getElementById('temperatureValue');
const weatherDescriptionEl = document.getElementById('weatherDescription');

// 우측 열 상세 정보 요소
const feelsLikeEl = document.getElementById('feelsLike');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');

// --- 날씨 가져오기 버튼 클릭 이벤트 설정 ---
getWeatherBtn.addEventListener('click', () => {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    showError('API Key를 입력해주세요.');
    return;
  }

  showLoading();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        fetchWeatherData(latitude, longitude, apiKey);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          showError('위치 정보 접근 권한이 거부되었습니다.');
        } else {
          showError('위치 정보를 가져올 수 없습니다.');
        }
      }
    );
  } else {
    showError('이 브라우저에서는 위치 정보(Geolocation)를 지원하지 않습니다.');
  }
});

// --- OpenWeather API 호출 함수 (비동기 함수) ---
async function fetchWeatherData(lat, lon, apiKey) {
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('유효하지 않은 API Key입니다.');
      } else {
        throw new Error('날씨 데이터를 불러오는데 실패했습니다.');
      }
    }

    const data = await response.json();
    updateWeatherUI(data);

  } catch (error) {
    showError(error.message);
  }
}

// --- 화면(UI) 업데이트 함수 ---
function updateWeatherUI(data) {
  loadingMessage.classList.add('hidden');
  errorMessage.classList.add('hidden');
  weatherDataContainer.classList.remove('hidden');

  // 날씨 데이터를 성공적으로 가져왔으므로 API 입력창 영역 숨기기
  controlsSection.classList.add('hidden');

  // 1. 좌측 열 업데이트 (기본 정보)
  cityNameEl.textContent = data.name; 
  temperatureValueEl.textContent = Math.round(data.main.temp);
  weatherDescriptionEl.textContent = data.weather[0].description;

  const iconCode = data.weather[0].icon;
  weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  weatherIconEl.alt = data.weather[0].description;

  // 2. 우측 열 업데이트 (상세 정보)
  // 체감 온도 (소수점 반올림)
  feelsLikeEl.textContent = Math.round(data.main.feels_like);
  // 습도 (%)
  humidityEl.textContent = data.main.humidity;
  // 풍속 (m/s, 소수점 첫째자리까지 표시)
  windSpeedEl.textContent = data.wind.speed.toFixed(1);
}

// --- 로딩 상태 표시 보조 함수 ---
function showLoading() {
  weatherDataContainer.classList.add('hidden');
  errorMessage.classList.add('hidden');
  loadingMessage.classList.remove('hidden');
}

// --- 에러 상태 표시 보조 함수 ---
function showError(message) {
  weatherDataContainer.classList.add('hidden');
  loadingMessage.classList.add('hidden');
  
  // 에러 발생 시 다시 입력할 수 있도록 입력창 영역 보이기
  controlsSection.classList.remove('hidden');
  
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}