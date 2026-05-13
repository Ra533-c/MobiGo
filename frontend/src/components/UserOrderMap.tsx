import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { useEffect } from "react";

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
    riderLocation: [number, number],
    deliveryLocation: [number, number]
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


const UserOrderMap = ({ riderLocation, deliveryLocation }: Props) => {


    return (
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            {/* Map Header Bar */}
            <div className="absolute top-0 left-0 right-0 z-999 bg-gradient-to-b from-black/60 to-transparent px-4 pt-3 pb-6 pointer-events-none">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/90 tracking-wider uppercase">🔴 Live Tracking</span>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>
            </div>

            {/* Legend Bottom Bar */}
            <div className="absolute bottom-2 left-2 z-999 flex gap-2 pointer-events-none">
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
    )
}

export default UserOrderMap