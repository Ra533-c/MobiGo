import axios from "axios";
import type { IOrder } from "../types"
import { riderService } from "../main";
import toast from "react-hot-toast";

interface Props {
    order: IOrder;
    onStatusUpdate: () => void;
}

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
            toast.success("Order statusupdated");
            onStatusUpdate();
        } catch (error: any) {
            toast.error(error.response.data.message)
            console.log(error);
        }
    }
    return (
        <div className="rounded-xl bg-white shadow-sm p-4 space-y-4">
            <h1 className="font-semibold text-gray-800">Current Order</h1>

            {/* pickup,drop,total details */}
            <div className="text-gray-600 space-y-1">
                <p className="">
                    <b>Pickup: </b>
                    {order.restaurantName}
                </p>
                <p>
                    <b>Drop: </b>
                    {order.deliveryAddress?.formattedAddress}
                </p>
                <p>
                    <b>Total: </b>
                    ₹{order.totalAmount}
                </p>
                <p>
                    <b>Your Earning: </b>
                    ₹{order.riderAmount}
                </p>
                <p>
                    <b>Status: </b>
                    <span className="capitalize text-blue-600">{order.status.replace("_", " ")}</span>
                </p>
            </div>

            {/* customer contact number  */}
            {
                order.deliveryAddress.mobile && (
                    <div className="flex items-center justify-between rounded-lg border  p-2">
                        <div className="text-sm">
                            <p className="text-gray-500">Customer Contact Number</p>
                            <p className="font-semibold text-gray-800">{order.deliveryAddress.mobile}</p>
                        </div>
                        <div>
                            <a href={`tel:${order.deliveryAddress.mobile}`} className="text-blue-600 font-semibold px-4 py-2 rounded-lg text-sm">Call</a>
                        </div>
                    </div>
                )
            }

            {/* rider update the status here */}
            <div className="space-y-2">
                {
                    order.status === "rider_assigned" && (
                        <button
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg py-2 font-semibold"
                            onClick={() => updateStatus()}
                        >
                            Reached Restaurant
                        </button>
                    )
                }

                {
                    order.status === "picked_up" && (
                        <button
                            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-2 font-semibold"
                            onClick={() => updateStatus()}
                        >
                            Mark as Delivered
                        </button>
                    )
                }
            </div>
        </div>
    )
}

export default RiderCurrentOrder