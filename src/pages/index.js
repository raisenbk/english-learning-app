import Link from 'next/link';
import { ChevronRight, BookMarked, MessageCircle, Users, Award } from 'lucide-react';

const menuItems = [
  { href: '/casual', label: 'Bahasa Inggris Casual', icon: <BookMarked size={24} className="text-sky-400" />, description: "Untuk percakapan sehari-hari dan situasi umum." },
  { href: '/activity/slang/general', label: 'Bahasa Inggris Slang', icon: <MessageCircle size={24} className="text-teal-400" />, description: "Pelajari ungkapan gaul terbaru." },
  { href: '/activity/hood/general', label: 'Bahasa Inggris "Hood"', icon: <Users size={24} className="text-amber-400" />, description: "Pahami bahasa yang digunakan di lingkungan tertentu." },
  { href: '/activity/idioms/general', label: 'Bahasa Inggris Idioms', icon: <Award size={24} className="text-rose-400" />, description: "Kuasai ungkapan idiomatik untuk berbicara seperti native." },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
          <div className="text-center p-8 bg-slate-800 rounded-xl shadow-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-sky-400 mb-4">Selamat Datang di Inggris-Chan &gt;&lt; By King Rafi</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">Pilih kategori untuk mulai petualangan belajar bahasa Inggris lo dengan suki suki.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {menuItems.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className="block p-6 bg-slate-800 rounded-lg shadow-lg hover:shadow-sky-500/30 hover:bg-slate-700 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <div className="flex items-center mb-3">
                  {item.icon}
                  <h2 className="ml-3 text-2xl font-semibold text-slate-100">{item.label}</h2>
                </div>
                <p className="text-slate-400 mb-4">{item.description}</p>
                <div className="flex justify-end items-center text-sky-400 group-hover:text-sky-300">
                  Mulai Belajar <ChevronRight size={20} className="ml-1" />
                </div>
              </Link>
            ))}
          </div>
    </div>
  );
}
    