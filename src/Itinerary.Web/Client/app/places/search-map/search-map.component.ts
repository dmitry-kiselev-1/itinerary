﻿import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { PlaceDetails } from '../../shared';
import { PlacesCommunicationService } from '../places-communication.service';
import { SearchCriteria } from '../search-criteria';
import { MapPlaceDetails } from '.map-place-details';

@Component({
  selector: 'search-map',
  templateUrl: 'search-map.component.html',
  styleUrls: ['search-map.component.scss']
})
export class SearchMapComponent implements OnDestroy {
  private defaultZoom = 5;
  private defaultZoomForSelectedPoint = 8;
  private placesSubscription: Subscription;
  private searchCriteriaSubscription: Subscription;
  private selectedPlaces: string[];

  public zoom: number;
  public showBasePoint: boolean;
  public searchCriteria: SearchCriteria;
  public places: MapPlaceDetails[];

  constructor(private placesCommunicationService: PlacesCommunicationService) {
    this.placesSubscription = placesCommunicationService
      .places
      .subscribe((places) => this.searchResultsCallBack(places));
    this.searchCriteriaSubscription = placesCommunicationService
      .searchCriteria
      .subscribe((searchCriteria) => this.searchCriteria = searchCriteria);

    this.zoom = this.defaultZoom;
    this.searchCriteria = new SearchCriteria();
    this.places = [];
    this.selectedPlaces = [];
  }

  public radiusInMeters() {
    return this.searchCriteria.distance * 1609.34;
  }

  public markerClick(place: MapPlaceDetails) {
    this.placesCommunicationService.select(place);
    this.places.forEach((x) => {
      x.wasSelected = x.wasSelected || x.isSelected;
      x.isSelected = false;
    });
    place.isSelected = true;
  }

  ngOnDestroy(): void {
    this.placesSubscription.unsubscribe();
  }

  private searchResultsCallBack(places: PlaceDetails[]) {
    this.showBasePoint = places.some(() => true);
    this.zoom = this.showBasePoint ? this.defaultZoomForSelectedPoint : this.zoom;

    this.setPreviousSelectedPlaces(places);
    this.places = places.map((place) => new MapPlaceDetails(false, this.wasSelected(place), place));
  }

  private setPreviousSelectedPlaces(places: PlaceDetails[]) {
    const selected = this.places
      .filter((place) => place.wasSelected || place.isSelected)
      .map((place) => place.name);
    this.selectedPlaces = [...selected, ...this.selectedPlaces];
  }

  private wasSelected(place: PlaceDetails): boolean {
    return this.selectedPlaces.some((x) => x === place.name);
  }
}
