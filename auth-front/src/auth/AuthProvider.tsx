import { useState, useEffect, createContext, useContext } from 'react';
import { AccesTokenResponse, AuthResponse, User } from '../types/types';

interface AuthProviderProps {
    children: React.ReactNode
}

const AuthContext = createContext({
    isAuthenticated: false,
    getAccessToken: () => { },
    saveUser: (userData: AuthResponse) => { },
    getRefreshToken: () => { },
    getUser: () => ({} as User | undefined),
    signOut: () => {}
});

export function AuthProvider({ children }: AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessToken, setAccessToken] = useState<String>('');
    const [user, setUser] = useState<User>();

    useEffect(() => {
        checkAuth();
    }, []);

    async function requestNewAccessToken(refreshToken: String) {
        try {
            const response = await fetch("http://localhost:5000/api/refresh-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + refreshToken + ""
                },
            });

            if (response.ok) {
                const json = await response.json() as AccesTokenResponse;
                if (json.error) {
                    throw new Error(json.error);
                }
                return json.body.accessToken;
            } else {
                throw new Error(response.statusText);
            }
        } catch (error) {
            console.log(error);
            return null
        }
    }

    async function getUserInfo(accessToken: String) {
        try {
            const response = await fetch("http://localhost:5000/api/user", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + accessToken + ""
                },
            });

            if (response.ok) {
                const json = await response.json();
                if (json.error) {
                    throw new Error(json.error);
                }
                return json.body;
            } else {
                throw new Error(response.statusText);
            }
        } catch (error) {
            console.log(error);
            return null
        }
    }

    async function checkAuth() {
        if (accessToken) {
            setIsAuthenticated(true);
        } else {
            const token = getRefreshToken();
            if (token) {
                const newAccessToken = await requestNewAccessToken(token);
                if (newAccessToken) {
                    const userInfo = await getUserInfo(newAccessToken);
                    if (userInfo) {
                        saveSessionInfo(userInfo, newAccessToken, token);
                    }
                }
            }
        }
    }

    function saveSessionInfo(
        userInfo: User,
        accessToken: String,
        refreshToken: String
    ) {
        setAccessToken(accessToken);
        localStorage.setItem('token', JSON.stringify(refreshToken));
        setIsAuthenticated(true);
        setUser(userInfo);
    }

    function getAccessToken() {
        return accessToken;
    }

    function getRefreshToken(): String | null {
        const tokenData = localStorage.getItem('token');
        if (tokenData) {
            const { token } = JSON.parse(tokenData);
            return token
        }
        return null;
    }

    function signOut() {
        setIsAuthenticated(false);
        setAccessToken('');
        setUser(undefined);
        localStorage.removeItem('token');
    }

    function saveUser(userData: AuthResponse) {
        saveSessionInfo(
            userData.body.user,
            userData.body.accessToken,
            userData.body.refreshToken
        );
    }

    function getUser() {
        return user;
    }

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            getAccessToken,
            saveUser,
            getRefreshToken,
            getUser,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);