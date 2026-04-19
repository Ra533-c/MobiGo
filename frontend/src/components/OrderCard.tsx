import { useState } from "react";
import type { IOrder } from "../types";
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
      return "bg-pink-100 text-pink-700";
    case "picked_up":
      return "bg-purple-100 text-purple-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const OrderCard = ({ order, onStatusUpdate }: props) => {
  const [loading, setLoading] = useState(false);

  const actions = ORDER_ACTION[order.status] || []; //state machine map

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);

      await axios.put(
        `${restaurantService}/api/order/${order._id}`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success("Order updated");
      onStatusUpdate?.(); //onStatusUpdate={fetchOrders} call in @RestaurantOrders
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Order #{order._id.slice(-6)}</p>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(order.status)}`}
        >
          {order.status.replaceAll("_", " ")}{" "}
          {/*for replacing _ with space e.g. picked_up -> picked up*/}
        </span>
      </div>

      {/* items  */}
      <div className="text-sm text-gray-600 space-y-1">
        {order.items.map((item, i) => (
          <p key={i} className="">
            {item.name} x {item.quantity}
          </p>
        ))}
      </div>

      {/* total */}
      <div className="flex justify-between text-sm font-medium">
        <span>Total</span>
        <span>₹{order.totalAmount}</span>
      </div>

      <p className="text-xs text-gray-400">
        Payment: {order.paymentStatus.replaceAll("_", " ")}
      </p>

      {/* action btn to change the order status */}
      {order.paymentStatus === "paid" && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {actions.map((status) => (
            <button
              className="rounded-lg bg-[#e23744] px-3 py-2 text-xs text-white hover:bg-[#d32f3a] disabled:opacity-50 cursor-pointer"
              key={status}
              disabled={loading}
              onClick={() => updateStatus(status)}
            >
                Mark as {status.replaceAll("_"," ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
