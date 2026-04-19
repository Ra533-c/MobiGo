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
    "picked_up"
]

const Orders = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { socket } = useSocket();

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/order/my`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setOrders(data.Orders || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div>Orders</div>
    )
}

export default Orders