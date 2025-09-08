import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showItemsTable, setShowItemsTable] = useState(false);
  const [writingToolsMode, setWritingToolsMode] = useState(false);
  const [showNavbarInMobile, setShowNavbarInMobile] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        showNavbarInMobile,
        setShowNavbarInMobile,
        setShowItemsTable,
        showItemsTable,
        writingToolsMode,
        setWritingToolsMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
