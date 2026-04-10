import { useState } from "react";
import type { IOrder } from "../types"
import { ORDER_ACTION } from "../utils/orderflow";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";

interface props {
    order: IOrder;
    onStatusUpdate?: () => void;
}

const statusColor = (status: string) => {
    switch (status) {
        case "placed":
            return "bg-yellow-100 text-yellow-700";
        case "accepted":
            return "bg-orange-100 text-orange-700";
        case "preparing":
            return "bg-blue-100 text-blue-700";
        case "ready_for_rider":
            return "bg-indigo-100 text-indigo-700";
        case "picked_up":
            return "bg-purple-100 text-purple-700";
        case "delivered":
            return "bg-green-100 text-green-700";
        case "cancelled":
            return "bg-red-100 text-red-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
}

const OrderCard = ({ order, onStatusUpdate }: props) => {
    const [loading, setLoading] = useState(false);

    const actions = ORDER_ACTION[order.status] || []; //state machine map 

    const updateStatus = async (status: string) => {
        try {
            setLoading(true);

            await axios.put(`${restaurantService}/api/order/${order._id}`, {
                status
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            toast.success("Order updated");
            onStatusUpdate?.();
        } catch (error:any) {
            toast.error(error.response?.data?.message || "Failed to update order");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div>OrderCard</div>
    )
}

export default OrderCard