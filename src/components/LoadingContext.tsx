"use client";

import { useState, createContext, useContext } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";

const LoadingContext = createContext({
  loading: false,
  setLoading: (_: boolean) => {},
});

export const useLoading = () => useContext(LoadingContext);

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {loading && <LoadingOverlay />}
      {children}
    </LoadingContext.Provider>
  );
};
