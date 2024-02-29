import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { GoogleMapsAutocompleteService } from '../app/google.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private geocoder!: google.maps.Geocoder;
  // @ViewChild('searchInput', { static: true }) searchInput!: ElementRef;
  // predictions: any[] = [];
  title = 'project1';
  // display: any;
  map: any;
  // center: any;
  currentMarker!: google.maps.Marker[];

  position: { lat: number; lng: number; address: string } = {
    lat: 0,
    lng: 0,
    address: '',
  };
  constructor(private autocompleteService: GoogleMapsAutocompleteService) {
    this.geocoder = new google.maps.Geocoder();
  }
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;
  ngOnInit() {
    this.getCurrentLocation();
    // this.setupAutocomplete();
  }
  getAddressForCoordinates(lat: number, lng: number) {
    try {
      this.autocompleteService.reverseGeocode(lat, lng).then((res) => {
        this.position.address = res;
        console.log(this.position);
      });
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
    }
  }

  async getCurrentLocation(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            this.position.lat = position.coords.latitude;
            this.position.lng = position.coords.longitude;
            this.initAutocomplete();
            this.getAddressForCoordinates(this.position.lat, this.position.lng);

            // this.center = {
            //   lat: this.position.lat,
            //   lng: this.position.lng,
            // };
            // this.addMarker();
          },
          (error) => reject(error)
        );
      } else {
        reject('Geolocation is not supported by this browser.');
      }
    });
  }

  destination: any = '';
  initAutocomplete() {
    const map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: { lat: this.position.lat, lng: this.position.lng },
        zoom: 4,
        mapTypeId: 'roadmap',
      }
    );

    // Create the search box and link it to the UI element.
    const input = document.getElementById('pac-input') as HTMLInputElement;
    const searchBox = new google.maps.places.SearchBox(input);
    // map.controls[google.maps.ControlPosition.].push(input);

    // Bias the SearchBox results towards current map's viewport.
    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(22, 25), // Southwest corner of Egypt
      new google.maps.LatLng(31, 35) // Northeast corner of Egypt
    );
    map.addListener('bounds_changed', () => {
      searchBox.setBounds(bounds);
    });

    let markers: google.maps.Marker[] = [];

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', () => {
      const places: any = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

      // // Clear out the old markers.
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      const bounds = new google.maps.LatLngBounds();

      places.forEach((place: any) => {
        if (!place.geometry || !place.geometry.location) {
          console.log('Returned place contains no geometry');
          return;
        }

        const icon = {
          url: place.icon as string,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25),
        };

        // Create a marker for each place.
        console.log(place.geometry.location);
        markers.push(
          new google.maps.Marker({
            map,
            icon,
            title: place.name,
            position: place.geometry.location,
          })
        );
        this.destination = places[0].formatted_address;
        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
  }
  currentLocationMarker!: google.maps.Marker;

  placeMarker(position: any): void {
    if (this.currentLocationMarker) {
      this.currentLocationMarker.setMap(null); // Remove existing marker
    }

    this.currentLocationMarker = new google.maps.Marker({
      position: { lat: position.lat, lng: position.lng },
      map: this.map,
      title: position.address,
    });
  }

  //// this fn for input predection which now not wanted

  // private setupAutocomplete(): void {
  //   this.autocompleteService
  //     .getPlacePredictions(this.searchInput.nativeElement)
  //     .pipe(
  //       debounceTime(300),
  //       distinctUntilChanged(),
  //       switchMap((predictions: any[]) => {
  //         this.predictions = predictions;
  //         return [];
  //       })
  //     )
  //     .subscribe();
  // }
  // selectLocation(prediction: any): void {
  //   this.autocompleteService.getPlaceDetails(prediction.place_id).subscribe(
  //     (placeDetails: any) => {
  //       // Extract latitude and longitude
  //       const latitude = placeDetails.geometry.location.lat();
  //       const longitude = placeDetails.geometry.location.lng();

  //       console.log('Selected Location:', {
  //         description: prediction.description,
  //         latitude,
  //         longitude,
  //         placeDetails,
  //       });

  //       // You can perform any action with the selected location details
  //     },
  //     (error) => {
  //       console.error('Error fetching place details:', error);
  //     }
  //   );
  // }

  //// this code for google map tag first solution
  // center: google.maps.LatLngLiteral = {
  //   lat: this.position.lat,
  //   lng: this.position.lng,
  // };
  // zoom = 4;
  // markerOptions: google.maps.MarkerOptions = {
  //   draggable: false,
  // };
  // markerPositions: google.maps.LatLngLiteral[] = [];
  // addMarker() {
  //   this.markerPositions.push(this.center);
  // }
  // moveMap(event: google.maps.MapMouseEvent) {
  //   if (event.latLng != null) this.center = event.latLng.toJSON();
  // }
  // move(event: google.maps.MapMouseEvent) {
  //   if (event.latLng != null) this.display = event.latLng.toJSON();
  // }

  ////// da m4 fkra leeh bs 5leeh e7tyaty
  // lat: any;
  // lng: any;
  // openInfoWindow(marker: MapMarker) {
  //   this.lat = this.display?.lat;
  //   this.lng = this.display?.lng;
  //   if (this.infoWindow != undefined) this.infoWindow.open(marker);
  // }
}
