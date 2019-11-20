import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { first, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) { }

  isLoggedIn() {
    return this.afAuth.authState.pipe(first());
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.afAuth.authState.pipe(map(user => !!user), tap(isLogged => {
      if (isLogged) {
        // console.log('Esta Logeado', isLogged);
      } else {
        // console.log('No Logeado', isLogged);
        this.router.navigate(['']);
      }
    }));
  }
}
