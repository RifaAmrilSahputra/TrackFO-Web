import { Fragment, useMemo } from "react";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

const gangguanIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const leaderIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const teknisiIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const historyStartIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const historyEndIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function getDistanceColor(distanceKm) {
  if (distanceKm == null) {
    return "#6b7280";
  }

  if (distanceKm < 0.5) {
    return "#22c55e"; // hijau
  }

  if (distanceKm <= 2) {
    return "#eab308"; // kuning
  }

  return "#ef4444"; // merah
}

function getRoutePositions(item) {
  const routeArray =
    item.history ||
    item.locationHistory ||
    item.route ||
    item.positions ||
    item.points ||
    item.locations ||
    [];

  if (!Array.isArray(routeArray)) return [];

  return routeArray
    .map((point) => {
      if (!point) return null;
      if (Array.isArray(point) && point.length >= 2) {
        return [Number(point[0]), Number(point[1])];
      }
      if (point.latitude != null && point.longitude != null) {
        return [Number(point.latitude), Number(point.longitude)];
      }
      if (point.lat != null && point.lng != null) {
        return [Number(point.lat), Number(point.lng)];
      }
      return null;
    })
    .filter(Boolean);
}

export default function TrackingMap({
  gangguan,
  teknisi = [],
  selectedTechnician,
  history = [],
}) {

  const selectedTechnicianId = selectedTechnician?.teknisiId;

  const center = useMemo(() => {

    if (
      gangguan?.latitude &&
      gangguan?.longitude
    ) {
      return [
        Number(gangguan.latitude),
        Number(gangguan.longitude),
      ];
    }

    return [-6.2, 106.816666];

  }, [gangguan]);

  const sortedHistory = useMemo(
    () =>
      history
        .slice()
        .sort(
          (a, b) =>
            new Date(a.recordedAt) -
            new Date(b.recordedAt)
        ),
    [history]
  );

  return (

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="mb-4">

        <h3 className="text-lg font-semibold">

          Monitoring Lokasi

        </h3>

        <p className="text-sm text-slate-500">

          Posisi gangguan dan teknisi.

        </p>

      </div>

      <div className="h-[500px] overflow-hidden rounded-xl">

        <MapContainer
          center={center}
          zoom={15}
          scrollWheelZoom
          style={{
            width: "100%",
            height: "100%",
          }}
        >

          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Gangguan */}

          {gangguan && (

            <Marker
              position={[
                gangguan.latitude,
                gangguan.longitude,
              ]}
              icon={gangguanIcon}
            >

              <Popup>

                <div className="space-y-1">

                  <h4 className="font-semibold">

                    📍 Gangguan

                  </h4>

                  <div>

                    {gangguan.judul}

                  </div>

                  <div>

                    Area :

                    {" "}

                    {gangguan.area}

                  </div>

                  <div>

                    Status :

                    {" "}

                    {gangguan.status}

                  </div>

                  <div>

                    Priority :

                    {" "}

                    {gangguan.priority}

                  </div>

                </div>

              </Popup>

            </Marker>

          )}

          {/* Teknisi */}

          {teknisi.map((item) => {

            if (!item.location) return null;

            const showAssignmentLine =
              gangguan?.latitude &&
              gangguan?.longitude &&
              item.location.latitude &&
              item.location.longitude;

            const routePositions = getRoutePositions(item);
            const showRouteLine = routePositions.length > 1;
            const routeColor =
              String(item.teknisiId) === String(selectedTechnicianId)
                ? "#2563eb"
                : "#94a3b8";

            return (

              <Fragment key={item.teknisiId}>

                {showAssignmentLine && (
                  <Polyline
                    positions={[
                      [item.location.latitude, item.location.longitude],
                      [gangguan.latitude, gangguan.longitude],
                    ]}
                    pathOptions={{
                      color: getDistanceColor(item.distance),
                      weight: 3,
                      dashArray: "6, 8",
                    }}
                  />
                )}

                {showRouteLine && (
                  <Polyline
                    positions={routePositions}
                    pathOptions={{
                      color: routeColor,
                      weight: 3,
                      dashArray: "8, 8",
                      opacity: 0.8,
                    }}
                  />
                )}

                <Marker
                  position={[
                    item.location.latitude,
                    item.location.longitude,
                  ]}
                  icon={
                    item.isLeader
                      ? leaderIcon
                      : teknisiIcon
                  }
                >

                  <Popup>

                    <div className="space-y-1">

                      <h4 className="font-semibold">

                        👷 {item.nama}

                      </h4>

                      <div>

                        {item.isLeader
                          ? "Leader"
                          : "Member"}

                      </div>

                      <div>

                        Status :

                        {" "}

                        {item.assignmentStatus}

                      </div>

                      <div>

                        Distance :

                        {" "}

                        {item.distance?.toFixed(2)}

                        {" "}km

                      </div>

                      <div>

                        Last Seen :

                        {" "}

                        {item.lastSeen
                          ? new Date(
                              item.lastSeen
                            ).toLocaleString(
                              "id-ID"
                            )
                          : "-"}

                      </div>

                    </div>

                  </Popup>

                </Marker>

              </Fragment>

            );

          })}

          {/* History perjalanan teknisi terpilih */}

          {selectedTechnician && sortedHistory.length > 1 && (
            <>
              <Polyline
                positions={sortedHistory.map((item) => [
                  Number(item.latitude),
                  Number(item.longitude),
                ])}
                pathOptions={{
                  color: "#3b82f6",
                  weight: 4,
                }}
              />

              <Marker
                position={[
                  Number(sortedHistory[0].latitude),
                  Number(sortedHistory[0].longitude),
                ]}
                icon={historyStartIcon}
              >
                <Popup>
                  <div className="space-y-1">
                    <h4 className="font-semibold">
                      Start Perjalanan
                    </h4>
                    <div>
                      {sortedHistory[0].recordedAt
                        ? new Date(
                            sortedHistory[0].recordedAt
                          ).toLocaleString("id-ID")
                        : "-"}
                    </div>
                  </div>
                </Popup>
              </Marker>

              <Marker
                position={[
                  Number(sortedHistory[sortedHistory.length - 1].latitude),
                  Number(sortedHistory[sortedHistory.length - 1].longitude),
                ]}
                icon={historyEndIcon}
              >
                <Popup>
                  <div className="space-y-1">
                    <h4 className="font-semibold">
                      Akhir Perjalanan
                    </h4>
                    <div>
                      {sortedHistory[sortedHistory.length - 1].recordedAt
                        ? new Date(
                            sortedHistory[sortedHistory.length - 1].recordedAt
                          ).toLocaleString("id-ID")
                        : "-"}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

        </MapContainer>

      </div>

    </section>

  );

}