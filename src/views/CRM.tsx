import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Search, Filter, Phone, Mail, MoreHorizontal, UserCheck, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

export default function CRM() {
  const { contactos, actualizarEstadoContacto } = useApp();

  const etapas = [
    { id: 'prospecto', etiqueta: 'Primer Contacto', color: 'bg-blue-500/10 text-blue-500' },
    { id: 'contactado', etiqueta: 'En Diálogo', color: 'bg-amber-500/10 text-amber-500' },
    { id: 'negociacion', etiqueta: 'Propuesta Activa', color: 'bg-violet-500/10 text-violet-500' },
    { id: 'ganado', etiqueta: 'Aliado Domex', color: 'bg-emerald-500/10 text-emerald-500' },
  ];

  const obtenerContactosPorEtapa = (etapa: string) => contactos.filter(c => c.estado === etapa);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Relaciones Estratégicas</h1>
        <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">Gestión de capital humano</p>
      </header>

      <div className="space-y-10">
        {etapas.map((etapa) => (
          <section key={etapa.id} className="space-y-4">
             <div className="flex items-center gap-2 px-1">
              <h3 className={cn("text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg border border-white/5", etapa.color)}>
                {etapa.etiqueta}
              </h3>
              <div className="h-px flex-1 bg-white/5 ml-2" />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                {obtenerContactosPorEtapa(etapa.id).length} contactos
              </span>
            </div>

            <div className="grid gap-3">
              <AnimatePresence mode="popLayout">
                {obtenerContactosPorEtapa(etapa.id).map((contacto) => (
                  <motion.div
                    layout
                    key={contacto.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-5 bg-white/[0.02] border-white/5 hover:border-primary/20 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-white/40 border border-white/10 group-hover:bg-primary group-hover:text-white transition-all">
                        {contacto.nombre.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-[15px] tracking-tight">{contacto.nombre}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Briefcase size={12} className="text-white/20" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/30 italic">
                            {contacto.empresa}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-0.5">Valor Proyectado</p>
                        <p className="font-black text-emerald-400 leading-none">${contacto.valor.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                          <Phone size={16} className="text-white/40" />
                        </button>
                        <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                          <MoreHorizontal size={16} className="text-white/40" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
