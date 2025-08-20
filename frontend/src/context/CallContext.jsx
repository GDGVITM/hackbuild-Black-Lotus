import { createContext, useContext, useState } from "react";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const [inCall, setInCall] = useState(false);
  return <CallContext.Provider value={{ inCall, setInCall }}>{children}</CallContext.Provider>;
};

export const useCall = () => useContext(CallContext);
