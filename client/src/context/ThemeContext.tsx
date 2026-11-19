
import {
    createContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

export interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(
    undefined
);

export default ThemeContext;

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("bugdesk-theme") === "dark";
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);

        localStorage.setItem(
            "bugdesk-theme",
            isDarkMode ? "dark" : "light"
        );
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode((previous) => !previous);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
