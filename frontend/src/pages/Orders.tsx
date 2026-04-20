import { useNavigate } from "react-router-dom";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";
import { useEffect, useState } from "react";

const ACTIVE_STATUSES = [
    "placed",
    "accepted",
    "preparing",
    "ready_for_rider",
    "rider_assigned",
    "picked_up",
];

const Orders = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { socket } = useSocket();

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/order/my`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setOrders(data.orders || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // socket realtime order status update
    useEffect(() => {
        if (!socket) return;

        const onOrderUpdate = () => {
            fetchOrders();
        };

        socket.on("order:update", onOrderUpdate);

        return () => {
            socket.off("order:update", onOrderUpdate);
        };
    }, [socket]);

    if (loading) {
        return <p className="text-center text-gray-500">Loading orders...</p>;
    }

    if (orders.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-gray-500">No orders yet.</p>
            </div>
        );
    }

    const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
    const completedOrder = orders.filter(
        (o) => !ACTIVE_STATUSES.includes(o.status),
    );

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
            <h1 className="text-2xl font-bold">My Orders</h1>

            {/* Active order section */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Active Orders</h2>

                {activeOrders.length === 0 ? (
                    <p className="">No Active Orders yet.</p>
                ) : (
                    activeOrders.map((order) => (
                        <OrderRow
                            key={order._id}
                            order={order}
                            onClick={() => navigate(`/order/${order._id}`)}
                        />
                    ))
                )}
            </section>

            {/* completed order section */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Completed Orders</h2>

                {completedOrder.length === 0 ? (
                    <p className="">No Completed Orders yet.</p>
                ) : (
                    completedOrder.map((order) => (
                        <OrderRow
                            key={order._id}
                            order={order}
                            onClick={() => navigate(`/order/${order._id}`)}
                        />
                    ))
                )}
            </section>
        </div>
    );
};

export default Orders;

// component OrderRow ->
const OrderRow = ({
    order,
    onClick,
}: {
    order: IOrder;
    onClick: () => void;
}) => {
    return (
        <div
            className="cursor-pointer rounded-xl bg-white p-4 shadow-sm hover:bg-gray-50"
            onClick={onClick}
        >
            {/* order id and status */}
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Order: #{order._id.slice(-6)}</p>
                <span className="text-xs text-gray-500 capitalize">{order.status}</span>
            </div>

            {/* order items */}
            <div className="mt-2 text-sm text-gray-600">
                {
                    order.items.map((item, i) => (
                        <span key={i}>
                            {item.name} x {item.quantity}
                            {i < order.items.length - 1 && ", "}
                        </span>
                    ))
                }
            </div>

            {/* total amount */}
            <div className="mt-2 flex justify-between text-sm font-medium">
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
            </div>
        </div>
    );
};
