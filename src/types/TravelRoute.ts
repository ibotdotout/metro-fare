import { METRO_STATION, LineType } from ".";

export type TravelRoute = {
    route: {
        route: METRO_STATION[],
        lineType: LineType,
        fare: number
    }[],
    fare: number,
    source: METRO_STATION,
    destination: METRO_STATION,
}