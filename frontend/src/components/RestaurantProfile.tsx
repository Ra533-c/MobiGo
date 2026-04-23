import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiEdit, BiMapPin, BiSave } from "react-icons/bi";
import { useAppData } from "../context/AppContext";

interface props {
    restaurant: IRestaurant;
    isSeller: boolean;
    onUpdate: (restaurant: IRestaurant) => void;
}
const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: props) => {
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(restaurant.name);
    const [description, setDescription] = useState(restaurant.description);
    const [address, setAddress] = useState(restaurant.address);
    const [phone, setPhone] = useState(restaurant.phone);
    const [image, setImage] = useState(restaurant.image);
    const [isOpen, setIsOpen] = useState(restaurant.isOpen);
    const [loading, setLoading] = useState(false);

    const toggleOpenStatus = async () => {
        try {
            const { data } = await axios.put(
                `${restaurantService}/api/restaurant/status`,
                { status: !isOpen },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            toast.success(data.message);
            setIsOpen(data.restaurant.isOpen);
        } catch (error: any) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    };

    const saveChanges = async () => {
        try {
            setLoading(true);
            const { data } = await axios.put(
                `${restaurantService}/api/restaurant/edit`,
                { name, description },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            toast.success("Restaurant updated successfully");
            onUpdate(data.restaurant);
            setEditMode(false);
        } catch (error) {
            console.log(error);
            toast.error("Failed to update restaurant");
        } finally {
            setLoading(false);
        }
    };

    const { setIsAuth, setUser } = useAppData();

    const logoutHandler = async () => {
        await axios.put(
            `${restaurantService}/api/restaurant/status`,
            { status: false },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
        );
        localStorage.setItem("token", "");
        setIsAuth(false);
        setUser(null);
        toast.success("Logged out successfully")
    }
    return (
        <div className="mx-auto max-w-xl rounded-lg bg-white shadow-sm overflow-hidden">
            {
                restaurant.image && (
                    <img
                        src={restaurant.image}
                        className="h-48 w-full object-cover"
                        alt="restaurant image"
                    />
                )
            }

            {/*This is for the name and address of the restaurant*/}
            {/* if edit mode is true then show the input field for the name and address of the restaurant*/}
            {/* otherwise show the name and address of the restaurant*/}
            <div className="p-5 space-y-4">
                {/* showing restaurant name for customer */}
                {
                    <div className="flex items-start justify-between">
                        <div>
                            {
                                editMode ? (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded border px-2 py-1 text-2xl font-semibold"
                                    />
                                ) : (
                                    <h2 className="text-2xl font-semibold">{restaurant.name}</h2>
                                )
                            }
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                <BiMapPin className="h-4 w-4 text-red-500" />
                                {restaurant.autoLocation.formattedAddress ||
                                    "Location unavailable"}
                            </div>
                        </div>

                        {/* only seller can see the edit btn */}
                        {
                            isSeller && (
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    className="text-gray-500 hover:text-black"
                                >
                                    <BiEdit size={18} />
                                </button>
                            )
                        }
                    </div>
                }

                {/*Here we are showing the description of the restaurant*/}
                {
                    editMode ? (
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded border px-3 py-2 text-sm"
                        />
                    ) : (
                        <p className="text-sm text-gray-600">
                            {restaurant.description || "No description added"}
                        </p>
                    )
                }

                {/* Open/Closed Status */}
                <div className="flex items-center justify-between pt-3 border-t">
                    <span
                        className={`text-sm font-medium ${isOpen ? "text-green-600" : "text-red-500"}`}
                    >
                        {isOpen ? "OPEN" : "CLOSED"}
                    </span>
                    <div className="flex gap-3">
                        {
                            editMode && (
                                <button
                                    onClick={saveChanges}
                                    disabled={loading}
                                    className={`flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    <BiSave size={16} />
                                    Save
                                </button>
                            )
                        }

                        {/* btn to actually open and close the restaurant */}
                        {
                            isSeller && (
                                <button
                                    onClick={toggleOpenStatus}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-lg text-white ${isOpen ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                                >
                                    {isOpen ? "Close Restaurant" : "Open Restaurant"}
                                </button>
                            )
                        }

                        {/* logout btn */}
                        {
                            isSeller && (
                                <button
                                    onClick={logoutHandler}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 cursor-pointer`}
                                >
                                    Logout
                                </button>
                            )
                        }
                    </div>
                </div>

                <p className="text-xs text-gray-400">
                    Created on {new Date(restaurant.createdAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

export default RestaurantProfile;
