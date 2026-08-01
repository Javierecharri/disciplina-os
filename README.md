# Disciplina OS

Tu sistema operativo personal de disciplina. Dos pantallas, nada más: un **Habit Tracker** para registrar el día y un **Dashboard** de solo lectura que calcula tu progreso automáticamente. Pensado para usarse todos los días, durante años.

## Cómo ejecutar en local

Requiere Node.js 20+.

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La primera vez, la app se auto-siembra con 6 categorías y ~24 hábitos iniciales (ver `constants/seedCategories.ts` y `constants/seedHabits.ts`). Todo se guarda en `localStorage` del navegador — no hay backend ni cuenta que crear.

```bash
npm run build   # build de producción
npm run start   # sirve el build (tras `npm run build`)
npm run lint     # ESLint
```

## Cómo desplegar en Netlify

El repo ya incluye [`netlify.toml`](./netlify.toml) configurado con `@netlify/plugin-nextjs`:

1. Sube el proyecto a un repositorio Git (GitHub/GitLab/Bitbucket).
2. En Netlify: **Add new site → Import an existing project**, selecciona el repo.
3. Netlify detecta `netlify.toml` automáticamente:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Plugin: `@netlify/plugin-nextjs`
4. Deploy. No hace falta configurar ninguna variable de entorno (v1 no tiene backend).

También puedes desplegar arrastrando el proyecto a [app.netlify.com/drop](https://app.netlify.com/drop) tras un `npm run build` local, aunque el flujo Git es el recomendado para builds reproducibles.

## Variables de entorno

Ninguna en v1. Todo el estado vive en `localStorage`. Cuando se implemente Supabase (ver Roadmap), se añadirán `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Arquitectura

```
app/                      Next.js App Router — solo 3 rutas: /tracker, /dashboard, /settings
components/
  tracker/                Grid editable del Habit Tracker
  dashboard/               Gráficos y tarjetas de solo lectura
  settings/                Editores inline de hábitos/categorías/datos
  shared/                  AppShell, ThemeToggle, CommandPalette
  ui/                      Primitivas shadcn/ui
hooks/                    useHabits, useCategories, useDailyLogs, useDisciplineScore,
                           useInsights, useKeyboardShortcuts, useSettings — y useAppData,
                           el contexto central que carga los datos una vez y los comparte
services/
  repository/              Capa de acceso a datos. Interfaces (types.ts) +
                           implementación localStorage. Cambiar a Supabase en v2 significa
                           escribir un SupabaseRepository que implemente las mismas
                           interfaces — nada por encima de esta capa cambia.
  scoring/                  disciplineScore.ts (el algoritmo) y streaks.ts — funciones puras
  insights/                 Generador de insights automáticos
types/                     Habit, Category, DailyLog, HabitStatus
constants/                 Categorías y hábitos semilla, atajos de teclado, iconos disponibles
utils/                     Fechas, generación de IDs, export/import JSON, resolución de iconos
```

**Principio clave**: ningún componente toca `localStorage` directamente. Todo pasa por
`services/repository`, que expone las interfaces `HabitRepository`, `CategoryRepository`,
`DailyLogRepository` y `AppRepository`. Esto es lo que permite migrar a Supabase en el futuro
sin tocar hooks ni componentes.

### Modelo de datos

```ts
Category { id, name, icon, color, order, createdAt, updatedAt }

Habit {
  id, name, description?, categoryId, weight (1-5), icon, color?,
  active, targetType: "daily" | "weekly" | "custom", targetDays?, order,
  createdAt, updatedAt
}

DailyLog { id, date, habitId, status: "completed" | "partial" | "missed" | "unset", notes?, updatedAt }
```

- **`targetType`** permite que hábitos no-diarios (p. ej. "Networking") no se evalúen los 7
  días de la semana y así no distorsionen el Discipline Score. Todos los hábitos semilla se
  crean como `daily`; se puede cambiar la frecuencia por hábito en Ajustes.
- **`unset`** es un estado explícito (casilla nunca marcada), pero cuenta como incumplido en
  el cálculo del score — así no se puede "hacer trampa" dejando casillas vacías.

### Algoritmo del Discipline Score

Cada estado tiene un valor: `completed = 1`, `partial = 0.5`, `missed`/`unset = 0`.

**Score diario** — media ponderada por peso de los hábitos programados ese día:

```
dailyScore(fecha) = Σ(peso_i × valor_i) / Σ(peso_i) × 100
```

**Score semanal / mensual / anual** — media de los scores diarios del periodo (no acumulado,
así un mes de 31 días no penaliza frente a uno de 28).

**Score por categoría** — misma fórmula, restringida a los hábitos de esa categoría.

**Rachas**:
- *Racha por hábito*: días consecutivos con `status = completed` (un `partial` la corta).
- *Discipline Streak* (la que se muestra en el Dashboard): días consecutivos con
  `dailyScore ≥ umbral`. El umbral es configurable en Ajustes (por defecto 70).
- *Mejor racha*: máximo histórico de cualquiera de las dos.

Toda la lógica vive en [`services/scoring/disciplineScore.ts`](./services/scoring/disciplineScore.ts)
y [`services/scoring/streaks.ts`](./services/scoring/streaks.ts) como funciones puras — fáciles
de testear sin tocar React ni localStorage.

## Atajos de teclado

- `⌘/Ctrl + K` — Command Palette (navegar, cambiar tema, exportar datos)
- En el Habit Tracker, con una celda enfocada: `1` completado, `2` parcial, `3` fallado,
  flechas para moverse por la cuadrícula, `T` salta a la semana actual

## Roadmap (arquitectura ya preparada, sin implementar)

- **Supabase**: sustituir `LocalStorageRepository` por un `SupabaseRepository` (misma
  interfaz `AppRepository`).
- **Login / multi-dispositivo**: capa de auth por encima del repository.
- **Cloud sync**: sincronización en tiempo real vía Supabase Realtime.
- **Notificaciones**: recordatorios diarios (push/local notifications).
- **Widgets**: iOS/Android home screen widgets consumiendo el mismo Discipline Score.
- **Apple Health / Google Calendar / Notion API**: integraciones de solo lectura para
  auto-completar hábitos (pasos, sueño, eventos).

## Notas

- `npm audit` señala 3 advisories "high" heredados de las versiones de `postcss`/`sharp` que
  Next.js empaqueta internamente para su propio pipeline de build e image optimization. Esta
  app no usa `next/image`, y el fix sugerido por `npm audit` implica downgradear a Next 9 (no
  viable). No representan una vulnerabilidad explotable en runtime de esta app.
