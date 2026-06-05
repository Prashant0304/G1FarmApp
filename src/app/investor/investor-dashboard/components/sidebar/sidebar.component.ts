import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Input() investor: any = {};

  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
