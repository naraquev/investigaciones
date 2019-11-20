import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//firebase
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { EntityFirebaseProvider } from 'aether-blaze';

//components
import { CalificationComponent } from './calification/calification.component';
import { ExtractComponent } from './extract/extract.component';
import { ResultsComponent } from './results/results.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { WindowSize } from './services/utilities/window-size';
import { FilterPipe } from './services/pipes/filter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    CalificationComponent,
    ExtractComponent,
    ResultsComponent,
    PrivacyPolicyComponent,
    NavbarComponent,
    HomeComponent,
    FilterPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ClarityModule,
    BrowserAnimationsModule,
  ],
  providers: [
    WindowSize
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    const app = firebase.initializeApp(environment.firebase);
    new EntityFirebaseProvider(app);
    const firestore = firebase.firestore();
    const functions = firebase.functions();
    const settings = { timestampsInSnapshots: true };
    firestore.settings(settings);
  }
}
