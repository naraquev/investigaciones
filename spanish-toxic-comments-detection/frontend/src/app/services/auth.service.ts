import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
  ) {}

  public getUser(): Observable<firebase.User>{
    return this.afAuth.user;
  }

  public logIn(): void{
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  public logOut(): void {
    this.afAuth.auth.signOut();
  }

  public isLogged():Observable<firebase.User> {
    return this.afAuth.user;
  }

}
