import React, { createContext, useState } from "react";
import ItemsTable from "../components/ItemsTable";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [navVisible, setNavVisible] = useState(false);
  const [showItemsTable, setShowItemsTable] = useState(false);
  // const [registerStatus, setRegisterStatus] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        navVisible,
        setNavVisible,
        setShowItemsTable,
        showItemsTable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
