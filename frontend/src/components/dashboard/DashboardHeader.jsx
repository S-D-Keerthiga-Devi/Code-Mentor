import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {userDetails} from '../../api/user.js'
import { logout, updateUser } from "../../store/authSlice.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUserCircle } from "react-icons/fa";
import { logoutUser } from "../../api/auth.js";

export default function DashboardHeader() {
  const { userData } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ Fetch fresh user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await userDetails();
        if (res?.success) {
          dispatch(updateUser(res.userData));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    };
    fetchUserData();
  }, [dispatch]);

  // ✅ Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-menu")) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      const res = await logoutUser();

      if (res?.success) {
        dispatch(logout());
        localStorage.removeItem("token");
        toast.success(res.message || "Logout successful");
        navigate("/");
      } else {
        toast.success(res.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">
        Hey, {userData?.name || "Student"} 👋
      </h1>

      {/* Profile Menu */}
      <div className="relative profile-menu">
        <FaUserCircle
          size={32}
          className="cursor-pointer text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        />

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
            {/* Verify Email option */}
            {userData?.isAccountVerified ? (
              <p className="block w-full text-left px-4 py-2 text-green-600">
                ✅ Email Verified
              </p>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/email-verify");
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Verify Email
              </button>
            )}

            {/* Logout option */}
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
