const weatherInfo = document.querySelector("#weather-info");

navigator.geolocation.getCurrentPosition(success, error);

async function success(pos) {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  console.log(`위도: ${lat}, 경도: ${lon}`);

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API 응답 에러: ${response.status}`);
    }

    const { current } = await response.json();

    // WMO 날씨 해석 코드 (한국어 표현 정돈)
    const descriptions = {
      0: "맑음",
      1: "대체로 맑음",
      2: "구름 조금",
      3: "흐림",
      45: "안개",
      48: "빙무(서리 안개)",
      51: "약한 이슬비",
      53: "보통 이슬비",
      55: "강한 이슬비",
      56: "약한 동결성 이슬비",
      57: "강한 동결성 이슬비",
      61: "약한 비",
      63: "보통 비",
      65: "강한 비",
      66: "약한 어는 비",
      67: "강한 어는 비",
      71: "약한 눈",
      73: "보통 눈",
      75: "강한 눈(폭설)",
      77: "싸락눈",
      80: "약한 소나기",
      81: "보통 소나기",
      82: "강한 소나기",
      85: "약한 눈 소나기",
      86: "강한 눈 소나기",
      95: "뇌우",
      96: "약한 우박을 동반한 뇌우",
      99: "강한 우박을 동반한 뇌우",
    };

    // 혹시 모를 매핑되지 않은 코드 대비 (기본값 설정)
    const weatherDesc = descriptions[current.weather_code] ?? "정보 없음";
    const weather = `${weatherDesc} | 기온: ${current.temperature_2m}°C | 습도: ${current.relative_humidity_2m}%`;

    console.log(weather);

    if (weatherInfo) {
      weatherInfo.textContent = weather;
    }
  } catch (err) {
    console.error("날씨 정보 조회 실패:", err);
    if (weatherInfo) {
      weatherInfo.textContent = "날씨 정보를 불러오지 못했습니다.";
    }
  }
}

function error(err) {
  console.error("위치 정보 접근 실패:", err.message);
  if (weatherInfo) {
    weatherInfo.textContent =
      "위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.";
  }
}
