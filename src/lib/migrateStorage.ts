const OLD_PREFIX = 'domex_';
const NEW_PREFIX = 'aicolmena_';

// Shim de migración domex_* -> aicolmena_* (KICKOFF-PARALELO-CODIGO.md, punto 8).
// Copia cada key vieja a su equivalente nuevo si todavía no existe. NO borra la
// vieja acá — eso se hace en un paso aparte una vez confirmado que la migración
// funcionó, para no perder datos de las pruebas de estabilidad de 14 días en curso.
export function migrarStorageDomexAAicolmena(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(OLD_PREFIX));
  for (const oldKey of keys) {
    const newKey = NEW_PREFIX + oldKey.slice(OLD_PREFIX.length);
    if (localStorage.getItem(newKey) !== null) continue;
    const value = localStorage.getItem(oldKey);
    if (value !== null) localStorage.setItem(newKey, value);
  }
}
