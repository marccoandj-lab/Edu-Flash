import React from 'react';
import { 
  User, 
  Lock, 
  CreditCard, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  HelpCircle, 
  Plus, 
  FileText,
  RefreshCcw
} from 'lucide-react';
import { cn } from '../utils/cn';
import { Link } from 'react-router-dom';

interface SettingItem {
  icon: any;
  label: string;
  value?: string;
  type: 'link';
  path?: string;
  highlight?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

import { useUser } from '../contexts/UserContext';
import { authService } from '../services/authService';

export const Settings = () => {
  const { profile } = useUser();

  const sections: SettingSection[] = [
    {
      title: "Profile",
      items: [
        { icon: User, label: "Personal Info", value: profile?.displayName || "Student", type: "link", path: "/settings" },
        { icon: CreditCard, label: "Subscription", value: profile?.plan === 'pro' ? "Pro Plan" : "Free Plan", type: "link", highlight: true, path: "/pricing" },
      ]
    },
    {
      title: "Security",
      items: [
        { icon: Lock, label: "Change Password", type: "link", path: "/settings" },
        { icon: ShieldCheck, label: "Privacy Policy", type: "link", path: "/privacy" },
      ]
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", type: "link", path: "/help" },
        { icon: FileText, label: "Terms of Service", type: "link", path: "/terms" },
        { icon: RefreshCcw, label: "Refund Policy", type: "link", path: "/refund" },
      ]
    }
  ];

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/auth';
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-20 px-2 sm:px-6 lg:px-10">
      <div className="mb-12 text-center lg:text-left flex flex-col items-center lg:items-start">
        <div className="inline-block relative mb-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] sm:rounded-[3rem] bg-white/5 flex items-center justify-center text-white border-4 border-white/10 shadow-2xl relative overflow-hidden">
                <User size={56} strokeWidth={1} />
            </div>
            <button className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-12 sm:h-12 bg-white text-[var(--background)] rounded-full shadow-2xl flex items-center justify-center border-4 border-[var(--background)] hover:scale-110 transition-transform">
                <Plus size={20} strokeWidth={3} />
            </button>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic leading-tight">{profile?.displayName || 'Student'}</h2>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-3 bg-white/5 px-6 py-2 rounded-full border border-white/10 shadow-inner max-w-full truncate">{profile?.email || 'student@example.com'}</p>
      </div>

      <div className="space-y-8 sm:space-y-12">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="px-6 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
              {section.title}
            </h3>
            <div className="bg-white/5 rounded-[2.5rem] sm:rounded-[3.5rem] border border-white/10 overflow-hidden shadow-2xl">
              {section.items.map((item, i) => (
                <Link 
                  key={item.label}
                  to={item.path || "#"}
                  className={cn(
                    "flex items-center justify-between p-5 sm:p-6 lg:p-8 transition-all cursor-pointer group",
                    i !== section.items.length - 1 && "border-b border-white/5",
                    "hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <div className={cn(
                        "w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl shrink-0",
                        item.highlight ? "bg-white text-[var(--background)] scale-105" : "bg-white/5 border border-white/10 text-white group-hover:border-white/30"
                    )}>
                      <item.icon size={22} strokeWidth={item.highlight ? 3 : 2} />
                    </div>
                    <span className="font-black text-white text-sm sm:text-lg tracking-tight uppercase truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-5 shrink-0 ml-4">
                    {item.value && (
                        <span className={cn(
                            "hidden xs:inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] px-3 sm:px-4 py-1.5 rounded-lg",
                            item.highlight ? "bg-white/10 text-white" : "text-white/40"
                        )}>
                            {item.value}
                        </span>
                    )}
                    <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full mt-10 py-6 sm:py-8 bg-white/5 text-white rounded-[2.5rem] sm:rounded-[3rem] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-rose-500/20 hover:text-rose-100 transition-all active:scale-[0.98] border border-white/10 shadow-2xl"
        >
          <LogOut size={24} />
          Log Out
        </button>
      </div>
    </div>
  );
};
