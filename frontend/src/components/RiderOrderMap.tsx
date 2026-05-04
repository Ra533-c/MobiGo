import type { IOrder } from "../types";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { realtimeService } from "../main"
import axios from "axios";


declare module "leaflet" {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Routing {
        function control(options: any): any;
        function osrmv1(options?: any): any;
    }
}

// Custom attractive SVG markers - no more emoji!
const riderIcon = L.divIcon({
    html: `
        <div style="
            background: linear-gradient(135deg, #e23744, #f05a66);
            width: 44px; height: 44px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 15px rgba(226,55,68,0.5);
            display: flex; align-items: center; justify-content: center;
        ">
            <span style="transform: rotate(45deg); font-size: 20px; line-height:1;">🛵</span>
        </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    className: "",
});

const deliveryIcon = L.divIcon({
    html: `
        <div style="
            background: linear-gradient(135deg, #10b981, #059669);
            width: 44px; height: 44px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 15px rgba(16,185,129,0.5);
            display: flex; align-items: center; justify-content: center;
        ">
            <span style="transform: rotate(45deg); font-size: 20px; line-height:1;">📦</span>
        </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    className: "",
});

interface Props {
    order: IOrder;

}

// Fix: Route SVG z-index fix + map invalidateSize on mount
const RoutingControl = ({
    from,
    to
}: {
    from: [number, number],
    to: [number, number],
}) => {
    const map = useMap();

    useEffect(() => {
        // Fix: Force map to recalculate size so route renders properly on zoom
        setTimeout(() => map.invalidateSize(), 100);

        const control = L.Routing.control({
            waypoints: [L.latLng(from), L.latLng(to)],
            lineOptions: {
                // Fix: addWaypoints false prevents route from breaking on zoom
                styles: [{ color: "#e23744", weight: 5, opacity: 0.85 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0,
            },
            addWaypoints: false,
            draggablewaypoints: false,
            show: false,
            // Fix: createMarker null prevents duplicate default markers
            createMarker: () => null,
            router: L.Routing.osrmv1({
                serviceUrl: `https://router.project-osrm.org/route/v1`
            }),
            fitSelectedRoutes: false,
        }).addTo(map);

        // Fix: Force SVG layer to correct z-index so it stays visible on zoom
        const routePane = map.getPane("overlayPane");
        if (routePane) routePane.style.zIndex = "400";

        return () => {
            map.removeControl(control);
        };
    }, [from, to, map])

    return null;
};


const RiderOrderMap = ({ order }: Props) => {
    const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);

    if (!order.deliveryAddress.latitude || !order.deliveryAddress.longitude) {
        console.log("order.deliveryAddress.latitude: ", order.deliveryAddress.latitude)
        console.log("order.deliveryAddress.longitude: ", order.deliveryAddress.longitude)
        return null;
    }

    const deliveryLocation: [number, number] = [
        order.deliveryAddress.latitude,
        order.deliveryAddress.longitude
    ];

    console.log("order: ", order)

    useEffect(() => {
        const fetchLocation = () => {
            // getCurrentPosition uses 3 arguments
            navigator.geolocation.getCurrentPosition(

                // 1st Argument:Success Function (When location is  founds)
                async (pos) => {
                    const latitude = pos.coords.latitude;
                    const longitude = pos.coords.longitude;

                    setRiderLocation([latitude, longitude]);

                    try {
                        await axios.post(`${realtimeService}/api/v1/internal/emit`,
                            {
                                event: "rider:location",
                                room: `user:${order.userId}`,
                                payload: {
                                    latitude,
                                    longitude
                                }
                            },
                            {
                                headers: {
                                    "x-internal-key": import.meta.env.VITE_INTERNAL_SERVICE_KEY,
                                }
                            }
                        );
                    } catch (error) {
                        console.error("Error While fetching location", error);
                    }
                },

                // 2nd Argument: Error Function (when user doesn't allow location or any error occurs)
                (err) => {
                    console.log("Location error", err);
                },

                // 3rd Argument: Options
                {
                    enableHighAccuracy: true,
                    maximumAge: 5000,
                    timeout: 10000
                }
            );
        };

        fetchLocation();

        const interval = setInterval(fetchLocation, 10000);

        return () => clearInterval(interval);

    }, [order.userId]);

    if (!riderLocation) {
        console.log("The riderLocation is :", riderLocation);
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 h-[350px] w-full flex flex-col items-center justify-center gap-3 shadow-lg">
                {/* Animated ping rings */}
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-16 h-16 rounded-full bg-red-500/20 animate-ping" />
                    <div className="absolute w-10 h-10 rounded-full bg-red-500/30 animate-ping delay-150" />
                    <span className="text-4xl relative z-10">📍</span>
                </div>
                <p className="text-white font-semibold text-sm tracking-wide">Fetching Live Location...</p>
                <p className="text-gray-400 text-xs">GPS signal acquiring</p>
            </div>
        );
    }


    return (
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            {/* Map Header Bar */}
            <div className="absolute top-0 left-0 right-0 z-[999] bg-gradient-to-b from-black/60 to-transparent px-4 pt-3 pb-6 pointer-events-none">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/90 tracking-wider uppercase">🔴 Live Tracking</span>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>
            </div>

            {/* Legend Bottom Bar */}
            <div className="absolute bottom-2 left-2 z-[999] flex gap-2 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow text-xs font-semibold flex items-center gap-1.5">
                    <span>🛵</span> <span className="text-gray-700">Rider</span>
                </div>
                <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow text-xs font-semibold flex items-center gap-1.5">
                    <span>📦</span> <span className="text-gray-700">Customer</span>
                </div>
            </div>

            <MapContainer
                center={riderLocation}
                zoom={13}
                className="h-[350px] w-full"
                zoomControl={true}
            >
                {/* Cleaner Map Style */}
                <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* marker for rider */}
                <Marker
                    position={riderLocation}
                    icon={riderIcon}
                >
                    <Popup className="font-semibold">🛵 You are here</Popup>
                </Marker>

                {/* marker for customer location */}
                <Marker
                    position={deliveryLocation}
                    icon={deliveryIcon}
                >
                    <Popup className="font-semibold">📦 Delivery Destination</Popup>
                </Marker>

                <RoutingControl
                    from={riderLocation}
                    to={deliveryLocation}
                />
            </MapContainer>
        </div>
    );

};
export default RiderOrderMap;
