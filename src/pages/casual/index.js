import Link from 'next/link';
import { ChevronRight, User, Users as UsersIcon, BriefcaseIcon, Star } from 'lucide-react';

const casualLevels = [
    { href: '/activity/casual/beginner', label: 'Beginner', icon: <User size={24} className="text-green-400"/>, description: "Dasar-dasar untuk pemula."},
    { href: '/activity/casual/intermediate', label: 'Intermediate', icon: <UsersIcon size={24} className="text-yellow-400"/>, description: "Tingkatkan kemampuan percakapan Anda."},
    { href: '/activity/casual/advanced', label: 'Advanced', icon: <Star size={24} className="text-red-400"/>, description: "Menuju kefasihan tingkat lanjut."},
    { href: '/activity/casual/business', label: 'Business', icon: <BriefcaseIcon size={24} className="text-blue-400"/>, description: "Bahasa Inggris untuk dunia profesional."},
];

export default function CasualPage() {
    return (
        <div className="space-y-8">
          <div className="text-center p-8 bg-slate-800 rounded-xl shadow-2xl">
            <h1 className="text-4xl font-bold text-sky-400 mb-2">Bahasa Inggris Casual</h1>
            <p className="text-lg text-slate-300">Pilih level yang sesuai dengan kemampuan Anda.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {casualLevels.map((level) => (
              <Link
                href={level.href}
                key={level.label}
                className="block p-6 bg-slate-800 rounded-lg shadow-lg hover:shadow-sky-500/30 hover:bg-slate-700 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <div className="flex items-center mb-3">
                  {level.icon}
                  <h2 className="ml-3 text-2xl font-semibold text-slate-100">{level.label}</h2>
                </div>
                <p className="text-slate-400 mb-4">{level.description}</p>
                <div className="flex justify-end items-center text-sky-400 group-hover:text-sky-300">
                  Pilih Level <ChevronRight size={20} className="ml-1" />
                </div>
              </Link>
            ))}
          </div>
           <div className="mt-8 text-center">
            <Link href="/" className="text-sky-400 hover:text-sky-300 inline-flex items-center">
              <ChevronRight size={20} className="mr-1 transform rotate-180" /> Kembali ke Menu Utama
            </Link>
          </div>
        </div>
    );
}
    