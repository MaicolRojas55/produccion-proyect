# Branch Protection - Evidencia

## Configuración aplicada

- Rama principal protegida: `main`
- Rama de desarrollo: `desarrollo-rediseño`
- Push directo a main: BLOQUEADO
- Todo cambio requiere Pull Request con aprobación mínima de 1 revisor

## Ramas del proyecto

| Rama | Propósito |
|---|---|
| `main` | Rama principal protegida |
| `desarrollo-rediseño` | Rama base de desarrollo |
| `feature/branch-protection` | Evidencia punto 1 |

## Política de trabajo

1. Nunca hacer push directo a `main`
2. Todo cambio debe venir desde `desarrollo-rediseño`
3. Se requiere Pull Request para mergear a `main`
4. Mínimo 1 aprobación antes de hacer merge
