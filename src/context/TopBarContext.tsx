import React, { createContext, useContext, useState, useEffect } from 'react';

interface TopBarContextType {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTopBar: () => void;
  isPlayerPage: boolean;
}

const TopBarContext = createContext<TopBarContextType | undefined>(undefined);

interface TopBarProviderProps {
  activePage: string;
  children: React.ReactNode;
}

export const TopBarProvider: React.FC<TopBarProviderProps> = ({ activePage, children }) => {
  const [page] = activePage.split(':');
  const isPlayerPage = page === 'content-player' || page === 'live-session';
  
  const [isCollapsed, setIsCollapsed] = useState(false);

  // When activePage changes, automatically collapse top bar for course player parts
  // and restore top bar for non-player pages
  useEffect(() => {
    if (isPlayerPage) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [activePage, isPlayerPage]);

  const toggleTopBar = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <TopBarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleTopBar, isPlayerPage }}>
      {children}
    </TopBarContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTopBar = () => {
  const context = useContext(TopBarContext);
  if (!context) {
    return {
      isCollapsed: false,
      setIsCollapsed: () => {},
      toggleTopBar: () => {},
      isPlayerPage: false,
    };
  }
  return context;
};
