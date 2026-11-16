import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Peter's Workout & Training Planner | Ace Workout",
  description: 'Constraint-aware weekly training planner and decision logger for volleyball, resistance, and VO2 Max.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
