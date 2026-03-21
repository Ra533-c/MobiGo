import type { IRestaurant } from "../types"

interface props {
    restaurant: IRestaurant;
}
const RestaurantProfile = ({ restaurant }: props) => {
    return (
        <div className="mx-auto max-w-xl rounded-lg bg-white shadow-sm overflow-hidden">
            {
                restaurant.image && (
                    <img
                        src={restaurant.image}
                        className="h-48 w-full object-cover"
                        alt="restaurant image"
                    />)
            }
        </div>
    )
}

export default RestaurantProfile