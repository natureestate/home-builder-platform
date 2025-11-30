import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="min-h-[calc(100vh-3.5rem)]">
                {children}
            </main>
        </div>
    );
}
