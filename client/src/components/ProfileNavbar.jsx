import {
  faArrowAltCircleRight,
  faArrowRightFromBracket,
  faBell,
  faBellConcierge,
  faDoorClosed,
  faMailBulk,
  faMailForward,
  faMessage,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProfileNavbar = () => {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="nav">
      <div className="notification-bell">
        <FontAwesomeIcon icon={faBell} id="notification-icon" />
        <div className="notification-dot"></div>
      </div>
      <div id="username">
        <div>Logged in as</div>
        {currentUser.name}
      </div>
      <FontAwesomeIcon icon={faUser} id="profile-icon" />
    </div>
  );
};

export default ProfileNavbar;
