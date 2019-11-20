import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  selectOption(opc: number) {
    switch (opc) {
      case 1:
        this.router.navigate(['/recomendation']);
        break;
      case 2:
        this.router.navigate(['/prediction', 'comparacion']);
        break;
    }
  }

}
