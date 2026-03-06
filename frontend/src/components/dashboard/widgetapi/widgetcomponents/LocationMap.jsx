import React, { useEffect, useRef, useState } from 'react';
import { useGetMapKeyQuery } from '../../../../redux/api/googleApi';

const LocationMap = ({ pickup, dropoffs = [], pickupCoords, dropoffCoords, companyId }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const polylineRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Fetch key even if companyId is missing (backend handles fallback)
    const { data: keyData, isLoading: isKeyLoading } = useGetMapKeyQuery(companyId || "");

    useEffect(() => {
        // If google maps is already available, just set as loaded
        if (window.google?.maps) {
            setIsLoaded(true);
            return;
        }

        // Wait for key if not available yet
        if (isKeyLoading || !keyData?.mapKey) return;

        const scriptId = 'google-maps-script';
        if (document.getElementById(scriptId)) {
            // Script already exists but maybe not loaded yet?
            // Onload should handle it if we are the first one, 
            // but if we are second component we should just wait for window.google
            const checkGoogle = setInterval(() => {
                if (window.google?.maps) {
                    setIsLoaded(true);
                    clearInterval(checkGoogle);
                }
            }, 100);
            return () => clearInterval(checkGoogle);
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${keyData.mapKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setIsLoaded(true);
        };
        script.onerror = () => {
            console.error('Failed to load Google Maps');
        };
        document.head.appendChild(script);

    }, [keyData, isKeyLoading]);

    useEffect(() => {
        if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: 51.5074, lng: -0.1278 },
            zoom: 10,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        });
    }, [isLoaded]);

    useEffect(() => {
        if (!isLoaded || !mapInstanceRef.current) {
            return;
        }

        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        if (polylineRef.current) {
            polylineRef.current.setMap(null);
            polylineRef.current = null;
        }

        const bounds = new window.google.maps.LatLngBounds();
        const locations = [];

        if (pickupCoords?.lat && pickupCoords?.lng) {
            const pickupMarker = new window.google.maps.Marker({
                position: { lat: pickupCoords.lat, lng: pickupCoords.lng },
                map: mapInstanceRef.current,
                title: 'Pickup',
                label: {
                    text: 'P',
                    color: 'white',
                    fontWeight: 'bold',
                },
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#22c55e',
                    fillOpacity: 1,
                    strokeColor: '#fff',
                    strokeWeight: 2,
                },
            });

            markersRef.current.push(pickupMarker);
            bounds.extend({ lat: pickupCoords.lat, lng: pickupCoords.lng });
            locations.push({ lat: pickupCoords.lat, lng: pickupCoords.lng });
        }

        Object.entries(dropoffCoords).forEach(([idx, coords], index) => {
            if (coords?.lat && coords?.lng) {
                const dropoffMarker = new window.google.maps.Marker({
                    position: { lat: coords.lat, lng: coords.lng },
                    map: mapInstanceRef.current,
                    title: `Dropoff ${parseInt(idx) + 1}`,
                    label: {
                        text: (parseInt(idx) + 1).toString(),
                        color: 'white',
                        fontWeight: 'bold',
                    },
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 12,
                        fillColor: '#ef4444',
                        fillOpacity: 1,
                        strokeColor: '#fff',
                        strokeWeight: 2,
                    },
                });

                markersRef.current.push(dropoffMarker);
                bounds.extend({ lat: coords.lat, lng: coords.lng });
                locations.push({ lat: coords.lat, lng: coords.lng });
            }
        });

        if (locations.length > 1) {
            polylineRef.current = new window.google.maps.Polyline({
                path: locations,
                geodesic: true,
                strokeColor: '#3b82f6',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                map: mapInstanceRef.current,
            });
        }

        if (locations.length > 0) {
            mapInstanceRef.current.fitBounds(bounds);

            if (locations.length === 1) {
                mapInstanceRef.current.setZoom(14);
            }
        }
    }, [isLoaded, pickupCoords, dropoffCoords, pickup, dropoffs]);

    return (
        <div className="relative w-full h-[400px] sm:h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-300 shadow-md">
            {!isLoaded ? (
                <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                        <p className="text-gray-600">Loading Map...</p>
                    </div>
                </div>
            ) : (
                <div ref={mapRef} className="w-full h-full" />
            )}

            {isLoaded && (pickupCoords || Object.keys(dropoffCoords).length > 0) && (
                <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg text-xs z-10 border border-gray-100">
                    {pickupCoords && (
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                            <span className="font-medium">Pickup</span>
                        </div>
                    )}
                    {Object.keys(dropoffCoords).length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                            <span className="font-medium">Dropoff</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LocationMap;