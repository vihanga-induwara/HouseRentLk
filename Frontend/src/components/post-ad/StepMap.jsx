import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icon issue
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Map Click Component
const LocationMarker = ({ setCoordinates }) => {
    useMapEvents({
        click(e) {
            setCoordinates([e.latlng.lat, e.latlng.lng]); // Leaflet uses [lat, lng], backend expects [lng, lat]
        },
    });
    return null;
};

const StepMap = ({ coordinates, setCoordinates }) => {
    const position = [coordinates[1], coordinates[0]]; // Leaflet [lat, lng]

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Pin Exact Location</h2>
            <p className="text-slate-500 mb-4">Click on the map to set the location.</p>
            <div className="flex-grow rounded-xl overflow-hidden border border-slate-200 h-[400px] z-0">
                <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}></Marker>
                    <LocationMarker setCoordinates={(coords) => setCoordinates([coords[1], coords[0]])} />
                </MapContainer>
            </div>
            <div className="mt-4 text-sm text-slate-500 text-center">
                Coordinates: {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
            </div>
        </div>
    );
};

export default StepMap;
