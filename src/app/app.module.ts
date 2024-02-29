import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Loader } from '@googlemaps/js-api-loader';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GoogleMapsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  providers: [
    {
      provide: Loader,
      useValue: new Loader({
        apiKey: 'AIzaSyC63NJQEQn6FQtSWLeCVqFEQSlG2SyFyFw',
        libraries: ['places'],
      }),
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
