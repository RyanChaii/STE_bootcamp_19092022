import React from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  // Navigation
  const navigate = useNavigate();
  // Logout user
  function logoutUser() {
    sessionStorage.clear();
    navigate("/");
  }
  // View and edit user profile
  function userProfile() {
    navigate("/userprofile");
  }

  return (
    <header className="header-bar mb-3" style={{ backgroundColor: "black" }}>
      <div className="container d-flex flex-column flex-md-row align-items-center p-3">
        <h1 className="my-0 mr-md-auto font-weight-normal">
          <a href="/dashboard" className="text-white">
            {" "}
            TMS{" "}
          </a>
        </h1>
        <div className="mb-0 pt-2 pt-md-0">
          <div className="row align-items-center">
            <div className="col-md-auto">
              <button onClick={userProfile} className="btn" style={{ backgroundColor: "#C8B241", color: "white" }}>
                Profile
              </button>
            </div>

            <div className="col-md-auto">
              <button onClick={logoutUser} className="btn btn-danger ">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
