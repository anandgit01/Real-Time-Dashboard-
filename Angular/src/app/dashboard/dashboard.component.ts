import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  socket: any;
  dashboardData: any[] = [];

  ngOnInit(): void {
    this.socket = io('http://localhost:3000');
    this.socket.on('dataUpdate', (data: any) => {
      this.updateDashboard(data);
    });
  }

  updateDashboard(data: any): void {
    const existingData = this.dashboardData.find(d => d.id === data.id);
    if (existingData) {
      // Update existing data
      existingData.value = data.value;
    } else {
      // Add new data
      this.dashboardData.push(data);
    }
  }
}
