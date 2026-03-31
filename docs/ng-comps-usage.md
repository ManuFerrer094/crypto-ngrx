# ng-comps en `ngrx-demo`

## Diagnóstico corto

- La app usa Angular standalone con `bootstrapApplication`, `provideRouter` y componentes standalone.
- La base está en Angular `21.2.x` y RxJS `7.8.x`, compatible con `ng-comps`.
- Para integrar la librería se añadieron los peers faltantes que exige el paquete publicado: `@angular/animations`, `@angular/material` y `@angular/cdk`.
- Se configuró una fuente de Material Icons en [src/index.html](/C:/Repos/ngrx-demo/src/index.html) porque varios componentes de `ng-comps` usan iconografía basada en `mat-icon`.

## 1. Instalación

```bash
npm install ng-comps @angular/animations @angular/material @angular/cdk
```

Si el workspace resuelve patches de Angular distintos, alinea primero el árbol a la misma familia `21.2.x` para evitar conflictos de peers.

## 2. Imports globales

En [src/styles.scss](/C:/Repos/ngrx-demo/src/styles.scss):

```scss
@import 'ng-comps/theme/tokens.css';
@import 'ng-comps/styles.css';
```

En [src/app/app.config.ts](/C:/Repos/ngrx-demo/src/app/app.config.ts) se añadió `provideAnimations()` para overlays, tooltips, dialogs y componentes Material envueltos por la librería.

## 3. Patrón de imports standalone

Importa solo lo que consuma cada pantalla o componente:

```ts
import {
  MfAlertComponent,
  MfButtonComponent,
  MfCardComponent,
  MfInputComponent,
  MfProgressBarComponent,
  MfSlideToggleComponent,
} from 'ng-comps';

@Component({
  imports: [
    ReactiveFormsModule,
    MfAlertComponent,
    MfButtonComponent,
    MfCardComponent,
    MfInputComponent,
    MfProgressBarComponent,
    MfSlideToggleComponent,
  ],
})
export class MarketsPageComponent {}
```

Referencia real: [markets-page.component.ts](/C:/Repos/ngrx-demo/src/app/features/markets/containers/markets-page/markets-page.component.ts).

## 4. Uso con formularios

En esta app el ejemplo real está en el filtro del dashboard:

```ts
readonly filterForm = new FormGroup({
  query: new FormControl('', { nonNullable: true }),
  favoritesOnly: new FormControl(false, { nonNullable: true }),
});
```

```html
<form [formGroup]="filterForm">
  <mf-input
    formControlName="query"
    label="Search markets"
    placeholder="BTC, ETH, SOL or USD"
    leadingIcon="search"
    [fullWidth]="true"
  />

  <mf-slide-toggle
    formControlName="favoritesOnly"
    label="Show only watchlist markets in the main board"
  />
</form>
```

Esto funciona porque `MfInputComponent` y `MfSlideToggleComponent` implementan `ControlValueAccessor`.

## 5. Uso de overlays

Para diálogos usa `MfDialogService`, no `MatDialog` directamente desde la pantalla:

```ts
private readonly dialog = inject(MfDialogService);

openFeedInfo(): void {
  this.dialog.open(MarketFeedInfoDialogComponent, {
    ariaLabel: 'About the live market feed',
    restoreFocus: true,
  });
}
```

Referencia real: [markets-page.component.ts](/C:/Repos/ngrx-demo/src/app/features/markets/containers/markets-page/markets-page.component.ts) y [market-feed-info-dialog.component.ts](/C:/Repos/ngrx-demo/src/app/features/markets/components/market-feed-info-dialog/market-feed-info-dialog.component.ts).

Para feedback transient usa `MfSnackbarService`:

```ts
private readonly snackbar = inject(MfSnackbarService);

this.snackbar.success(`${symbol} saved to the watchlist.`);
```

## 6. Catálogo resumido y cuándo usar cada uno

- `MfButtonComponent`: acciones primarias, secundarias o de texto. Ya se usa en dashboard y detalle.
- `MfAlertComponent`: errores, avisos de estado y mensajes persistentes. Ya sustituye avisos planos en dashboard y detalle.
- `MfCardComponent`: agrupar contenido o formularios cortos. En esta app envuelve el panel de filtros.
- `MfInputComponent`, `MfTextareaComponent`: texto corto y largo con label visible y CVA.
- `MfSelectComponent`, `MfAutocompleteComponent`, `MfDatepickerComponent`: selección guiada y entradas asistidas con formularios.
- `MfCheckboxComponent`, `MfRadioButtonComponent`, `MfSlideToggleComponent`: booleanos y decisiones discretas.
- `MfTableComponent`: datasets tabulares con acciones explícitas por fila. En esta app reemplaza el grid manual de markets.
- `MfPaginatorComponent`: paginación standalone cuando no venga integrada en otro contenedor.
- `MfToolbarComponent`: cabeceras de pantalla o secciones con acciones proyectadas.
- `MfBreadcrumbComponent`: navegación jerárquica. Ya se usa en el detalle.
- `MfMenuComponent`: acciones compactas o menús contextuales.
- `MfDialogComponent` + `MfDialogService`: overlays modales accesibles.
- `MfSnackbarService`: feedback transient no bloqueante.
- `MfTooltipDirective`: tooltips breves; preferir la directiva antes que `MfTooltipComponent`.
- `MfProgressBarComponent`, `MfProgressSpinnerComponent`: estados de carga y progreso.
- `MfAccordionComponent`, `MfTabsComponent`: organización progresiva de contenido denso.
- `MfBadgeComponent`, `MfChipComponent`: conteos, etiquetas compactas y estados breves.
- `MfAvatarComponent`, `MfIconComponent`: identidad visual e iconografía de apoyo.
- `MfDividerComponent`: separación visual ligera.
- `MfFormFieldComponent`: contenedor estructural cuando necesites componer campos personalizados.
- `MfGridListComponent`: mosaicos o resúmenes con layout de tiles.
- `MfSidenavComponent`: navegación lateral con items y contenido proyectado.

## 7. Accesibilidad y anti-patrones

- Todo control interactivo debe tener nombre accesible con `label`, `ariaLabel` o `ariaLabelledby`.
- No uses `placeholder` como único label.
- Si un botón es solo icono, añade `ariaLabel`.
- No conviertas una fila completa de tabla en el click target principal; usa `rowActions` explícitas.
- No abras overlays por APIs de bajo nivel si la librería ya ofrece `MfDialogService`.
- Mantén `focus` visible cuando personalices estilos o tokens.
- Si usas iconos con `mat-icon`, asegura una estrategia de fuente o registro; esta app lo resuelve en [src/index.html](/C:/Repos/ngrx-demo/src/index.html).
- Importa desde `ng-comps` solo lo que necesite cada componente standalone para respetar tree-shaking (`sideEffects: false`).
