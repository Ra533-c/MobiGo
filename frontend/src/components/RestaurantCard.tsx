import { useNavigate } from "react-router-dom";

type props = {
    id: string;
    name: string;
    image: string;
    distance: string;
    isOpen: boolean;
};

const RestaurantCard = ({ id, image, name, distance, isOpen }: props) => {
    const navigate = useNavigate();

    if (!image || !name || !distance || isOpen === undefined) {
        console.log("image", image);
        console.log("name", name);
        console.log("distance", distance);
        console.log("isOpen", isOpen);
        return;
    }
    return (
        <div
            className={`cursor-pointer overflow-hidden bg-white rounded-xl shadow-sm transition hover:shadow-md ${!isOpen ? "opacity-80" : ""}`}
            onClick={() => navigate(`/restaurant/${id}`)}
        >
            {/* image of the restaurant */}
            <div className="relative h-40 w-full overflow-hidden">
                <img
                    src={image}
                    className={`h-full w-full object-cover transition duration-300 hover:scale-105 ${isOpen ? "" : "grayscale"}`}
                    alt=""
                />

                {!isOpen && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <span className="rounded-lg px-3 py-1 font-medium text-4xl text-white">
                            CLOSED
                        </span>
                    </div>
                )}
            </div>

            {/* name and distance of restaurant */}
            <div className="p-3 space-y-1">
                <h3 className="truncate text-base font-semibold text-gray-800">{name}</h3>
                <p className="text-sm text-gray-500">{distance} KM away</p>
            </div>
        </div>
    );
};

export default RestaurantCard;
