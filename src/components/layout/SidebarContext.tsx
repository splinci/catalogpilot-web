"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  isHidden: boolean;
  toggleCollapse: () => void;
  toggleHide: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setHidden: (hidden: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem("splinci_sidebar_collapsed");
      if (savedCollapsed !== null) {
        setIsCollapsed(JSON.parse(savedCollapsed));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("splinci_sidebar_collapsed", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const toggleHide = () => {
    setIsHidden((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isHidden,
        toggleCollapse,
        toggleHide,
        setCollapsed: setIsCollapsed,
        setHidden: setIsHidden,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
