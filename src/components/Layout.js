import Link from 'next/link';
import { Home } from 'lucide-react';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-r from-slate-900 to-slate-700 text-slate-100 font-sans">
          <header className="bg-slate-800 shadow-lg sticky top-0 z-50">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-sky-400 hover:text-sky-300 transition-colors">
                Inggris-Chan &gt;&lt;
              </Link>
              <div className="space-x-4">
                <Link href="/" className="hover:text-sky-400 transition-colors flex items-center">
                  <Home size={18} className="mr-1"/> Beranda
                </Link>
              </div>
            </nav>
          </header>
          <main className="container mx-auto px-6 py-8 flex-grow">
            {children}
          </main>
          <footer className="bg-slate-800 text-center py-6 mt-auto">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Aplikasi Belajar Bahasa Inggris. Dibuat dengan ❤️</p>
          </footer>
        </div>
    );
}