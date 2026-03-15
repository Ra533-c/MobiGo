import { useLocation, useSearchParams, Link } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";


const Navbar = () => {
    const { isAuth, city } = useAppData();
    const currLocation = useLocation();

    const isHomePage = currLocation.pathname === "/";
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");

    // debouncing concept is using here ->👇
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search) {
                setSearchParams({ search });
            } else {
                setSearchParams({});
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className="w-full bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                <Link
                    to={'/'}
                    className="text-2xl font-bold text-[#e23744] cursor-pointer"
                >
                    MobiGo
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        to={'/cart'}
                        className="relative"
                    >
                        <CgShoppingCart className="h-6 w-6 text-[#e23744]"></CgShoppingCart>
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e23744] text-xs font-semibold text-white" >5</span>
                    </Link>

                    {
                        isAuth ? (
                            <Link to={'/account'} className="font-medium text-[#e23744]">Account</Link>
                        ) : (
                            <Link to={'/login'} className="font-medium text-[#e23744]">Login</Link>)
                    }

                </div>
            </div>
            {/* Search bar */}
            {
                isHomePage && <div className="border-t px-4 py-3">
                    <div className="mx-auto flex max-w-7xl items-center rounded-lg  border shadow-sm">
                        <div className="flex items-center gap-2 px-3 border-r text-gray-700">
                            <BiMapPin className="h-4 w-4 text-[#e23744]" />
                            <span className="text-sm truncate max-w-75">{city}</span>
                        </div>
                        <div className="flex flex-1 items-center gap-2 px-3">
                            <BiSearch className="w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search for restaurant" value={search} onChange={e => setSearch(e.target.value)} className="w-fll py-2 text-sm outline-none" />
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default Navbar