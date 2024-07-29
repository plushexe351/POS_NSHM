import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [navVisible, setNavVisible] = useState(false);
  // const [registerStatus, setRegisterStatus] = useState(false);

  return (
    <AuthContext.Provider
      value={{ currentUser, setCurrentUser, navVisible, setNavVisible }}
    >
      {children}
    </AuthContext.Provider>
  );
};
