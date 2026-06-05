import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private apiKey = '72b80dafdb62d2f5c90abdd578f17d33';

  constructor(private http: HttpClient) {}

  getWeather(lat: number, lon: number) {
    return this.http.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`,
    );
  }
}
