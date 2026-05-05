import { useParams } from "react-router-dom"
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import UserOrderMap from "../components/UserOrderMap";

const OrderPage = () => {
    const { id } = useParams();
    const { socket } = useSocket();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<IOrder | null>(null);

    const fetchOrder = async () => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/order/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            setOrder(data.order || null);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOrder();
    }, [id]);

    // realtime status update using socket io and socket.on event
    useEffect(() => {
        if (!socket) return;

        const onOrderUpdate = () => {
            fetchOrder()
        }

        socket.on("order:update", onOrderUpdate);
        socket.on("order:rider_assigned", onOrderUpdate);

        return () => {
            socket.off("order:update", onOrderUpdate);
            socket.off("order:rider_assigned", onOrderUpdate);
        }
    }, [socket]);

    useEffect(() => {
        if (!socket || !id) return;

        socket.emit("join", `user:${id}`);

        return () => {
            socket.emit("leave", `user:${id}`);
        }
    }, [socket, id]);

    // when rider update its live location 

    const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (!socket) return;

        console.log("✅ User Socket Connected:", socket.id);
        console.log("🏠 Joining Room:", `user:${id}`);

        const onRiderLocation = ({ latitude, longitude }: any) => {
            console.log("Rider Location", latitude, longitude);
            setRiderLocation([latitude, longitude]);
        }

        socket.on("rider:location", onRiderLocation);

        return () => {
            socket.off("rider:location", onRiderLocation);
        }
    }, [socket]);


    if (loading) {
        return <p className="text-center text-gray-500">Loading order details...</p>
    }

    if (!order) {
        return <p className="text-center text-gray-500">No Order yet.</p>
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
            <h1 className="text-xl font-bold">Order #{order._id.slice(-6)}</h1>

            {/* order status */}
            <div className="rounded-lg bg-blue-50 p-3 text-sm font-medium">
                Status: <span className="capitalize">{order.status}</span>
            </div>

            {/* order items */}
            <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
                <h2 className="font-semibold">Items</h2>

                {
                    order.items.map((item, i) => (
                        <div className="flex justify-between text-sm" key={i}>
                            <span>{item.name} x {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                        </div>
                    ))
                }
            </div>

            {/* delivery address */}
            <div className="rounded-xl bg-white p-4 shadow-sm space-y-1">
                <h2 className="font-semibold">Delivery Address</h2>
                <p className="text-sm text-gray-600">{order.deliveryAddress.formattedAddress}</p>
                <p className="text-sm text-gray-600">Mobile No.  {order.deliveryAddress.mobile}</p>
            </div>

            {/* order summary */}
            <div className="rounded-xl p-4 bg-white shadow-sm space-y-2">
                <div className="flex justify-between text-sm">
                    <span>SubTotal</span> <span>₹{order.subTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span> <span>₹{order.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Platform Fee</span> <span>₹{order.platformFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Total Amount</span> <span>₹{order.totalAmount}</span>
                </div>
            </div>

            <p className="text-xs text-gray-500">Payment Method: {order.paymentMethod}</p>
            <p className="text-xs text-gray-500">Payment Status: {order.paymentStatus}</p>


            {/* show map to user/customer when rider assigned or picked_up */}
            {
                (order.status.toLowerCase() === "rider_assigned" || order.status.toLowerCase() === "picked_up") &&
                (
                    riderLocation ? (
                        <UserOrderMap
                            riderLocation={riderLocation}
                            deliveryLocation={[order.deliveryAddress.latitude, order.deliveryAddress.longitude]}
                        />
                    ) : (
                        <p className="">Waiting for rider location...</p>
                    )
                )
            }

        </div>
    )
}

export default OrderPage