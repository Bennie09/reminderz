"use client";

import {
  useState,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";
import LoadingOverlay from "@/components/LoadingOverlay";

interface LoadingContextType {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

const LoadingContext = createContext<LoadingContextType>({
  loading: false,
  setLoading: () => {}, // No unused parameter
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
