# DEMOSTRACIÓN DE VULNERABILIDAD: BRUTE FORCE ATTACK

## 📋 Descripción
Este directorio contiene la investigación completa sobre la vulnerabilidad de **Brute Force Attack por ausencia de control de intentos de login** encontrada en el servidor de inventario.

## 📁 Archivos Incluidos

### 📄 Documentación Principal
- **`BruteForce-Complete-Analysis.md`** - Análisis completo de la vulnerabilidad
- **`BruteForce-Bibliography.md`** - 60 referencias académicas y técnicas

### 🔧 Script de Demostración
- **`brute_force_demo.js`** - Script Node.js para demostrar la vulnerabilidad
  - ✅ **Sin dependencias externas** - usa solo módulos nativos
  - ✅ **fetch API** nativa (Node.js 18+)
  - ✅ **readline** nativo para interacción
  - ✅ **AbortSignal** para timeouts

## 🚀 Cómo Ejecutar la Demostración

### Prerrequisitos
1. **Node.js** instalado (v18 o superior para fetch nativo)
2. Servidor de inventario ejecutándose
3. **Sin dependencias externas** - usa solo módulos nativos de Node.js

### Paso 1: Iniciar el Servidor Vulnerable
```bash
# En el directorio raíz del proyecto
npm start
```

### Paso 2: Ejecutar el Script de Demostración
```bash
# En el directorio security-research
node brute_force_demo.js
```

### Paso 3: Seguir las Instrucciones
El script te pedirá confirmación antes de ejecutar:
```
🔒 BRUTE FORCE VULNERABILITY ASSESSMENT
Target: http://localhost:3000

⚠️  DISCLAIMER:
Este script es para fines educativos y de testing de seguridad únicamente.
Solo ejecutar en sistemas propios o con autorización explícita.

¿Continuar con la evaluación? (y/N):
```

## 📊 Resultados Esperados

### Fase 1: Enumeración de Usuarios
```
🔍 FASE 1: ENUMERACIÓN DE USUARIOS
✅ Usuario encontrado: admin
✅ Usuario encontrado: test
❌ Usuario no existe: root
```

### Fase 2: Ataque de Brute Force
```
🚀 ATAQUE DE BRUTE FORCE CONTRA: admin
📚 Passwords a probar: 50
🎯 ¡CREDENCIALES ENCONTRADAS!
   Usuario: admin
   Password: admin123
   Tiempo: 15.3 segundos
```

### Fase 3: Reporte Final
```
📋 REPORTE FINAL DE VULNERABILIDAD
Severidad: 🔴 CRÍTICA
Impacto: Acceso no autorizado confirmado
```

## ⚠️ Consideraciones de Seguridad

### Solo para Fines Educativos
- ✅ Usar únicamente en entornos de desarrollo propios
- ✅ Obtener autorización explícita antes de ejecutar
- ❌ NO usar en sistemas de terceros sin permiso
- ❌ NO usar con intenciones maliciosas

### Legalidad
- El uso no autorizado puede violar leyes locales
- Siempre respetar términos de servicio
- Reportar vulnerabilidades de forma responsable

## 🛡️ Contramedidas Implementables

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos
    message: 'Demasiados intentos de login'
});

app.use('/auth/login', authLimiter);
```

### Account Lockout
```javascript
// Bloquear cuenta después de 5 fallos
const failedAttempts = new Map();

function recordFailedAttempt(username) {
    const attempts = failedAttempts.get(username) || 0;
    failedAttempts.set(username, attempts + 1);
    
    if (attempts + 1 >= 5) {
        // Bloquear cuenta por 30 minutos
        setTimeout(() => {
            failedAttempts.delete(username);
        }, 30 * 60 * 1000);
        return true; // Account locked
    }
    return false;
}
```

## 📚 Referencias Académicas

Ver `BruteForce-Bibliography.md` para 60 referencias completas organizadas por:
- Investigación académica sobre brute force
- Estándares de seguridad (OWASP, NIST, ISO)
- Documentación técnica oficial
- Casos de estudio industriales
- Herramientas de testing y mitigación

## 🎓 Uso Académico

### Para tu Investigación de Maestría
1. **Descripción de la Amenaza**: Usa el análisis técnico completo
2. **Forma de Ataque**: Ejecuta el script para obtener resultados reales
3. **Método de Solución**: Implementa las contramedidas propuestas
4. **Referencias**: Cita las 60 fuentes académicas incluidas

### Estructura Sugerida del Documento Final
1. **Introducción** - Contexto del servidor de inventario
2. **Marco Teórico** - Brute force attacks y autenticación
3. **Análisis de Vulnerabilidad** - Código vulnerable específico
4. **Demostración Práctica** - Resultados del script
5. **Contramedidas** - Soluciones implementables
6. **Conclusiones** - Impacto y recomendaciones
7. **Referencias** - Bibliografía académica completa

---

*Investigación desarrollada para Maestría en Desarrollo Full Stack*
*Materia: Seguridad en Aplicaciones Web y Móviles*
*Universidad: [Tu Universidad]*
*Fecha: Octubre 2025*