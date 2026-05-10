import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";


const AdminRiderCard = ({
    rider,
    onVerify
}: {
    rider: any;
    onVerify: () => void;
}) => {

    const verify = async () => {
        try {
            await axios.patch(`${adminService}/api/v1/verify/rider/${rider._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            toast.success("Rider verified successfully");
            onVerify();
        } catch (error) {
            console.error(error);
            toast.error("Failed to verify rider");
        }
    };

    return (
        <div className="rounded-xl bg-white p-4 shadow space-y-2">
            <img
                src={rider.picture}
                alt={rider.name}
                className="h-40 w-full object-cover rounded"
            />
            <h3 className="font-bold text-lg">{rider.name}</h3>
            <p className="text-gray-500">Phone: {rider.phoneNumber}</p>
            <p className="text-gray-500">{rider.email}</p>
            <p className="text-gray-500">Aadhar No: {rider.aadharNumber}</p>
            <p className="text-gray-500">DL No: {rider.drivingLicenseNumber}</p>

            <button
                className="w-full rounded bg-green-500 py-2 text-white hover:bg-green-600 transition-colors"
                onClick={verify}
            >
                Verify Rider
            </button>
        </div>
    );
};

export default AdminRiderCard;