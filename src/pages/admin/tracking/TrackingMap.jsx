import { useMemo } from "react";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
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
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function TrackingMap({
  gangguan,
  teknisi = [],
}) {

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

            return (

              <Marker
                key={item.teknisiId}
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

            );

          })}

        </MapContainer>

      </div>

    </section>

  );

}