import axios from "axios";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import { riderService } from "../main";
import toast, { LoaderIcon } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { BiUpload } from "react-icons/bi";
import type { IOrder } from "../types";
import audio from "../assets/not2.mp3";

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
        <div className="space-y-4">
            <div className="mx-auto max-w-md px-4 py-4">

                {/* rider info card */}
                <div className="rounded-2xl bg-white p-6 shadow-xl border border-gray-100 space-y-4">
                    {/* Rider Info Section */}
                    <div className="flex flex-col items-center">
                        <img
                            className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-50 shadow-md"
                            src={profile.picture}
                            alt="rider_image"
                        />
                        <h2 className="mt-4 text-lg font-bold text-gray-800 tracking-tight">{user?.name}</h2>
                        <p className="text-xs font-medium text-gray-400">{profile.phoneNumber}</p>
                    </div>

                    {/* Status Badges Section */}
                    <div className="flex justify-center gap-3">
                        <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${profile.isVerified ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                            {profile.isVerified ? "Verified" : "Pending"}
                        </span>

                        <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${profile.isAvailable ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"}`}>
                            {profile.isAvailable ? "Online" : "Offline"}
                        </span>
                    </div>

                    {/* Pro Tip Box Section */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mt-4">
                        <div className="flex items-start gap-3">
                            <span className="text-sm">💡</span>
                            <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                                <span className="font-bold text-slate-900 uppercase text-[9px] tracking-tighter mr-1">Pro Tip :</span>
                                Stay within <span className="text-blue-600 font-bold">500m</span> radius of restaurant hotspot to receive orders instantly.
                            </p>
                        </div>

                        {/* toggle btn to go online & offline */}
                        <button
                            onClick={toggleAvailability}
                            disabled={toggling}
                            className={`w-full py-3.5 rounded-xl font-bold text-white tracking-wide transition-all duration-300 transform flex items-center justify-center gap-2 mt-4
                                ${toggling
                                    ? "bg-slate-400 cursor-not-allowed opacity-70"
                                    : profile.isAvailable
                                        ? "bg-linear-to-r from-slate-600 to-slate-800 shadow-lg shadow-slate-200 active:scale-95"
                                        : "bg-linear-to-r from-[#e23744] to-[#f05a66] shadow-lg shadow-red-200 active:scale-95 hover:brightness-110"
                                }`}
                        >
                            {toggling ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <span>{profile.isAvailable ? "🔴 Go Offline" : "🟢 Go Online"}</span>
                                </>
                            )}
                        </button>

                    </div>
                </div>
            </div>

            {/* Enable sound notification button */}
            {!audioUnlocked && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🔔</span>
                        <div>
                            <p className="font-medium text-blue-900">
                                Enable Sound Notification
                            </p>
                            <p className="text-sm text-blue-700">
                                Get notified when new orders arrive
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={unlockAudio}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                        Enable Sound
                    </button>
                </div>
            )}

            {/* incoming new orders */}
            {
                profile.isAvailable && (incomingOrders.length > 0) &&
                (
                    <div className="mx-auto max-w-md px-4 space-y-3">
                        <h3 className="font-semibold text-gray-700">Incoming Orders</h3>
                        {
                            incomingOrders.map((id) => (
                                <p key={id} className="">"OrderId":{id}</p>
                            ))
                        }
                    </div>
                )
            }
        </div>
    );
};

export default RiderDashboard;
