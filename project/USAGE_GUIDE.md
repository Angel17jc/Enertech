# 📖 Guía de Uso - Enertech

## 🚀 Inicio Rápido

### 1. Iniciar la Aplicación

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

### 2. Registro de Usuario

1. En la pantalla de inicio, haz clic en **"Regístrate aquí"**
2. Completa el formulario:
   - Nombre completo
   - Correo electrónico
   - Contraseña (mínimo 6 caracteres)
3. Haz clic en **"Registrarse"**

**Nota**: Para este proyecto académico, Supabase enviará un email de confirmación, pero **NO es necesario confirmar** para usar la aplicación. Puedes iniciar sesión inmediatamente después del registro.

### 3. Iniciar Sesión

1. Ingresa tu correo electrónico y contraseña
2. Haz clic en **"Iniciar Sesión"**

---

## 🎯 Poblar la Base de Datos con Datos de Ejemplo

Para demostrar la funcionalidad completa de la aplicación, sigue estos pasos:

### Opción A: A través de la Interfaz (Recomendado para Usuarios)

1. **Agregar Dispositivos**:
   - Ve a la sección **"Dispositivos"**
   - Haz clic en **"Agregar Dispositivo"**
   - Completa el formulario:
     - Nombre: ej. "Refrigerador Samsung"
     - Tipo: Selecciona de la lista
     - Potencia (W): ej. 150
     - Horas/Día: ej. 24
   - Haz clic en **"Guardar"**
   - Repite para agregar más dispositivos

2. **Registrar Consumo**:
   - Ve a la sección **"Registro de Consumo"**
   - Haz clic en **"Agregar Registro"**
   - Completa el formulario:
     - Fecha: Selecciona la fecha
     - kWh Consumidos: ej. 12.5
     - Costo: ej. 1.50
     - Notas: (opcional)
   - Haz clic en **"Guardar"**
   - Agrega registros de varios días para ver gráficos

3. **Crear Metas**:
   - Ve a la sección **"Metas de Ahorro"**
   - Haz clic en **"Crear Meta"**
   - Completa el formulario:
     - kWh Objetivo: ej. 350
     - Fecha Inicio: Selecciona inicio del mes
     - Fecha Fin: Selecciona fin del mes
   - Haz clic en **"Guardar"**

### Opción B: Usando SQL (Para Demostración Rápida)

#### Paso 1: Obtener tu User ID

1. Inicia sesión en la aplicación
2. Ve a **Configuración** y anota tu email
3. Abre Supabase Dashboard: https://supabase.com/dashboard
4. Selecciona tu proyecto
5. Ve a **SQL Editor**
6. Ejecuta:

```sql
SELECT id, email, full_name FROM profiles WHERE email = 'tu-email@example.com';
```

7. Copia el `id` (UUID) que aparece

#### Paso 2: Ejecutar Script de Datos

1. Abre el archivo `SEED_DATA.sql` del proyecto
2. Reemplaza **TODAS** las instancias de `'USER_ID_HERE'` con tu UUID
   - Usa buscar y reemplazar en tu editor
   - Ejemplo: `'550e8400-e29b-41d4-a716-446655440000'`
3. En Supabase SQL Editor, pega el SQL modificado
4. Haz clic en **"Run"**
5. Verifica que se ejecutó sin errores
6. Recarga la aplicación

---

## 👤 Crear Usuario Administrador

### Método 1: Desde SQL Editor

1. Abre Supabase SQL Editor
2. Ejecuta:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'tu-email@example.com';
```

3. Cierra sesión y vuelve a iniciar sesión
4. Verás una nueva opción **"Administración"** en el menú

### Método 2: Durante el Registro

Por defecto, todos los usuarios son tipo **'user'**. Si quieres que el primer usuario sea admin:

1. Regístralo normalmente
2. Inmediatamente ejecuta el UPDATE en SQL Editor
3. El usuario tendrá acceso al panel de administración

---

## 🎨 Funciones de Accesibilidad

### Cambiar Idioma

1. Ve a **"Configuración"**
2. En **"Idioma"**, selecciona:
   - Español
   - English
3. Haz clic en **"Guardar Cambios"**
4. La interfaz cambiará inmediatamente

### Cambiar Tema (Claro/Oscuro)

**Método 1: Desde el menú**
- Haz clic en el icono de Luna/Sol en la barra de navegación

**Método 2: Desde Configuración**
- Ve a **"Configuración"**
- En **"Tema"**, haz clic para alternar
- Los cambios se guardan automáticamente

### Navegación por Teclado

- **Tab**: Navegar hacia adelante
- **Shift + Tab**: Navegar hacia atrás
- **Enter/Space**: Activar botones
- **Escape**: Cerrar modales/formularios
- **Flechas**: Navegar en listas/tablas

### Zoom Accesible

- **Ctrl + +** (Windows/Linux) o **Cmd + +** (Mac): Aumentar zoom
- **Ctrl + -** (Windows/Linux) o **Cmd + -** (Mac): Disminuir zoom
- Funciona hasta **200%** sin scroll horizontal

---

## 📊 Panel de Usuario

### Dashboard (Panel Principal)

**Estadísticas Visibles:**
- **Consumo Total**: Suma de kWh del mes
- **Promedio Diario**: Consumo promedio por día
- **Dispositivos Activos**: Cantidad de dispositivos registrados
- **Metas Activas**: Metas en curso

**Gráfico de Tendencia:**
- Muestra consumo de los últimos 30 días
- Hover para ver detalles
- Accesible con teclado y lectores de pantalla

### Dispositivos

**Funcionalidades:**
- Ver lista de dispositivos
- Ver consumo diario calculado
- Ver costo mensual estimado
- Agregar nuevos dispositivos
- Editar dispositivos existentes
- Eliminar dispositivos

**Cálculos Automáticos:**
- Consumo Diario (kWh) = (Watts × Horas/Día) ÷ 1000
- Costo Mensual = Consumo Diario × 30 × Tarifa

### Registro de Consumo

**Funcionalidades:**
- Ver historial completo
- Agregar registros manualmente
- Editar registros existentes
- Eliminar registros
- Filtrado por fecha (tabla ordenada)

### Metas de Ahorro

**Estados de Meta:**
- 🔵 **Activa**: Meta en progreso
- 🟢 **Completada**: Meta alcanzada
- 🔴 **No Alcanzada**: Meta fallida

**Seguimiento:**
- Barra de progreso visual
- Consumo actual vs objetivo
- Porcentaje completado

### Recomendaciones

**Interacciones:**
- Ver recomendaciones del sistema
- **Marcar como Aplicada**: Si implementaste la recomendación
- **Descartar**: Si no es relevante para ti

**Categorías:**
- 🔥 Calefacción
- ❄️ Refrigeración
- 💡 Iluminación
- 🔌 Electrodomésticos
- 📋 General

---

## 🛡️ Panel de Administración

### Acceso

Solo usuarios con `role = 'admin'` pueden ver esta sección.

### Estadísticas Globales

- **Total de Usuarios**: Cantidad de usuarios registrados
- **Consumo Total del Sistema**: Suma de todo el consumo registrado

### Gestión de Usuarios

**Vista de Tabla:**
- Nombre completo
- Email
- Rol (user/admin)
- Fecha de registro

**Nota**: Por seguridad, los administradores **solo tienen lectura** sobre perfiles de usuarios. No pueden modificarlos directamente desde la UI.

### Gestión de Recomendaciones (Futuro)

Esta funcionalidad está preparada en la base de datos. Un administrador puede:
- Ver todas las recomendaciones
- Crear nuevas recomendaciones (multiidioma)
- Activar/desactivar recomendaciones
- Ver estadísticas de adopción

### Gestión de Tarifas (Futuro)

Los administradores pueden configurar:
- Costo por kWh
- Moneda
- Validez de la tarifa
- Tarifa por defecto

---

## 🔧 Configuración Personal

### Editar Perfil

1. Ve a **"Configuración"**
2. Modifica tu **Nombre Completo**
3. El **Email** no es editable (usado para login)
4. Haz clic en **"Guardar Cambios"**

### Preferencias

- **Idioma**: Español o English
- **Tema**: Claro u Oscuro
- Ambas preferencias se guardan en la base de datos
- Persisten entre sesiones

---

## 🧪 Probar Accesibilidad

### Con Lectores de Pantalla

**Windows (NVDA - Gratuito):**
1. Descarga NVDA: https://www.nvaccess.org/download/
2. Instala y ejecuta
3. Navega la aplicación con Tab
4. NVDA anunciará cada elemento

**Mac (VoiceOver - Integrado):**
1. Presiona **Cmd + F5** para activar
2. Usa **Control + Option + Flechas** para navegar

### Con Solo Teclado

1. No uses el mouse
2. Navega con Tab
3. Activa botones con Enter/Space
4. Verifica que:
   - Todos los elementos son accesibles
   - El foco es siempre visible
   - Puedes cerrar modales con Escape

### Con Alto Contraste

1. Activa modo oscuro
2. Verifica que todo el texto sea legible
3. Los contrastes cumplen WCAG AA (4.5:1)

### Con Zoom

1. Aumenta zoom a 200%
2. Verifica que no haya scroll horizontal
3. Todo el contenido debe ser accesible

---

## ❓ Solución de Problemas

### No puedo iniciar sesión

- Verifica que el email y contraseña sean correctos
- Asegúrate de haber completado el registro
- No es necesario confirmar el email para este proyecto

### No veo datos en el Dashboard

- Primero agrega dispositivos
- Luego registra consumo de varios días
- Los gráficos necesitan al menos 2 puntos de datos

### El tema oscuro no funciona

- Haz clic en el botón de Luna/Sol en el navbar
- O ve a Configuración → Tema
- Si persiste, recarga la página

### No veo el panel de Administración

- Solo usuarios con `role = 'admin'` pueden verlo
- Ejecuta el UPDATE en SQL Editor para cambiar tu rol
- Cierra sesión y vuelve a iniciar

### Los gráficos no se muestran

- Verifica que tengas registros de consumo
- Los gráficos requieren datos de fechas diferentes
- Intenta registrar consumo de 7-30 días

---

## 📱 Uso en Dispositivos Móviles

### Responsive Design

La aplicación es completamente responsive:
- **Móvil** (< 768px): Menú hamburguesa
- **Tablet** (768-1024px): Vista adaptada
- **Desktop** (> 1024px): Vista completa

### Navegación Móvil

1. Haz clic en el icono de **Menú (☰)** en el navbar
2. Selecciona la sección deseada
3. El menú se cierra automáticamente

### Gestos Táctiles

- **Tap**: Seleccionar elemento
- **Scroll**: Desplazarse por listas/tablas
- **Pinch to Zoom**: Aumentar/reducir zoom
- Todos los botones tienen **mínimo 44x44px**

---

## 🎓 Para Evaluación Académica

### Criterios WCAG 2.2 Implementados

| Criterio | Nivel | Implementado |
|----------|-------|--------------|
| Textos alternativos | A | ✅ |
| Contraste mínimo 4.5:1 | AA | ✅ |
| Navegación por teclado | A | ✅ |
| Foco visible | AA | ✅ |
| Reflujo (responsive) | AA | ✅ |
| Tamaño de objetivo | AA | ✅ |
| Idioma de la página | A | ✅ |
| Identificación de errores | A | ✅ |
| Labels en formularios | A | ✅ |
| Roles y estados ARIA | A | ✅ |

### Principios ISO 9241-171

- ✅ Claridad visual
- ✅ Jerarquía de información
- ✅ Consistencia de navegación
- ✅ Retroalimentación del sistema
- ✅ Manejo de errores amigable
- ✅ Personalización (idioma/tema)

### Discapacidades Soportadas

- ✅ Visual (ceguera, baja visión)
- ✅ Auditiva (sordera) - No hay audio
- ✅ Motriz (navegación por teclado)
- ✅ Cognitiva (diseño claro, sin tiempo límite)
- ✅ Neurológica (respeta prefers-reduced-motion)

---

## 📞 Soporte

Para dudas sobre el proyecto:
- Revisa el README.md principal
- Consulta la documentación de Supabase
- Revisa las guías WCAG 2.2

---

**¡Listo! Ahora puedes usar Enertech y demostrar todas sus funcionalidades accesibles** 🌱⚡
