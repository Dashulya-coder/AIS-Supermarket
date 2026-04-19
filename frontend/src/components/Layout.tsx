import { ReactNode } from "react";
import { Navbar } from "./Navbar";

export const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div>
            <Navbar />
            <div style={{ padding: 24 }}>{children}</div>
        </div>
    );
};