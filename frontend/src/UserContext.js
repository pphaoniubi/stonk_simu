import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [username, setUsername] = useState(() => {
        // Load username from localStorage when the app initializes
        return localStorage.getItem("username") || null;
    });

    useEffect(() => {
        // Save username to localStorage whenever it changes
        if (username) {
            localStorage.setItem("username", username);
        } else {
            localStorage.removeItem("username");
        }
    }, [username]);

    return (
        <UserContext.Provider value={{ username, setUsername }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
