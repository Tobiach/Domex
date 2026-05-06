import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  HelpCircle, 
  LogOut, 
  Key,
  BadgeCheck,
  ChevronRight,
  Monitor,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function More() {
  const { usuario } = useApp();
  const navigate = useNavigate();

  const secciones = [
    {
      titulo: 'Crecimiento',
      items: [
        { icon: GraduationCap, etiqueta: 'Habilidades', sub: 'Domina ventas, finanzas e IA', color: 'text-primary', path: '/habilidades' },
      ]
    },
    {
      titulo: 'Cuenta y Perfil',
      items: [
        { icon: User, etiqueta: 'Editar Perfil', sub: 'Cambia tu nombre y avatar', color: 'text-blue-500' },
        { icon: Shield, etiqueta: 'Seguridad', sub: 'Doble factor activo', color: 'text-emerald-500' },
        { icon: Key, etiqueta: 'API Keys', sub: 'Conexiones externas Domex', color: 'text-amber-500' },
      ]
    },
    {
      titulo: 'Preferencias',
      items: [
        { icon: Bell, etiqueta: 'Notificaciones', sub: 'Alertas de mercado y tareas', color: 'text-rose-500' },
        { icon: Monitor, etiqueta: 'Interfaz', sub: 'Modo oscuro inteligente', color: 'text-violet-500' },
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-[2.5rem] premium-gradient mx-auto flex items-center justify-center text-3xl font-black border-4 border-surface shadow-2xl">
            {usuario.nombre.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-2xl border-4 border-surface shadow-lg">
            <BadgeCheck size={20} className="text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter">{usuario.nombre}</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1">Suscripción Domex Élite</p>
        </div>
      </header>

      <div className="space-y-8">
        {secciones.map((seccion, sIdx) => (
          <div key={sIdx} className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">{seccion.titulo}</h3>
            <div className="space-y-2">
              {seccion.items.map((item, iIdx) => (
                <button 
                  key={iIdx}
                  onClick={() => item.path && navigate(item.path)}
                  className="w-full glass-card p-5 bg-white/[0.02] border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${item.color} bg-current/10 p-3 rounded-2xl`}>
                      <item.icon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[15px] tracking-tight">{item.etiqueta}</p>
                      <p className="text-[10px] text-white/30 font-medium">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/10 group-hover:text-white/40 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <button className="w-full glass-card p-5 bg-rose-500/5 border-rose-500/10 flex items-center justify-center gap-3 text-rose-500 font-black uppercase tracking-widest text-xs hover:bg-rose-500/10 transition-all">
          <LogOut size={18} />
          Cerrar Sesión Estratégica
        </button>
      </div>

      <div className="text-center pt-8 opacity-20">
        <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">Domex Systems Corp</p>
        <p className="text-[9px] font-medium italic">Versión Estable 4.5.2 "Atenas"</p>
      </div>
    </div>
  );
}
