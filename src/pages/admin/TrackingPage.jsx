import { useEffect, useState } from "react";

import { trackingAPI } from "../../services/apiClient";

import GangguanSelector from "./tracking/GangguanSelector";
import SummaryCards from "./tracking/SummaryCards";
import GangguanInfo from "./tracking/GangguanInfo";
import TrackingMap from "./tracking/TrackingMap";
import TechnicianList from "./tracking/TechnicianList";
import TechnicianHistory from "./tracking/TechnicianHistory";

export default function TrackingPage() {

    const [gangguanList, setGangguanList] = useState([]);

    const [selectedGangguan, setSelectedGangguan] =
        useState(null);

    const [trackingData, setTrackingData] =
        useState(null);

    const [selectedTechnician, setSelectedTechnician] =
        useState(null);

    const [history, setHistory] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // Load daftar gangguan
    useEffect(() => {

        loadGangguan();

    }, []);

    async function loadGangguan() {

        try {

            setLoading(true);

            const res =
                await trackingAPI.getGangguanList();

            setGangguanList(res.data.data);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }

    }

    // Load tracking saat gangguan dipilih
    useEffect(() => {

        if (!selectedGangguan) {

            setTrackingData(null);
            setSelectedTechnician(null);
            setHistory([]);
            return;

        }

        setSelectedTechnician(null);
        setHistory([]);
        loadTracking();

    }, [selectedGangguan]);

    async function loadTracking() {

        try {

            const res =
                await trackingAPI.getByGangguan(
                    selectedGangguan
                );

            setTrackingData(res.data.data);

        } catch (err) {

            console.error(err);

        }

    }

    function getPollingInterval(teknisiList = []) {
        if (!Array.isArray(teknisiList) || !teknisiList.length) {
            return 30000;
        }

        // Prioritaskan refresh cepat jika ada teknisi yang sedang menuju lokasi atau sedang bekerja
        if (
            teknisiList.some(
                (item) =>
                    item.assignmentStatus === "on_the_way" ||
                    item.assignmentStatus === "working"
            )
        ) {
            return 5000;
        }

        // Update lebih jarang jika semua teknisi baru ditugaskan
        if (
            teknisiList.every(
                (item) => item.assignmentStatus === "assigned"
            )
        ) {
            return 15000;
        }

        // Fallback untuk kondisi lain / tidak ada teknisi aktif
        return 30000;
    }

    // Polling adaptif berdasarkan status assignment
    useEffect(() => {

        if (!selectedGangguan) return;

        const intervalMs = getPollingInterval(
            trackingData?.teknisi
        );

        const interval = setInterval(() => {

            loadTracking();

        }, intervalMs);

        return () => clearInterval(interval);

    }, [selectedGangguan, trackingData]);

    async function handleSelectTechnician(teknisi) {

        setSelectedTechnician(teknisi);

        const res =
            await trackingAPI.getByTechnician(
                teknisi.teknisiId
            );

        setHistory(res.data.data);

    }

    if (loading)
        return <div>Loading...</div>;

    return (

        <div className="space-y-6">

            <GangguanSelector
                gangguan={gangguanList}
                value={selectedGangguan}
                onChange={setSelectedGangguan}
            />

            {
                trackingData && (

                    <>

                        <SummaryCards
                            summary={trackingData.summary}
                        />

                        <div className="grid grid-cols-3 gap-6">

                            <div className="col-span-2">

                                <TrackingMap
                                    gangguan={trackingData.gangguan}
                                    teknisi={trackingData.teknisi}
                                    selectedTechnician={selectedTechnician}
                                    history={history}
                                />

                            </div>

                            <div>

                                <GangguanInfo
                                    gangguan={trackingData.gangguan}
                                />

                            </div>

                        </div>

                        <TechnicianList
                            teknisi={trackingData.teknisi}
                            onSelect={handleSelectTechnician}
                        />

                        <TechnicianHistory
                            teknisi={selectedTechnician}
                            history={history}
                        />

                    </>

                )
            }

            {
                error && (

                    <div className="text-red-500">

                        {error}

                    </div>

                )
            }

        </div>

    );

}