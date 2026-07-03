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

        if (!selectedGangguan) return;

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

    // Polling
    useEffect(() => {

        if (!selectedGangguan) return;

        const interval = setInterval(() => {

            loadTracking();

        }, 15000);

        return () => clearInterval(interval);

    }, [selectedGangguan]);

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