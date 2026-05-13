import axios from "axios";
import { adminService } from "../main";
import { useEffect, useState } from "react";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import AdminRiderCard from "../components/AdminRiderCard";

const Admin = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [, setCounts] = useState({ restaurants: 0, riders: 0 });
  const [riders, setRiders] = useState<any[]>([]);

  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"restaurants" | "riders">("restaurants");

  const fetchData = async () => {
    try {
      // fetching pending restaurants
      const { data } = await axios.get(`${adminService}/api/v1/admin/restaurant/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      )

      // fetching pending riders
      const response = await axios.get(`${adminService}/api/v1/admin/rider/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      )
      console.log("Fetched pending restaurants : ", data);
      console.log("Fetched pending riders : ", response.data);
      setRiders(response.data.riders);
      setRestaurants(data.restaurants);
      setCounts((prev) => {
        return {
          ...prev,
          riders: response.data.count,
          restaurants: data.count
        }
      });

    } catch (error) {
      console.log("Error while fetching pending riders and restaurants :", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading admin's panel...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* tabs for restaurants and riders  */}
      <div className="flex gap-4">
        <button
          onClick={() => setTab("restaurants")}
          className={`px-4 py-2 rounded ${tab === "restaurants" ? "bg-red-500 text-white" : "bg-gray-200 text-black"}`}
        >
          Restaurant
        </button>

        <button
          onClick={() => setTab("riders")}
          className={`px-4 py-2 rounded ${tab === "riders" ? "bg-red-500 text-white" : "bg-gray-200 text-black"}`}
        >
          Riders
        </button>
      </div>

      {/* showing pending restaurants */}
      {
        tab === "restaurants" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {
              restaurants.length === 0 ? (
                <p className="text-gray-500">No pending restaurants to approve.</p>
              ) : (
                restaurants.map((r) => (
                  <AdminRestaurantCard key={r._id} restaurant={r} onVerify={fetchData} />
                ))
              )
            }
          </div>
        )
      }

      {/* showing pending riders*/}
      {
        tab === "riders" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {
              riders.length === 0 ? (
                <p className="text-gray-500">No pending riders to approve.</p>
              ) : (
                riders.map((r) => (
                  <AdminRiderCard rider={r} key={r._id} onVerify={fetchData} />
                ))
              )
            }
          </div>
        )
      }



    </div>
  )
}

export default Admin