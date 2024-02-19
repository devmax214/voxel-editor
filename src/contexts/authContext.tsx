'use client'

import React from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/Firebase/config";
// import { getUserInfo } from "utils/api";
import { getUserInfo } from "@/Firebase/dbactions";

type UserInfo = {
  permission: string;
  billing: {
    compute_unit: number;
    plan: string;
    hold: string;
  }
}

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) =>  void;
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) =>  void;
}
export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  setUser: (user: User | null) => {},
  userInfo: null,
  setUserInfo: (userInfo: UserInfo | null) => {}
});

export const useAuthContext = () => React.useContext(AuthContext);

export const AuthContextProvider = (props: React.PropsWithChildren) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [userInfo, setUserInfo] = React.useState<UserInfo | null>(null);

  React.useEffect(() => {
    const fetchUserInfo = async (userId: string) => {
      const data: any = await getUserInfo(userId);
      setUserInfo(data);
    }
    
    const unsubscribe = onAuthStateChanged(auth, authUser => {
      if (authUser) {
        setUser(authUser);
        fetchUserInfo(authUser.uid);
      } else {
        setUser(null);
        setUserInfo(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, userInfo, setUserInfo }}>
      {props.children}
    </AuthContext.Provider>
  )
}