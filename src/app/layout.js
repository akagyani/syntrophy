import { AuthProvider } from "../context/AuthContext";
import "./globals.css";
import ErrorBoundary from "../components/ErrorBoundary";

export const metadata = {
  title: "Syntropy - Don't manage time. Execute it.",
  description: "Autonomous execution partner that resolves pre-work, negotiates timelines, and prevents burnout.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#000] text-zinc-100">
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
