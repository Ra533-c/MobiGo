import { LuEye, LuEyeClosed } from "react-icons/lu";
import type { IMenuItems } from "../types";
import { useState } from "react";
import { CgLoadbar, CgTrash } from "react-icons/cg";
import { LoaderIcon } from "react-hot-toast";
import { BiSolidCartAdd } from "react-icons/bi";

interface MenuItemsProps {
  items: IMenuItems[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItems = ({ items, onItemAdded, isSeller }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grod-cols-4">
      {
        items.map((item) => {
          const isLoading = loadingItemId === item._id;
          return <div className={`relative flex gap-4 rounded-lg bg-white p-4 shadow-sm transition ${!item.isAvailable ? "opacity-70" : ""}`}>
            {/* image container */}
            <div className="relative shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className={`h-20 w-20 ronunded object-cover ${!item.isAvailable ? "grayscale brightness-75" : ""}`}
              />
              {
                !item.isAvailable && <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-semibold text-white">OUT OF STOCK</span>
              }
            </div>

            {/* name and desc container */}
            <div className="flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                {
                  item.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                  )
                }
              </div>

              {/* price and action buttons container */}
              <div className="flex items-center justify-between">
                <p className="font-medium">₹{item.price}</p>

                {/* eye icon to make item available or unavailable */}
                {
                  isSeller && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { }}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                      >
                        {item.isAvailable ? <LuEye size={18} /> : <LuEyeClosed size={18} />}
                      </button>

                      <button
                        onClick={() => { }}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <CgTrash size={18} />
                      </button>
                    </div>
                  )
                }

                {
                  !isSeller && (
                    <button
                      disabled={!item.isAvailable || isLoading}
                      className={`flex items-center justify-center p-2 rounded-lg ${!item.isAvailable || isLoading ? "cursor-not-allowed text-gray-400" : "text-red-500 hover:bg-red-50"}`}
                      onClick={()=>{}}
                    >
                      {
                        isLoading ? <CgLoadbar size={18} className="animate-spin"/> : <BiSolidCartAdd size={18} />
                      }
                    </button>
                  )
                }
              </div>
            </div>
          </div>
        })
      }
    </div >
  )
}

export default MenuItems;