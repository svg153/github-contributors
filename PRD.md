# GitHub Repository Company Analyzer

Analizar repositorios de GitHub para identificar las empresas que contribuyen activamente a proyectos open source mediante el análisis de perfiles y emails de contribuidores.

**Experience Qualities**:
1. **Professional** - Interfaz limpia y empresarial que inspire confianza en análisis corporativos
2. **Insightful** - Presenta datos complejos de manera clara y accionable con visualizaciones útiles
3. **Efficient** - Proceso rápido y directo desde URL hasta resultados sin pasos innecesarios

**Complexity Level**: Light Application (multiple features with basic state)
- Maneja múltiples estados (loading, results, errors) con procesamiento de datos en tiempo real y visualización de resultados complejos.

## Essential Features

**Repository URL Input**
- Functionality: Campo de entrada para URLs de repositorios GitHub con validación
- Purpose: Punto de entrada principal para iniciar el análisis
- Trigger: Usuario pega/escribe URL del repositorio
- Progression: Input → Validation → Submit button activation → Analysis starts
- Success criteria: URL válida acepta formatos github.com/owner/repo y variaciones

**Contributor Analysis Engine**
- Functionality: Extrae contribuidores del repo y analiza sus perfiles/emails para identificar empresas
- Purpose: Core del análisis - conectar desarrolladores con sus empresas
- Trigger: Submit del formulario con URL válida
- Progression: API calls → Fetch contributors → Analyze profiles → Extract company data → Aggregate results
- Success criteria: Identifica al menos 70% de empresas cuando la información está disponible

**Company Results Dashboard**
- Functionality: Muestra empresas encontradas con métricas de contribución y lista de desarrolladores
- Purpose: Presentar insights accionables sobre participación corporativa
- Trigger: Completado del análisis
- Progression: Raw data → Company grouping → Sort by contribution → Display with metrics
- Success criteria: Resultados claros con contribuciones cuantificadas y desarrolladores identificados

**Contributor Details View**
- Functionality: Lista expandible de contribuidores por empresa con sus perfiles
- Purpose: Permitir análisis granular de quién contribuye desde dónde
- Trigger: Click en empresa o toggle de detalles
- Progression: Company selection → Show contributor list → Display profile info
- Success criteria: Muestra nombre, email (si disponible), perfil GitHub, y commits count

## Edge Case Handling

- **Private repositories**: Mensaje claro explicando limitaciones de acceso
- **Rate limiting**: Progress indicator y manejo graceful de límites de API
- **Empty repositories**: Detección y mensaje apropiado para repos sin contribuidores
- **Invalid URLs**: Validación en tiempo real con mensajes de error específicos
- **Network failures**: Retry automático con fallback manual
- **Missing company data**: Categoría "Unknown/Individual" para contribuidores sin empresa identificable

## Design Direction

La interfaz debe sentirse como una herramienta profesional de análisis empresarial - clean, data-driven, y confiable, similar a GitHub Insights o herramientas de analytics corporativas con énfasis en legibilidad de datos.

## Color Selection

Complementary (opposite colors) - Usando azul corporativo como primario con acentos naranjas cálidos para crear contraste visual que guíe la atención hacia insights importantes.

- **Primary Color**: Deep Corporate Blue (oklch(0.45 0.15 240)) - Comunica profesionalismo y confianza
- **Secondary Colors**: Light Gray backgrounds (oklch(0.97 0.01 240)) para cards y contenedores
- **Accent Color**: Warm Orange (oklch(0.65 0.15 45)) para CTAs y métricas importantes
- **Foreground/Background Pairings**: 
  - Background (White oklch(1 0 0)): Dark text (oklch(0.2 0 0)) - Ratio 16:1 ✓
  - Card (Light Gray oklch(0.97 0.01 240)): Dark text (oklch(0.2 0 0)) - Ratio 15:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 240)): White text (oklch(1 0 0)) - Ratio 9.1:1 ✓
  - Accent (Warm Orange oklch(0.65 0.15 45)): White text (oklch(1 0 0)) - Ratio 4.8:1 ✓

## Font Selection

Tipografía que comunique claridad técnica y profesionalismo - usando Inter para su excelente legibilidad en interfaces de datos y análisis.

- **Typographic Hierarchy**:
  - H1 (Page Title): Inter Bold/32px/tight letter spacing
  - H2 (Company Names): Inter Semibold/24px/normal spacing  
  - H3 (Section Headers): Inter Medium/18px/normal spacing
  - Body (Results/Forms): Inter Regular/16px/relaxed line height
  - Small (Metadata): Inter Regular/14px/muted color

## Animations

Animaciones sutiles que comuniquen progreso y jerarquía de información - movimientos que refuercen el flujo de análisis sin distraer de los datos importantes.

- **Purposeful Meaning**: Animaciones de loading que sugieran análisis en progreso, transiciones suaves entre estados de datos
- **Hierarchy of Movement**: Loading states tienen prioridad visual, seguido por aparición de resultados, micro-interacciones en hover para exploration

## Component Selection

- **Components**: 
  - Input/Button para URL submission
  - Card components para company results  
  - Progress component para analysis status
  - Collapsible/Accordion para contributor details
  - Badge components para métricas
  - Skeleton loading states durante análisis
- **Customizations**: Custom company result cards con métricas integradas, custom loading states específicos para GitHub API
- **States**: Loading, success, error states bien definidos; hover effects en company cards; active states en contributor expansion
- **Icon Selection**: GitHub icon para branding, Building/Office icons para empresas, User icons para contribuidores, Chart icons para métricas
- **Spacing**: Generous padding (p-6) en cards principales, tighter spacing (p-4) en nested content, consistent gaps (gap-4) en layouts
- **Mobile**: Stack layout en mobile con company cards full-width, collapsible sidebar en desktop se convierte en modal en mobile