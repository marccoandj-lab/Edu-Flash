
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  BookOpen, 
  Settings, 
  Zap, 
  Sparkles,
  User as UserIcon,
  Bell,
  MessageSquare,
  Calculator,
  PlayCircle
} from 'lucide-react';
import { cn } from '../utils/cn';

const navItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/' },
  { icon: PlusCircle, label: 'Scan', path: '/upload' },
  { icon: MessageSquare, label: 'Assistant', path: '/assistant' },
  { icon: Calculator, label: 'Solver', path: '/solver' },
  { icon: PlayCircle, label: 'Video Lab', path: '/video-lab' },
  { icon: BookOpen, label: 'Library', path: '/library' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="hidden lg:flex fixed inset-y-0 left-0 w-72 bg-[var(--surface)] border-r border-white/10 flex-col z-50 transition-colors">
      <div className="p-8">
        <div className="flex items-center gap-3 text-white">
          <Sparkles size={28} />
          <span className="text-xl font-black tracking-tight uppercase">Edu-Flash</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item: any) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300",
                isActive 
                  ? "bg-white text-[var(--background)] shadow-xl scale-[1.02]" 
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 3 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="bg-white/10 rounded-3xl p-6 text-white relative overflow-hidden transition-colors border border-white/10">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Elite Study</p>
            <p className="text-sm font-bold opacity-80 mb-4">Unlock full AI potential</p>
            <Link to="/pricing" className="block text-center py-2.5 bg-white text-[var(--background)] rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
              Upgrade
            </Link>
          </div>
          <Zap className="absolute -right-4 -bottom-4 text-white w-24 h-24 opacity-5" />
        </div>
      </div>
    </div>
  );
};

export const BottomNav = () => {
  const location = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-2 pb-4">
      <div className="w-full rounded-[2rem] shadow-2xl border border-white/10 flex items-center justify-between px-1 py-2 safe-area-bottom bg-[var(--surface)]/95 backdrop-blur-2xl">
        {navItems.map((item: any) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1.5 flex-1 min-w-0 transition-all duration-300 py-2",
                isActive ? "text-white" : "text-white/40"
              )}
            >
              <div className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive ? "bg-white/10 scale-110" : ""
              )}>
                <Icon size={20} strokeWidth={isActive ? 3 : 2.5} />
              </div>
              <span className="text-[7.5px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis w-full text-center px-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export const Header = ({ title }: { title: string }) => {
  return (
    <header className="h-20 lg:h-24 sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between bg-[var(--background)]/90 backdrop-blur-xl">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3 lg:gap-5">
        <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-colors shadow-sm">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-3 pl-2 lg:pl-5 border-l border-white/10">
          <div className="hidden md:block text-right">
            <p className="text-xs font-black text-white">Marko Petrović</p>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mt-1">Premium</p>
          </div>
          <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-2xl bg-white text-[var(--background)] shadow-inner flex items-center justify-center overflow-hidden transition-all">
             <UserIcon size={24} fill="currentColor" />
          </div>
        </div>
      </div>
    </header>
  );
};
