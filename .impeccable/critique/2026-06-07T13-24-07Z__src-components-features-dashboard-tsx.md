---
target: src/components/features/Dashboard.tsx
total_score: 34
p0_count: 0
p1_count: 1
timestamp: 2026-06-07T13-24-07Z
slug: src-components-features-dashboard-tsx
---
#### Design Health Score
| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | |
| 2 | Match System / Real World | 4 | |
| 3 | User Control and Freedom | 4 | |
| 4 | Consistency and Standards | 2 | Gradients colorés intenses et ombres interdites par la charte |
| 5 | Error Prevention | 4 | |
| 6 | Recognition Rather Than Recall | 4 | |
| 7 | Flexibility and Efficiency | 3 | |
| 8 | Aesthetic and Minimalist Design | 2 | Look "néon/SaaS standard" au lieu de "Mindful Vault" |
| 9 | Error Recovery | 4 | |
| 10 | Help and Documentation | 3 | |
| **Total** | | **34/40** | **Needs Theme Alignment** |

#### Anti-Patterns Verdict
**LLM assessment**: C'est le composant qui s'éloigne le plus de la charte *The Mindful Vault*. L'utilisation de grands gradients violets (`#4f46e5` to `#7c3aed`) et d'ombres colorées massives (`boxShadow`) sur la carte "Patrimoine Total" est une violation directe de l'esprit "flat, calm, 1px border" demandé dans le guide de style. De plus, les alertes de budget abusent des arrière-plans teintés (`bg-rose-50/60`).
**Deterministic scan**: Le détecteur automatisé ne remonte pas d'erreur, car le code est fonctionnellement sain. Le problème est purement esthétique et thématique.

#### Overall Impression
La structure de la page est excellente : le carrousel horizontal des comptes, la disposition des KPIs, et les widgets sont bien pensés. Cependant, les choix visuels trahissent l'identité "Zen" de l'application et la font ressembler à n'importe quelle autre application crypto/fintech générique.

#### Priority Issues
1. **[P1] "The Mindful Vault" Violations (Gradients & Ombres)**
   - **Why it matters**: Les dégradés éclatants et les ombres floues annulent le côté calme, plat et sobre de l'interface, créant un choc visuel par rapport aux pages `Analytics` ou `Transactions` que nous avons épurées.
   - **Fix**: Retirer les `linear-gradient` et `box-shadow` sur la carte principale. Passer sur un design `bg-zinc-900 text-white` pur (ou inversement), avec des bordures franches.
   - **Suggested command**: `/impeccable theme`

2. **[P2] Arrière-plans colorés sur les Budgets**
   - **Why it matters**: La section "Alertes & Budgets" utilise de grands pavés de couleurs (rose/ambre) qui saturent la vue.
   - **Fix**: Garder les cartes sur fond blanc/noir et n'utiliser la couleur que pour les barres de progression (`Progress`) ou les bordures, comme nous l'avons fait sur les autres composants.
   - **Suggested command**: `/impeccable layout`

3. **[P3] Typographie des chiffres**
   - **Why it matters**: Bien que la fonction `formatAmount` soit élégante, les gros chiffres (KPIs) manquent de la classe `tabular-nums` pour un rendu strict et professionnel.
   - **Fix**: Ajouter `tabular-nums` sur tous les montants du Dashboard.
   - **Suggested command**: `/impeccable polish`

#### Persona Red Flags
- **Alex (Power User)**: Trouve que la grosse carte violette "Patrimoine Total" détonne par rapport au reste de l'application qui est très pro et sobre.
- **Casey (Distracted Mobile User)**: L'excès de couleurs dans la zone "Alertes" rend difficile la lecture rapide des vraies priorités.
