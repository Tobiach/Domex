export function exportToCSV() {
  const sections: string[] = [];
  const date = new Date().toISOString().split('T')[0];

  const safe = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  try {
    const tareas = JSON.parse(localStorage.getItem('domex_tareas') || '[]');
    if (tareas.length > 0) {
      sections.push('=== TAREAS ===');
      sections.push('Título,Prioridad,Completada,Fecha Vencimiento,Foco');
      tareas.forEach((t: any) =>
        sections.push([safe(t.titulo), safe(t.prioridad), safe(t.completada ? 'Sí' : 'No'), safe(t.fechaVencimiento), safe(t.esFoco ? 'Sí' : 'No')].join(','))
      );
      sections.push('');
    }
  } catch {}

  try {
    const trans = JSON.parse(localStorage.getItem('domex_transacciones') || '[]');
    if (trans.length > 0) {
      sections.push('=== CAPITAL ===');
      sections.push('Tipo,Monto,Categoría,Descripción,Fecha');
      trans.forEach((t: any) =>
        sections.push([safe(t.tipo), safe(t.monto), safe(t.categoria), safe(t.descripcion), safe(t.fecha)].join(','))
      );
      sections.push('');
    }
  } catch {}

  try {
    const contactos = JSON.parse(localStorage.getItem('domex_contactos') || '[]');
    if (contactos.length > 0) {
      sections.push('=== CRM ===');
      sections.push('Nombre,Empresa,Etapa,Email,Teléfono,Valor');
      contactos.forEach((c: any) =>
        sections.push([safe(c.nombre), safe(c.empresa), safe(c.etapa), safe(c.email), safe(c.telefono), safe(c.valorEstimado)].join(','))
      );
      sections.push('');
    }
  } catch {}

  try {
    const ideas = JSON.parse(localStorage.getItem('domex_ideas') || '[]');
    if (ideas.length > 0) {
      sections.push('=== IDEAS ===');
      sections.push('Título,Estado,Valor Estimado,Potencial Mensual');
      ideas.forEach((i: any) =>
        sections.push([safe(i.titulo), safe(i.estado), safe(i.valorEstimado), safe(i.potencialMensual)].join(','))
      );
      sections.push('');
    }
  } catch {}

  const content = sections.length > 0 ? sections.join('\n') : 'Sin datos para exportar';
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aicolmena_export_${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
