import {
  faArrowAltCircleRight,
  faArrowRightFromBracket,
  faBars,
  faBell,
  faBellConcierge,
  faClock,
  faDoorClosed,
  faInfo,
  faInfoCircle,
  faMagicWandSparkles,
  faMailBulk,
  faMailForward,
  faMessage,
  faStar,
  faStarOfLife,
  faUser,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { Sparkle, SparkleIcon, Sparkles, SparklesIcon } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

const ProfileNavbar = ({ deadlineCounts, pr }) => {
  const {
    currentUser,
    setWritingToolsMode,
    showNavbarInMobile,
    setShowNavbarInMobile,
  } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const latestRequisition = pr[0];
  return (
    <div className="nav">
      <FontAwesomeIcon
        icon={faBars}
        id="hamburger"
        className="icon"
        onClick={() =>
          setShowNavbarInMobile((showNavbarInMobile) => !showNavbarInMobile)
        }
      />
      <div
        className="notification-bell"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <FontAwesomeIcon
          icon={faBell}
          id="notification-icon"
          className="icon"
        />
        <div className="notification-dot"></div>
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              className="notification-panel"
              initial={{
                opacity: 0,
                translateY: -100,
                translateX: -100,
                scale: 0.4,
              }}
              animate={{ opacity: 1, translateY: 0, translateX: 0, scale: 1 }}
              exit={{
                opacity: 0,
                translateY: -100,
                translateX: -100,
                scale: 0.4,
              }}
            >
              <header>
                <p>Notifications</p>
                <span onClick={() => setShowNotifications(false)}>Close</span>
              </header>
              <div className="notification-container">
                <div className="latest-title">Latest</div>
                <div className="notification new new-requisition">
                  <div className="created-by-initial">
                    {latestRequisition.username[0]}
                  </div>
                  <div className="new-requisition-details">
                    <strong>{latestRequisition.username}</strong> created a new
                    requisition (id){" "}
                    <span className="requisition_id">
                      {latestRequisition.created_at
                        .split("T")[0]
                        .replace(/[^a-zA-Z0-9]/g, "") +
                        latestRequisition.requisition_id}
                    </span>
                    <div className="date">
                      {new Date(latestRequisition.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                {deadlineCounts.green > 0 && (
                  <div className="notification">
                    <strong>{deadlineCounts.green}</strong> requisitions require
                    action
                  </div>
                )}
                {deadlineCounts.yellow > 0 && (
                  <div className="notification">
                    <strong>{deadlineCounts.yellow}</strong> requisitions
                    require immediate action
                  </div>
                )}
                {deadlineCounts.red > 0 && (
                  <div className="notification">
                    <strong>{deadlineCounts.red}</strong> requisitions are past
                    deadline
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <SparklesIcon
        size={20}
        fill="white"
        className="writing-tools-toggle icon"
        onClick={(e) => {
          e.stopPropagation();
          setWritingToolsMode(true);
        }}
      />
      <div className="info" onClick={() => setShowInfo(!showInfo)}>
        <FontAwesomeIcon icon={faInfoCircle} id="info" className="icon" />
        <AnimatePresence>
          {showInfo && (
            <motion.div
              className="info-panel"
              initial={{
                opacity: 0,
                translateY: -100,
                translateX: -100,
                scale: 0.4,
              }}
              animate={{ opacity: 1, translateY: 0, translateX: 0, scale: 1 }}
              exit={{
                opacity: 0,
                translateY: -100,
                translateX: -100,
                scale: 0.4,
              }}
            >
              <header>
                <p>Info</p>
                <span onClick={() => setShowInfo(false)}>Close</span>
              </header>
              <div className="notification-container">
                <div className="notification">
                  <FontAwesomeIcon
                    icon={faClock}
                    className={`action-indicator-icon red`}
                  />
                  past deadline
                </div>
                <div className="notification">
                  <FontAwesomeIcon
                    icon={faClock}
                    className={`action-indicator-icon yellow`}
                  />
                  3 days from deadline
                </div>
                <div className="notification">
                  <FontAwesomeIcon
                    icon={faClock}
                    className={`action-indicator-icon green`}
                  />
                  24 hours past since created
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div id="username">
        <div>Logged in as</div>
        {currentUser?.name}
      </div>
      <FontAwesomeIcon icon={faUser} id="profile-icon" className="icon" />
    </div>
  );
};

export default ProfileNavbar;
