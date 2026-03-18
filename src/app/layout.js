import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: "AdrenaLearn",
  description:
    "A gamified learning platform where students master coding through interactive lessons, mini-games, and AI-powered mentorship. Join AdrenaLearn today",
  keywords:
    "gamified learning, coding games, learn python, AI tutor, AdrenaLearn",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f7f5f0] text-[#1e1b26] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
