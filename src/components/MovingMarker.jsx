import { useEffect, useRef } from 'react';
import { Marker, useMap } from 'react-leaflet';
import { DivIcon } from 'leaflet';

function createMarkerIcon(color = '#ef4444') {
  return new DivIcon({
    className: 'custom-moving-marker',
    html: `<div style="background:${color};width:16px;height:16px;border-radius:9999px;border:2px solid white;box-shadow:0 0 0 2px rgba(0,0,0,0.12);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function MovingMarker({ position, color = '#f59e0b', children }) {
  const markerRef = useRef(null);
  const map = useMap();

  useEffect(() => {
    const markerRefCurrent = markerRef.current;
    const marker = markerRefCurrent?.getLatLng
      ? markerRefCurrent
      : markerRefCurrent?.instance || markerRefCurrent;

    if (!marker || !position || typeof marker.getLatLng !== 'function') return;

    const from = marker.getLatLng();
    const to = position;
    const steps = 20;
    let idx = 0;

    const animate = () => {
      idx += 1;
      const lat = from.lat + (to.lat - from.lat) * (idx / steps);
      const lng = from.lng + (to.lng - from.lng) * (idx / steps);
      marker.setLatLng([lat, lng]);
      if (idx < steps) {
        requestAnimationFrame(animate);
      }
    };

    animate();
    if (map) {
      map.panTo(position, { animate: true, duration: 0.3 });
    }
  }, [position, map]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={createMarkerIcon(color)}
    >
      {children}
    </Marker>
  );
}
