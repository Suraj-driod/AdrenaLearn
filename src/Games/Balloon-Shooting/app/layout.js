// src/app/layout.js
import "./globals.css";

export const metadata = {
  title: "KodeQuest - Balloon Shooter",
  description: "Gamified learning platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900">{children}</body>
    </html>
  );
}
