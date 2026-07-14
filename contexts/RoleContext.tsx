import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

type UserRole = 'buyer' | 'seller';

interface RoleContextType {
  userRole: UserRole;
  isSellerSignedIn: boolean;
  globalSellerId: string | null;
  globalBuyerId: string | null;
  setGlobalRole: (role: UserRole) => void;
  setSellerSignedIn: (val: boolean) => void;
  setGlobalSellerId: (id: string | null) => void;
  setGlobalBuyerId: (id: string | null) => void;
  clearRoleState: () => Promise<void>;
  initializeFromStorage: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole>('buyer');
  const [isSellerSignedIn, setIsSellerSignedInState] = useState(false);
  const [globalSellerId, setGlobalSellerIdState] = useState<string | null>(null);
  const [globalBuyerId, setGlobalBuyerIdState] = useState<string | null>(null);

  // Initialize role state from AsyncStorage on app load
  const initializeFromStorage = useCallback(async () => {
    try {
      const [role, sellerSignedIn, sellerId, buyerId] = await Promise.all([
        AsyncStorage.getItem('userRole'),
        AsyncStorage.getItem('isSellerSignedIn'),
        AsyncStorage.getItem('supplierId'),
        AsyncStorage.getItem('buyerId'),
      ]);

      if (role === 'seller' || role === 'buyer') {
        setUserRole(role);
      }
      if (sellerSignedIn === 'true') {
        setIsSellerSignedInState(true);
      }
      if (sellerId) {
        setGlobalSellerIdState(sellerId);
      }
      if (buyerId) {
        setGlobalBuyerIdState(buyerId);
      }
    } catch (error) {
      console.error('Error initializing role state from storage:', error);
    }
  }, []);

  const setGlobalRole = useCallback((role: UserRole) => {
    setUserRole(role);
    AsyncStorage.setItem('userRole', role).catch((e) =>
      console.error('Error saving userRole to storage:', e)
    );
  }, []);

  const setSellerSignedIn = useCallback((val: boolean) => {
    setIsSellerSignedInState(val);
    AsyncStorage.setItem('isSellerSignedIn', val ? 'true' : 'false').catch((e) =>
      console.error('Error saving isSellerSignedIn to storage:', e)
    );
  }, []);

  const setGlobalSellerId = useCallback((id: string | null) => {
    setGlobalSellerIdState(id);
    if (id) {
      AsyncStorage.setItem('supplierId', id).catch((e) =>
        console.error('Error saving supplierId to storage:', e)
      );
    } else {
      AsyncStorage.removeItem('supplierId').catch((e) =>
        console.error('Error removing supplierId from storage:', e)
      );
    }
  }, []);

  const setGlobalBuyerId = useCallback((id: string | null) => {
    setGlobalBuyerIdState(id);
    if (id) {
      AsyncStorage.setItem('buyerId', id).catch((e) =>
        console.error('Error saving buyerId to storage:', e)
      );
    } else {
      AsyncStorage.removeItem('buyerId').catch((e) =>
        console.error('Error removing buyerId from storage:', e)
      );
    }
  }, []);

  const clearRoleState = useCallback(async () => {
    setUserRole('buyer');
    setIsSellerSignedInState(false);
    setGlobalSellerIdState(null);
    setGlobalBuyerIdState(null);
    
    try {
      await AsyncStorage.multiRemove([
        'userRole',
        'isSellerSignedIn',
        'supplierId',
        'buyerId'
      ]);
    } catch (error) {
      console.error('Error clearing role state from storage:', error);
    }
  }, []);

  const value = React.useMemo(
    () => ({
      userRole,
      isSellerSignedIn,
      globalSellerId,
      globalBuyerId,
      setGlobalRole,
      setSellerSignedIn,
      setGlobalSellerId,
      setGlobalBuyerId,
      clearRoleState,
      initializeFromStorage,
    }),
    [
      userRole,
      isSellerSignedIn,
      globalSellerId,
      globalBuyerId,
      setGlobalRole,
      setSellerSignedIn,
      setGlobalSellerId,
      setGlobalBuyerId,
      clearRoleState,
      initializeFromStorage,
    ]
  );

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

/**
 * Hook to access role context
 * Use this in any component that needs reactive role state
 */
export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
