import React, { useEffect, useState } from "react";
import { Card, Spin } from "antd";

const API_KEY = "a61eacf4322222dfde13501e1ff327db";

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => {
          setError("Không lấy được vị trí. Vui lòng cho phép truy cập vị trí!");
          setLoading(false);
        }
      );
    } else {
      setError("Trình duyệt không hỗ trợ lấy vị trí.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location) {
      const fetchWeather = async () => {
        try {
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric&lang=vi`;
          const response = await fetch(url);
          const data = await response.json();
          setWeather(data);
        } catch {
          setError("Không thể lấy dữ liệu thời tiết!");
        } finally {
          setLoading(false);
        }
      };
      fetchWeather();
    }
  }, [location]);

  if (loading) return <Spin size="small" style={{ margin: 8 }} />;
  if (error) return <Card style={{ margin: 8, borderRadius: 12 }}><span style={{ color: 'red' }}>{error}</span></Card>;
  if (!weather) return null;

  return (
    <Card style={{ margin: 8, borderRadius: 12, background: '#e0f7fa', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }} bodyStyle={{ padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="icon" style={{ width: 48, height: 48, marginRight: 12 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 18 }}>{weather.name}</div>
          <div style={{ fontSize: 16 }}>{weather.weather[0].description}</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{Math.round(weather.main.temp)}°C</div>
        </div>
      </div>
    </Card>
  );
}

export default WeatherWidget;
