import { env } from "@/env.mjs";
import { Itinerary } from "@/server/api/routers/itinerary";
import { Coordinates } from "@/types/coordinates";

export class ItineraryMapFetcher {
  constructor(private itinerary: Itinerary) {}

  /**
   * @throws Will throw an error if the call to upstream API will fail.
   */
  public async fetchPlacesStaticMap() {
    const coordinates = [] as Coordinates[];
    const placesMap = new Map<string, ArrayBuffer>();
    for (const place of this.itinerary.places) {
      const placeCoordinates = {
        latitude: place.attraction.latitude,
        longitude: place.attraction.longitude,
      };
      coordinates.push(placeCoordinates);

      const size = "800x600";
      const marker = `pin-l+ba2626(${place.attraction.longitude},${place.attraction.latitude})`;
      const zoom = "15,0";
      const position = `${place.attraction.longitude},${place.attraction.latitude},${zoom}`;

      try {
        const map = await this.doFetch(marker, position, size);
        placesMap.set(place.id, map);
      } catch (error) {
        throw error;
      }
    }
    return placesMap;
  }

  /**
   * @throws Will throw an error if the call to upstream API will fail.
   */
  public async fetchOverviewMap() {
    const size = "1280x1024@2x";
    const markers = [] as string[];
    this.itinerary.places.forEach((place) => {
      markers.push(
        `pin-l+ba2626(${place.attraction.longitude},${place.attraction.latitude})`
      );
    });
    const marker = markers.join(",");
    const position = "auto";

    try {
      return await this.doFetch(marker, position, size);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @throws Will throw an error if the HTTP call will fail.
   */
  private async doFetch(marker: string, position: string, size: string) {
    const host = "https://api.mapbox.com";
    const url = `${host}/styles/v1/mapbox/streets-v11/static/${marker}/${position}/${size}?access_token=${env.MAPBOX_SECRET}`;
    const response = await fetch(url);
    if (!response?.ok) {
      const responseText = await response.text();
      throw new Error(`HTTP response code ${response.status}: ${responseText}`);
    }
    const data = await response.arrayBuffer();
    return data;
  }
}
