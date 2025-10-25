# 🗄️ Esquema de Base de Datos - Enertech

## Diagrama de Relaciones

```
┌─────────────────────┐
│   auth.users        │
│  (Supabase Auth)    │
└──────────┬──────────┘
           │
           │ 1:1
           │
┌──────────▼──────────┐
│     profiles        │◄────────────────────┐
│                     │                     │
│ - id (PK, FK)       │                     │
│ - email             │                     │
│ - full_name         │                     │
│ - role              │                     │
│ - preferred_lang    │                     │
│ - theme             │                     │
└──────────┬──────────┘                     │
           │                                │
           │ 1:N                            │
           ├────────────────────────────────┤
           │                                │
           │                                │
┌──────────▼──────────┐    ┌───────────────▼──────────┐
│      devices        │    │  consumption_records     │
│                     │    │                          │
│ - id (PK)           │    │ - id (PK)                │
│ - user_id (FK)      │    │ - user_id (FK)           │
│ - name              │    │ - date                   │
│ - device_type       │    │ - kwh_consumed           │
│ - watts             │    │ - cost                   │
│ - hours_per_day     │    │ - notes                  │
│ - is_active         │    │                          │
└─────────────────────┘    └──────────────────────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐    ┌──────────────────────────┐
│   energy_goals      │    │    recommendations       │
│                     │    │                          │
│ - id (PK)           │    │ - id (PK)                │
│ - user_id (FK)      │    │ - title_es               │
│ - target_kwh        │    │ - title_en               │
│ - start_date        │    │ - description_es         │
│ - end_date          │    │ - description_en         │
│ - status            │    │ - category               │
└─────────────────────┘    │ - savings_percent        │
                           │ - is_active              │
                           └─────────┬────────────────┘
           ┌─────────────────────────┘
           │
           │ N:M
           │
┌──────────▼──────────────────┐
│  user_recommendations       │
│                             │
│ - id (PK)                   │
│ - user_id (FK)              │
│ - recommendation_id (FK)    │
│ - status                    │
└─────────────────────────────┘

┌─────────────────────────────┐
│   electricity_rates         │
│                             │
│ - id (PK)                   │
│ - rate_name                 │
│ - cost_per_kwh              │
│ - currency                  │
│ - is_default                │
│ - valid_from                │
└─────────────────────────────┘
```

---

## Descripción de Tablas

### 🔐 `profiles` (Perfiles de Usuario)

Extensión de `auth.users` con información adicional.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | PK, FK a auth.users | NOT NULL, PRIMARY KEY |
| `email` | TEXT | Email del usuario | UNIQUE, NOT NULL |
| `full_name` | TEXT | Nombre completo | NOT NULL |
| `role` | TEXT | Rol del usuario | 'user' o 'admin', DEFAULT 'user' |
| `preferred_language` | TEXT | Idioma preferido | 'es' o 'en', DEFAULT 'es' |
| `theme` | TEXT | Tema visual | 'light' o 'dark', DEFAULT 'light' |
| `created_at` | TIMESTAMPTZ | Fecha de creación | DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | Última actualización | DEFAULT now() |

**RLS Policies:**
- ✅ Usuarios pueden ver/actualizar su propio perfil
- ✅ Admins pueden ver todos los perfiles
- ❌ Nadie puede eliminar perfiles (solo vía auth)

---

### 🔌 `devices` (Dispositivos)

Electrodomésticos y dispositivos electrónicos del usuario.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | PK | DEFAULT uuid_generate_v4() |
| `user_id` | UUID | FK a profiles | NOT NULL, ON DELETE CASCADE |
| `name` | TEXT | Nombre del dispositivo | NOT NULL |
| `device_type` | TEXT | Tipo de dispositivo | ENUM, NOT NULL |
| `watts` | INTEGER | Potencia en watts | > 0, NOT NULL |
| `hours_per_day` | DECIMAL(5,2) | Horas de uso diario | 0-24, DEFAULT 0 |
| `is_active` | BOOLEAN | Dispositivo activo | DEFAULT true |
| `created_at` | TIMESTAMPTZ | Fecha de registro | DEFAULT now() |

**Tipos de Dispositivo:**
- `refrigerator`, `air_conditioner`, `washing_machine`, `dryer`
- `dishwasher`, `television`, `computer`, `water_heater`
- `lighting`, `oven`, `microwave`, `other`

**RLS Policies:**
- ✅ Usuarios CRUD completo sobre sus dispositivos
- ❌ No pueden ver dispositivos de otros usuarios

**Índices:**
- `idx_devices_user_id` en `user_id`
- `idx_devices_active` en `is_active` WHERE `is_active = true`

---

### 📊 `consumption_records` (Registros de Consumo)

Historial de consumo energético del usuario.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | PK | DEFAULT uuid_generate_v4() |
| `user_id` | UUID | FK a profiles | NOT NULL, ON DELETE CASCADE |
| `date` | DATE | Fecha del registro | NOT NULL |
| `kwh_consumed` | DECIMAL(10,2) | kWh consumidos | >= 0, NOT NULL |
| `cost` | DECIMAL(10,2) | Costo en moneda local | >= 0, DEFAULT 0 |
| `notes` | TEXT | Notas opcionales | NULL |
| `created_at` | TIMESTAMPTZ | Fecha de creación | DEFAULT now() |

**Restricciones:**
- UNIQUE(user_id, date) - Un registro por día por usuario

**RLS Policies:**
- ✅ Usuarios CRUD completo sobre sus registros
- ✅ Admins pueden ver todos los registros (solo lectura)

**Índices:**
- `idx_consumption_user_id` en `user_id`
- `idx_consumption_date` en `date DESC`

---

### 🎯 `energy_goals` (Metas de Ahorro)

Objetivos de reducción de consumo establecidos por el usuario.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | PK | DEFAULT uuid_generate_v4() |
| `user_id` | UUID | FK a profiles | NOT NULL, ON DELETE CASCADE |
| `target_kwh` | DECIMAL(10,2) | Objetivo en kWh | > 0, NOT NULL |
| `start_date` | DATE | Fecha de inicio | NOT NULL |
| `end_date` | DATE | Fecha de fin | >= start_date, NOT NULL |
| `status` | TEXT | Estado de la meta | ENUM, DEFAULT 'active' |
| `created_at` | TIMESTAMPTZ | Fecha de creación | DEFAULT now() |

**Estados:**
- `active` - Meta en progreso
- `completed` - Meta alcanzada exitosamente
- `failed` - Meta no alcanzada

**RLS Policies:**
- ✅ Usuarios CRUD completo sobre sus metas

**Índices:**
- `idx_goals_user_id` en `user_id`
- `idx_goals_status` en `status` WHERE `status = 'active'`

---

### 💡 `recommendations` (Recomendaciones)

Consejos de ahorro energético gestionados por administradores.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | PK | DEFAULT uuid_generate_v4() |
| `title_es` | TEXT | Título en español | NOT NULL |
| `title_en` | TEXT | Título en inglés | NOT NULL |
| `description_es` | TEXT | Descripción en español | NOT NULL |
| `description_en` | TEXT | Descripción en inglés | NOT NULL |
| `category` | TEXT | Categoría | ENUM, NOT NULL |
| `potential_savings_percent` | INTEGER | % de ahorro estimado | 0-100 |
| `is_active` | BOOLEAN | Recomendación activa | DEFAULT true |
| `created_at` | TIMESTAMPTZ | Fecha de creación | DEFAULT now() |

**Categorías:**
- `heating` - Calefacción
- `cooling` - Refrigeración
- `lighting` - Iluminación
- `appliances` - Electrodomésticos
- `general` - General

**RLS Policies:**
- ✅ Usuarios autenticados pueden ver recomendaciones activas
- ✅ Solo admins pueden CRUD recomendaciones

**Índices:**
- `idx_recommendations_active` en `is_active` WHERE `is_active = true`

---

### 🔗 `user_recommendations` (Asignación de Recomendaciones)

Tabla pivote para tracking de recomendaciones por usuario.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | PK | DEFAULT uuid_generate_v4() |
| `user_id` | UUID | FK a profiles | NOT NULL, ON DELETE CASCADE |
| `recommendation_id` | UUID | FK a recommendations | NOT NULL, ON DELETE CASCADE |
| `status` | TEXT | Estado | ENUM, DEFAULT 'pending' |
| `created_at` | TIMESTAMPTZ | Fecha de asignación | DEFAULT now() |

**Estados:**
- `pending` - Pendiente de revisar
- `applied` - Aplicada por el usuario
- `dismissed` - Descartada por el usuario

**Restricciones:**
- UNIQUE(user_id, recommendation_id) - Una asignación única

**RLS Policies:**
- ✅ Usuarios pueden ver y actualizar sus asignaciones
- ✅ Admins pueden crear asignaciones

**Índices:**
- `idx_user_recommendations_user_id` en `user_id`
- `idx_user_recommendations_status` en `status`

---

### 💰 `electricity_rates` (Tarifas Eléctricas)

Configuración de costos de electricidad.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | PK | DEFAULT uuid_generate_v4() |
| `rate_name` | TEXT | Nombre de la tarifa | NOT NULL |
| `cost_per_kwh` | DECIMAL(10,4) | Costo por kWh | > 0, NOT NULL |
| `currency` | TEXT | Código de moneda | DEFAULT 'USD' |
| `is_default` | BOOLEAN | Tarifa por defecto | DEFAULT false |
| `valid_from` | DATE | Fecha de inicio | DEFAULT CURRENT_DATE |
| `created_at` | TIMESTAMPTZ | Fecha de creación | DEFAULT now() |

**RLS Policies:**
- ✅ Usuarios autenticados pueden ver tarifas
- ✅ Solo admins pueden CRUD tarifas

**Índices:**
- `idx_electricity_rates_default` en `is_default` WHERE `is_default = true`

---

## 🔒 Row Level Security (RLS)

### Principios de Seguridad

1. **Restrictivo por defecto**: Todas las tablas tienen RLS habilitado
2. **Sin acceso público**: Solo usuarios autenticados pueden acceder
3. **Separación de datos**: Usuarios solo ven sus propios datos
4. **Privilegios de admin**: Administradores tienen vista global

### Funciones Helper de Supabase

```sql
-- Obtener ID del usuario actual
auth.uid()

-- Verificar si es administrador
EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
)
```

### Ejemplo de Policy

```sql
-- Usuarios pueden ver sus propios dispositivos
CREATE POLICY "Users can view own devices"
  ON devices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

---

## 🚀 Datos Iniciales (Seed Data)

### Tasa Eléctrica por Defecto

```sql
INSERT INTO electricity_rates (rate_name, cost_per_kwh, currency, is_default)
VALUES ('Standard Rate', 0.12, 'USD', true);
```

### Recomendaciones Predefinidas

Se incluyen 5 recomendaciones básicas en español e inglés:
1. Ajustar termostato
2. Usar iluminación LED
3. Desconectar dispositivos en standby
4. Limpiar filtros de aire acondicionado
5. Usar electrodomésticos eficientes

---

## 📈 Consultas Útiles

### Consumo Total por Usuario

```sql
SELECT
  p.full_name,
  SUM(cr.kwh_consumed) as total_kwh,
  SUM(cr.cost) as total_cost
FROM profiles p
LEFT JOIN consumption_records cr ON p.id = cr.user_id
GROUP BY p.id, p.full_name
ORDER BY total_kwh DESC;
```

### Dispositivos con Mayor Consumo

```sql
SELECT
  name,
  device_type,
  watts,
  hours_per_day,
  (watts * hours_per_day / 1000) as daily_kwh,
  (watts * hours_per_day / 1000 * 30 * 0.12) as monthly_cost
FROM devices
WHERE user_id = 'USER_ID_HERE'
  AND is_active = true
ORDER BY daily_kwh DESC;
```

### Progreso de Metas

```sql
SELECT
  eg.target_kwh,
  eg.start_date,
  eg.end_date,
  COALESCE(SUM(cr.kwh_consumed), 0) as consumed,
  eg.target_kwh - COALESCE(SUM(cr.kwh_consumed), 0) as remaining,
  (COALESCE(SUM(cr.kwh_consumed), 0) / eg.target_kwh * 100) as progress_percent
FROM energy_goals eg
LEFT JOIN consumption_records cr
  ON cr.user_id = eg.user_id
  AND cr.date BETWEEN eg.start_date AND eg.end_date
WHERE eg.user_id = 'USER_ID_HERE'
  AND eg.status = 'active'
GROUP BY eg.id;
```

---

## 🔄 Mantenimiento de Base de Datos

### Backup Recomendado

Supabase maneja backups automáticos, pero para datos críticos:

```bash
# Exportar esquema
pg_dump -h your-db-host -U postgres -s -d enertech > schema.sql

# Exportar datos
pg_dump -h your-db-host -U postgres -a -d enertech > data.sql
```

### Limpieza de Datos Antiguos

```sql
-- Eliminar registros de consumo mayores a 2 años
DELETE FROM consumption_records
WHERE date < CURRENT_DATE - INTERVAL '2 years';

-- Archivar metas completadas antiguas
UPDATE energy_goals
SET status = 'archived'
WHERE status = 'completed'
  AND end_date < CURRENT_DATE - INTERVAL '1 year';
```

---

## 📊 Estadísticas de Base de Datos

### Tamaño Estimado por Tabla

| Tabla | Filas (estimado por usuario/año) | Tamaño Aprox. |
|-------|----------------------------------|---------------|
| profiles | 1 por usuario | ~1 KB |
| devices | 5-10 por usuario | ~2 KB |
| consumption_records | 365 por usuario/año | ~50 KB/año |
| energy_goals | 12 por usuario/año | ~2 KB/año |
| user_recommendations | 10 por usuario | ~1 KB |
| recommendations | 50 global | ~10 KB |
| electricity_rates | 10 global | ~1 KB |

**Total estimado por usuario/año**: ~55 KB
**Para 1000 usuarios**: ~55 MB/año

---

**Base de datos optimizada para escalabilidad y seguridad** 🛡️📊
