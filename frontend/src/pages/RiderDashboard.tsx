import axios from "axios";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import { riderService } from "../main";
import toast, { LoaderIcon } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { BiUpload } from "react-icons/bi";
import type { IOrder } from "../types";
import audio from "../assets/not2.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";

interface IRider {
    _id: string;
    picture: string;
    phoneNumber: string;
    aadharNumber: string;
    drivingLicenseNumber: string;
    isAvailable: boolean;
    isVerified: boolean;
}

const RiderDashboard = () => {
    const { user } = useAppData();
    const { socket } = useSocket();

    const [profile, setProfile] = useState<IRider | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [toggling, setToggling] = useState(false);

    const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
    const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

    const [audioUnlocked, setAudioUnlocked] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(audio);
        audioRef.current.preload = "auto";
    }, []);

    const unlockAudio = async () => {
        try {
            if (!audioRef.current) return;

            await audioRef.current.play();
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setAudioUnlocked(true);
            toast.success("Audio Enabled for rider");
        } catch (error: any) {
            toast.error("Failed to enable audio for rider");
        }
    };

    useEffect(() => {
        if (!socket) return;

        const onOrderAvailable = ({ orderId }: { orderId: string }) => {
            setIncomingOrders((prev) => prev.includes(orderId) ? prev : [...prev, orderId]);


            if (audioRef.current && audioUnlocked) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => { })
            }

            setTimeout(() => {
                setIncomingOrders((prev) => prev.filter((id) => id !== orderId))
            }, 20000);
        };

        socket.on("order:available", onOrderAvailable);

        return () => {
            socket.off("order:available", onOrderAvailable);
        }
    }, [socket, audioUnlocked])

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setProfile(data.account);
        } catch (error) {
            toast.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "rider") fetchProfile();
        else setLoading(false);
    }, [user]);

    const fetchCurrentOrder = async () => {
        try {
            const { data } = await axios.get(`${riderService}/api/rider/order/current`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            )
            setCurrentOrder(data.order);
        } catch (error) {
            console.log(error);
            setCurrentOrder(null);
        }
    }

    useEffect(() => {
        fetchCurrentOrder();
    }, []);

    const toggleAvailability = async () => {
        if (!navigator.geolocation) {
            toast.error("Location access required");
            return;
        }
        setToggling(true);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                await axios.patch(
                    `${riderService}/api/rider/toggle`,
                    {
                        isAvailable: !profile?.isAvailable,
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    },
                );
                toast.success(
                    profile.isAvailable ? "You are now offline" : "You are now online",
                );
                fetchProfile();
            } catch (error: any) {
                toast.error(error.response.data.message);
            } finally {
                setToggling(false);
            }
        });
    };

    const [phoneNumber, setPhoneNumber] = useState("");
    const [aadharNumber, setAadharNumber] = useState("");
    const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!navigator.geolocation) {
            toast.error("Location access required");
            return;
        }

        setSubmitting(true);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const formData = new FormData();

            formData.append("aadharNumber", aadharNumber);
            formData.append("phoneNumber", phoneNumber);
            formData.append("drivingLicenseNumber", drivingLicenseNumber);
            formData.append("latitude", pos.coords.latitude.toString());
            formData.append("longitude", pos.coords.longitude.toString());

            if (image) {
                formData.append("file", image);
            }

            try {
                const { data } = await axios.post(
                    `${riderService}/api/rider/new`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "Content-Type": "multipart/form-data",
                        },
                    },
                );
                toast.success(data.message);
                fetchProfile();
            } catch (error: any) {
                toast.error(error.response.data.message || "Something went wrong");
            } finally {
                setSubmitting(false);
            }
        });
    };

    if (user.role !== "rider") {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
                You are not authorized to access this dashboard
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                Loading rider's detail...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-6">
                <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
                    <h1 className="text-xl font-semibold">Add Your Rider's Profile</h1>
                    <input
                        type="number"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
                    />
                    <input
                        type="number"
                        placeholder="Aadhar number"
                        value={aadharNumber}
                        onChange={(e) => setAadharNumber(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Driving License number"
                        value={drivingLicenseNumber}
                        onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                        className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
                    />
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm text-gray-600 hover:bg-gray-50">
                        <BiUpload className="h-5 w-5 text-red-500" />
                        {image ? image.name : "Upload Your image"}
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                        />
                    </label>

                    <button
                        disabled={submitting}
                        onClick={handleSubmit}
                        className="w-full rounded-xl font-semibold py-3 text-white text-sm bg-[#e23744]"
                    >
                        {submitting ? "Submitting..." : "Add Profile"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <div className="mx-auto max-w-md px-4 py-5 space-y-4">

                {/* rider info card */}
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white">
                    {/* Top gradient banner */}
                    <div className="h-24 bg-gradient-to-br from-[#e23744] via-[#f05a66] to-[#ff8a5b]" />

                    {/* Avatar overlapping banner */}
                    <div className="flex flex-col items-center -mt-12 pb-5 px-5">
                        <div className="relative">
                            <img
                                className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-xl"
                                src={profile.picture}
                                alt="rider_image"
                            />
                            {/* Online/Offline dot */}
                            <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${profile.isAvailable ? "bg-green-500" : "bg-gray-400"}`} />
                        </div>

                        <h2 className="mt-3 text-xl font-bold text-gray-900 tracking-tight">{user?.name}</h2>
                        <p className="text-xs font-semibold text-gray-400 mt-0.5">📞 {profile.phoneNumber}</p>

                        {/* Status Badges */}
                        <div className="flex gap-2 mt-3">
                            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${profile.isVerified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"}`}>
                                {profile.isVerified ? "✓ Verified" : "⏳ Pending"}
                            </span>
                            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${profile.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                {profile.isAvailable ? "🟢 Online" : "⚫ Offline"}
                            </span>
                        </div>
                    </div>

                    {/* Pro Tip Box */}
                    <div className="mx-4 mb-4 bg-amber-50 border border-amber-100 p-3.5 rounded-2xl">
                        <div className="flex items-start gap-2.5">
                            <span className="text-lg">💡</span>
                            <p className="text-[11px] leading-relaxed text-amber-700 font-medium">
                                <span className="font-extrabold text-amber-900 uppercase text-[9px] tracking-wide mr-1">Pro Tip:</span>
                                Stay within <span className="text-[#e23744] font-bold">500m</span> radius of restaurant hotspot to receive orders instantly.
                            </p>
                        </div>
                    </div>

                    {/* Toggle Online/Offline button */}
                    {profile.isVerified && !currentOrder && (
                        <div className="px-4 pb-5">
                            <button
                                onClick={toggleAvailability}
                                disabled={toggling}
                                className={`w-full py-4 rounded-2xl font-extrabold text-white text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-[0.97]
                                    ${toggling
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : profile.isAvailable
                                            ? "bg-gradient-to-r from-slate-700 to-slate-900 shadow-slate-300"
                                            : "bg-gradient-to-r from-[#e23744] to-[#f05a66] shadow-red-200 hover:brightness-105"
                                    }`}
                            >
                                {toggling ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <span>{profile.isAvailable ? "🔴 Go Offline" : "🟢 Go Online"}</span>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Enable sound notification */}
                {!audioUnlocked && (
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🔔</div>
                            <div>
                                <p className="font-bold text-white text-sm">Enable Sound Alerts</p>
                                <p className="text-xs text-blue-100">Get notified for new orders</p>
                            </div>
                        </div>
                        <button
                            onClick={unlockAudio}
                            className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-4 py-2 rounded-xl text-xs shadow transition-all active:scale-95"
                        >
                            Enable
                        </button>
                    </div>
                )}

                {/* incoming new orders */}
                {profile.isAvailable && incomingOrders.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                            <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wide">New Incoming Orders</h3>
                        </div>
                        {incomingOrders.map((id) => (
                            <RiderOrderRequest
                                key={id}
                                orderId={id}
                                onAccepted={() => {
                                    fetchProfile();
                                    fetchCurrentOrder();
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Current Order + Live Map */}
                {currentOrder && (
                    <div className="space-y-4">
                        <RiderCurrentOrder
                            order={currentOrder}
                            onStatusUpdate={fetchCurrentOrder}
                        />
                        {/* rider live map */}
                        <RiderOrderMap
                            order={currentOrder}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiderDashboard;
