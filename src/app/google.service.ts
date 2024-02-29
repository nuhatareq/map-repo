// google-maps-autocomplete.service.ts
import { Injectable } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  filter,
} from 'rxjs/operators';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsAutocompleteService {
  private autocompleteService: any;
  private placesService: any;
  private geocoder!: google.maps.Geocoder;
  constructor() {
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placesService = new google.maps.places.PlacesService(
      document.createElement('div')
    );
    this.geocoder = new google.maps.Geocoder();
  }

  getPlacePredictions(input: HTMLInputElement): Observable<any[]> {
    return fromEvent(input, 'input').pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(() => input.value.trim() !== ''),
      switchMap(() => {
        return new Observable<any[]>((observer) => {
          this.autocompleteService.getPlacePredictions(
            { input: input.value },
            (predictions: any[], status: string) => {
              if (status === 'OK') {
                observer.next(predictions);
                observer.complete();
              } else {
                observer.error(status);
              }
            }
          );
        });
      })
    );
  }

  getPlaceDetails(placeId: string): Observable<any> {
    return new Observable<any>((observer) => {
      this.placesService.getDetails(
        { placeId: placeId },
        (placeDetails: any, status: string) => {
          if (status === 'OK') {
            observer.next(placeDetails);
            observer.complete();
          } else {
            observer.error(status);
          }
        }
      );
    });
  }

  reverseGeocode(lat: number, lng: number): Promise<string> {
    const latlng = new google.maps.LatLng(lat, lng);

    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const formattedAddress = results[0].formatted_address;
          resolve(formattedAddress);
        } else {
          reject('Reverse geocoding failed');
        }
      });
    });
  }
}
