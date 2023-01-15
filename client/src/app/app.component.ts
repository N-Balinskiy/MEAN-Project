import { Component, OnInit } from '@angular/core';
import { AuthService } from './authentication/services/auth.service';

@Component({
  selector: 'mean-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.autoAuthUser();
  }
}
