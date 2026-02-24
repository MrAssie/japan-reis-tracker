# Design: Budget beheer, activiteiten bewerken & kaart in itinerary

**Datum**: 2026-02-24

## Samenvatting

Drie features toevoegen aan het reisdagboek:
1. Budget beheer — budgetitems bewerken/verwijderen + totaalbudget aanpassen
2. Activiteiten bewerken — bewerk-dialog voor bestaande activiteiten
3. Kaart in itinerary — split-view met routekaart, vervangt aparte /map en /places pagina's

## 1. Budget beheer

### API wijzigingen

**Nieuw: `PUT /api/budget/[id]`**
- Update budgetitem (naam, bedrag, categorie, betaald-status, valuta)

**Nieuw: `DELETE /api/budget/[id]`**
- Verwijder budgetitem

**Bestaand: `PUT /api/trips/[id]`**
- Totaalbudget bijwerken (al beschikbaar)

### UI

Budget-sectie in de itinerary-pagina, boven de dagen:
- BudgetBar (bestaand) met totaalbudget + bewerk-icoon
- Klik bewerk-icoon → dialog om totaalbudget aan te passen
- Lijst van budgetitems: naam, categorie-badge, bedrag, betaald-checkbox
- Hover toont bewerk/verwijder knoppen
- "Item toevoegen" knop onderaan

## 2. Activiteiten bewerken

### UI

Bewerk-dialog (shadcn Dialog):
- Klik op ActivityCard opent dialog met alle velden voorgevuld
- Velden: naam, locatie (PlacesAutocomplete), beschrijving, start/eindtijd, categorie, kosten
- Opslaan knop → `PUT /api/activities/[id]` (bestaat al)
- Verwijder knop onderaan dialog

### Geen API wijzigingen nodig
- PUT en DELETE routes bestaan al

## 3. Kaart in itinerary met route

### Layout

Split-view op itinerary-pagina:
- Links: bestaande daglijst/kanban met activiteiten
- Rechts: kaart met markers en route
- Responsive: op kleine schermen kaart boven lijst als collapsible sectie

### Kaart features

- Markers per activiteit met coördinaten, kleur per categorie
- Polyline verbindt activiteiten chronologisch (dag → dag, activiteit → activiteit op volgorde)
- Klik op marker highlight activiteit in lijst
- Auto-fit bounds op alle markers

### Pagina's verwijderen

- `/map` pagina verwijderen
- `/places` pagina verwijderen
- Sidebar links naar deze pagina's verwijderen
- `/api/places/search` route kan blijven (evt. later hergebruiken)

## Technische stack

- Bestaande componenten: BudgetBar, MapView, PlacesAutocomplete, ActivityCard
- shadcn/ui Dialog voor bewerk-modals
- Google Maps JS API voor kaart + polyline
- Prisma voor database operaties
