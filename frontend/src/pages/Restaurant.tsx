import { useEffect, useState } from "react";
import { type IMenuItems, type IRestaurant } from "../types.js";
import axios from "axios";
import { restaurantService } from "../main";
import AddRestaurant from "../components/AddRestaurant.js";
import RestaurantProfile from "../components/RestaurantProfile.js";
import MenuItems from "../components/MenuItems.js";
import AddMenuItem from "../components/AddMenuItem.js";
import RestaurantOrders from "../components/RestaurantOrders.js";

type sellerTab = "menu" | "add-item" | "sales";

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<sellerTab>("menu");

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/restaurant/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setRestaurant(data.restaurant || null);
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurant()
  }, []);

  const [menuItems, setMenuItems] = useState<IMenuItems[]>([]);

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/item/all/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setMenuItems(data.items);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (restaurant?._id) {
      fetchMenuItems(restaurant._id);
    }
  }, [restaurant])

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center"><p className="text-gray-500">Loading your restaurant...</p></div>
    );

  if (!restaurant) {
    return <>
      <AddRestaurant fetchMyRestaurants={fetchMyRestaurant} />
    </>
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">

        {/* Restaurant Profile */}
        <RestaurantProfile
          restaurant={restaurant}
          onUpdate={setRestaurant}
          isSeller={true}
        />

        {/* restaurantOrders */}
        <RestaurantOrders restaurantId={restaurant._id} />

        {/* Tabs for menu, add items, and sales */}
        <div className="rounded-xl bg-white shadow-sm">
          <div className="border-b flex">
            {
              [
                { key: "menu", label: "Menu Items" },
                { key: "add-item", label: "Add Item" },
                { key: "sales", label: "Sales" },
              ].map((t) =>
              (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as sellerTab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition ${tab === t.key ? "border border-b-2 border-red-500 text-red-500" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {
                    t.label
                  }
                </button>
              )
              )
            }
          </div>

          {/* content page */}
          <div className="p-5">
            {
              tab === "menu" && (<MenuItems
                items={menuItems}
                onItemDeleted={() => fetchMenuItems(restaurant._id)}
                isSeller={true}
              />)
            }
            {
              tab === "add-item" && (<AddMenuItem onItemAdded={() => fetchMenuItems(restaurant._id)} />)
            }
            {
              tab === "sales" && (<p>Sales Page</p>)
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default Restaurant;