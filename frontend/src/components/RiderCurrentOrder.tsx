import axios from "axios";
import type { IOrder } from "../types"
import { riderService } from "../main";
import toast from "react-hot-toast";

interface Props {
    order: IOrder;
    onStatusUpdate: () => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; step: number }> = {
    rider_assigned:   { label: "Rider Assigned",  color: "text-blue-600",   bg: "bg-blue-100",  step: 1 },
    picked_up:        { label: "Picked Up",        color: "text-yellow-600", bg: "bg-yellow-100",step: 2 },
    delivered:        { label: "Delivered",        color: "text-green-600",  bg: "bg-green-100", step: 3 },
};

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
    const updateStatus = async () => {
        try {
            await axios.put(`${riderService}/api/rider/order/update/${order._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            toast.success("Order status updated");
            onStatusUpdate();
        } catch (error: any) {
            toast.error(error.response.data.message)
            console.log(error);
        }
    }

    const currentStatusInfo = statusConfig[order.status] ?? { label: order.status, color: "text-gray-600", bg: "bg-gray-100", step: 0 };

    return (
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#e23744] to-[#f05a66] px-5 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="font-bold text-white text-base tracking-wide">Current Order</h1>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm`}>
                        #{order._id?.slice(-6).toUpperCase()}
                    </span>
                </div>

                {/* Progress Steps */}
                <div className="mt-4 flex items-center gap-0">
                    {["Assigned", "Picked Up", "Delivered"].map((step, i) => {
                        const done = currentStatusInfo.step > i;
                        const active = currentStatusInfo.step === i + 1;
                        return (
                            <div key={step} className="flex items-center flex-1">
                                <div className="flex flex-col items-center gap-1">
                                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                                        ${done ? "bg-white border-white text-[#e23744]" :
                                          active ? "bg-white/30 border-white text-white" :
                                          "bg-transparent border-white/40 text-white/40"}`}>
                                        {done ? "✓" : i + 1}
                                    </div>
                                    <span className={`text-[9px] font-semibold whitespace-nowrap ${active ? "text-white" : "text-white/50"}`}>
                                        {step}
                                    </span>
                                </div>
                                {i < 2 && (
                                    <div className={`h-0.5 flex-1 mx-1 mb-4 rounded-full transition-all ${done ? "bg-white" : "bg-white/25"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* pickup,drop,total details */}
            <div className="px-5 py-4 space-y-3">
                {/* Pickup & Drop route visual */}
                <div className="flex gap-3">
                    <div className="flex flex-col items-center pt-1 gap-1">
                        <div className="w-3 h-3 rounded-full bg-[#e23744] border-2 border-red-200" />
                        <div className="w-0.5 h-6 bg-dashed bg-gray-300 border-l-2 border-dashed border-gray-300" />
                        <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-200" />
                    </div>
                    <div className="flex flex-col justify-between flex-1 gap-3">
                        <div>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Pickup</p>
                            <p className="text-sm font-semibold text-gray-800">{order.restaurantName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Delivery</p>
                            <p className="text-sm font-medium text-gray-600 leading-snug">{order.deliveryAddress?.formattedAddress}</p>
                        </div>
                    </div>
                </div>

                {/* Earnings & Total strip */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Order Total</p>
                        <p className="text-lg font-bold text-gray-800">₹{order.totalAmount}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wide">Your Earning</p>
                        <p className="text-lg font-bold text-green-700">₹{order.riderAmount}</p>
                    </div>
                </div>

                {/* customer contact number  */}
                {
                    order.deliveryAddress.mobile && (
                        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-base">👤</div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Customer</p>
                                    <p className="font-bold text-gray-800 text-sm">{order.deliveryAddress.mobile}</p>
                                </div>
                            </div>
                            <a
                                href={`tel:${order.deliveryAddress.mobile}`}
                                className="flex items-center gap-1.5 text-white bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-bold px-4 py-2 rounded-xl text-sm shadow-sm shadow-blue-200 transition-all"
                            >
                                📞 Call
                            </a>
                        </div>
                    )
                }

                {/* rider update the status here */}
                <div className="space-y-2 pt-1">
                    {
                        order.status === "rider_assigned" && (
                            <button
                                className="w-full bg-linear-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-xl py-3.5 font-bold text-sm shadow-md shadow-yellow-200 transition-all active:scale-95"
                                onClick={() => updateStatus()}
                            >
                                🏍️ Reached Restaurant
                            </button>
                        )
                    }

                    {
                        order.status === "picked_up" && (
                            <button
                                className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl py-3.5 font-bold text-sm shadow-md shadow-green-200 transition-all active:scale-95"
                                onClick={() => updateStatus()}
                            >
                                ✅ Mark as Delivered
                            </button>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default RiderCurrentOrder