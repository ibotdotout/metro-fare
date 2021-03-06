import PriorityQueue from "priorityqueue";
import { getFareTypeFromStationId } from "./util.service";
import { METRO_STATION, Graph, RouteSegment, Line, Intersection } from "../types";
import { METRO_GRAPH } from "../data/MetroGraph";
import { StationHop } from "../types/StationHop";
import cloneDeep from "lodash.clonedeep";

const lowestHopsComparator = (stationA: StationHop, stationB: StationHop) => stationB.getTotalHops() - stationA.getTotalHops();

const createGraph = (metroGraph: Graph, graph = Object.create(null)) => {
    metroGraph.lines.forEach((line: Line) => {
        addLineToGraph(line, graph);
    })
    if (metroGraph.intersections) {
        addIntersectionsToGraph(metroGraph.intersections, graph);
    }
    return graph;
}

const addLineToGraph = (metroLine: Line, graph = Object.create(null)) => {
    metroLine.line.forEach((station, index) => {
        if (!Object.keys(graph).includes(station)) {
            graph[station] = [];
        }
        if (index > 0) {
            const prevStation = metroLine.line[index - 1];
            graph[station].push(prevStation);
        }
        if (index + 1 < metroLine.line.length) {
            const nextStation = metroLine.line[index + 1];
            graph[station].push(nextStation);
        }
    });
    if (metroLine.intersections) {
        addIntersectionsToGraph(metroLine.intersections, graph);
    }
    return graph;
}

const addIntersectionsToGraph = (intersections: Intersection[], graph: any) => {
    intersections.forEach((intersection: METRO_STATION[]) => {
        const firstStation = intersection[0];
        const secondStation = intersection[1];
        graph[firstStation].push(secondStation);
        graph[secondStation].push(firstStation);
    });
}

const findAllRoutes = (source: METRO_STATION, destination: METRO_STATION, graph: any): RouteSegment[][] => {
    const routeSegment: RouteSegment = { route: [source], fareType: getFareTypeFromStationId(source) };
    
    const comparator = lowestHopsComparator;
    const stationsToBeVisited = new PriorityQueue({ comparator });
    stationsToBeVisited.push(new StationHop(source, [routeSegment]));

    const allPossibleRoutes: RouteSegment[][] = [];
    while (stationsToBeVisited.length > 0) {
        const currentStation = stationsToBeVisited.pop() as StationHop;
        
        if (currentStation.station === destination) {
            allPossibleRoutes.push(currentStation.routeSegments);
        }
        
        const nextStations: METRO_STATION[]  = graph[currentStation.station];
        nextStations.forEach(nextStation => {
            
            if (!currentStation.isStationInPath(nextStation)) {
                const routeSegments: RouteSegment[] = getNextStationRouteSegments(currentStation, nextStation);
                const nextStationHop = new StationHop(nextStation, routeSegments);
                stationsToBeVisited.push(nextStationHop);
            }
        });
    }
    return allPossibleRoutes;
}

const getNextStationRouteSegments = (currentStation: StationHop, nextStation: METRO_STATION): RouteSegment[] => {
    const fareType = getFareTypeFromStationId(nextStation);
    const routeSegments: RouteSegment[] = cloneDeep(currentStation.routeSegments);

    if (routeSegments[routeSegments.length - 1].fareType === fareType) {
        routeSegments[routeSegments.length - 1].route.push(nextStation);
    } else {
        const routeSegment: RouteSegment = {
            route: [nextStation],
            fareType
        };
        routeSegments.push(routeSegment)
    }

    return routeSegments;
}

const GraphService = {
    createGraph,
    findAllRoutes,
    getNextStationRouteSegments
}

export default GraphService;

export const metroGraph = createGraph(METRO_GRAPH);