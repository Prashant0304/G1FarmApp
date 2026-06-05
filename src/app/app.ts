import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FarmApp');
  isLoading = true;
  ngOnInit() {
  setTimeout(() => this.isLoading = false, 1800);
}
}
