# Japan Reis Tracker — App Idee

**Aangemaakt:** 2026-02-23
**Door:** Marten Assen

## Concept

Een persoonlijk Next.js webapplicatie om de Japan reis (eind 2026) bij te plannen en bijhouden. Combinatie van budgettracking, reisplanning en interactieve kaart.

---

## Functionaliteiten

### 1. Budgetbeheer
- Totaalbudget instellen voor de reis
- Kosten per categorie bijhouden: vluchten, accommodatie, activiteiten, eten, vervoer
- Realtime overzicht van resterende budget
- Kosten koppelen aan specifieke bestemmingen/activiteiten

### 2. Reisplanning
- Bestemmingen en activiteiten toevoegen
- Reistijden/routes bijhouden
- Datumplanning (dag-per-dag itinerary)

### 3. Interactieve Kaart
- Google Maps integratie met markers voor alle geplande bestemmingen
- Visuele route op de kaart

### 4. Google Places API Integratie
- Zoeken naar accommodaties, attracties, restaurants
- Automatisch ophalen:
  - Google rating (sterren)
  - Kosten per nacht (bij hotels)
  - Entreekosten (bij attracties)
  - Openingstijden
  - Foto's
- Opgehaalde data automatisch koppelen aan budget

### 5. Notities & Foto's
- Per bestemming/activiteit notities kunnen toevoegen
- Foto's uploaden of koppelen
- Tags/labels voor categorisatie

---

## Tech Stack

| Component | Technologie |
|-----------|-------------|
| Frontend | Next.js 14+ (App Router) |
| Database | PostgreSQL |
| ORM | Prisma |
| Maps | Google Maps JavaScript API |
| Places | Google Places API (New) |
| Styling | Tailwind CSS |
| Auth | NextAuth.js (optioneel, single-user OK) |
| Storage | Local of Supabase Storage (voor foto's) |

---

## Database Schema (globaal)

```sql
-- Reis
Trip: id, name, destination, start_date, end_date, total_budget, currency

-- Dag/Segment
Day: id, trip_id, date, title, notes

-- Activiteit/Bestemming
Activity: id, day_id, name, type (accommodation|attraction|food|transport),
          place_id (Google), lat, lng, cost, currency, rating,
          notes, photos[], booked (bool), duration_minutes

-- Budget regel
BudgetItem: id, trip_id, category, description, amount, date, activity_id (optional)
```

---

## Google API's

- **Maps JavaScript API** — kaart renderen, markers, routes
- **Places API (New)** — zoeken, details ophalen (prijs, rating, foto's)
- API key via Google Cloud Console

---

## Project structuur (Next.js)

```
/app
  /dashboard        — budgetoverzicht
  /map              — interactieve kaart
  /itinerary        — dag-per-dag planning
  /places           — zoeken & toevoegen via Places API
  /api              — server actions / API routes
/components
/lib
  /db               — Prisma client
  /google           — Maps + Places helpers
/prisma
  schema.prisma
```

---

## MVP scope

1. Reis aanmaken met budget
2. Activiteiten toevoegen (handmatig + via Places search)
3. Kaartweergave met markers
4. Budget tracker (uitgegeven vs. beschikbaar)
5. Notities per activiteit

**Nice-to-have v2:**
- Foto uploads
- Route optimalisatie
- Export naar PDF / reisschema
- Mobiel responsief (PWA)
