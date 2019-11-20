import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { WindowSize } from '../services/utilities/window-size';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  public user: any;
  isMobile$: Observable<boolean>;
  navbarOpen = false;

  constructor(
    private authService: AuthService,
    private windowSize: WindowSize,
    private router: Router,
  ) { }

  ngOnInit() {
    this.isMobile$ = this.windowSize.isMobileObservable;
    this.isMobile$.subscribe(val => console.log(val))
    this.authService.isLogged().subscribe(res => {
      this.user = res;
    });
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  public logIn(): void{
    this.authService.logIn();
  }

  public logOut():void{
    this.authService.logOut();
    this.router.navigate(['/']);
  }

}
