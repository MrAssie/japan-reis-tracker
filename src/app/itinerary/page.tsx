"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ActivityCard from "@/components/ActivityCard";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CalendarDays, Loader2, List, Columns3, GripVertical } from "lucide-react";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

interface Activity {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  startTime: string | null;
  endTime: string | null;
  category: string;
  cost: number;
  currency: string;
  order: number;
}

interface Day {
  id: string;
  date: string;
  title: string;
  notes: string | null;
  activities: Activity[];
}

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  days: Day[];
}

export default function ItineraryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ItineraryContent />
    </Suspense>
  );
}

function ItineraryContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [showAddDay, setShowAddDay] = useState(false);
  const [newDay, setNewDay] = useState({ date: "", title: "", notes: "" });
  const [showAddActivity, setShowAddActivity] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    location: "",
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
    placeId: "",
    startTime: "",
    endTime: "",
    category: "sightseeing",
    cost: 0,
  });

  const fetchTrip = useCallback(async () => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/trips/${tripId}`);
      if (res.ok) {
        const data = await res.json();
        setTrip(data);
      }
    } catch {
      console.error("Failed to fetch trip");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  async function addDay(e: React.FormEvent) {
    e.preventDefault();
    if (!tripId) return;
    try {
      const res = await fetch(`/api/trips/${tripId}/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDay),
      });
      if (res.ok) {
        setShowAddDay(false);
        setNewDay({ date: "", title: "", notes: "" });
        fetchTrip();
      }
    } catch {
      console.error("Failed to add day");
    }
  }

  async function addActivity(e: React.FormEvent, dayId: string) {
    e.preventDefault();
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newActivity, dayId }),
      });
      if (res.ok) {
        setShowAddActivity(null);
        setNewActivity({
          name: "",
          description: "",
          location: "",
          address: "",
          latitude: null,
          longitude: null,
          placeId: "",
          startTime: "",
          endTime: "",
          category: "sightseeing",
          cost: 0,
        });
        fetchTrip();
      }
    } catch {
      console.error("Failed to add activity");
    }
  }

  async function deleteActivity(id: string) {
    try {
      const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
      if (res.ok) fetchTrip();
    } catch {
      console.error("Failed to delete activity");
    }
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination || !trip) return;

    const { source, destination } = result;
    const sourceDayId = source.droppableId;
    const destDayId = destination.droppableId;

    const newDays = trip.days.map((d) => ({
      ...d,
      activities: [...d.activities].sort((a, b) => a.order - b.order),
    }));

    const sourceDay = newDays.find((d) => d.id === sourceDayId);
    const destDay = newDays.find((d) => d.id === destDayId);
    if (!sourceDay || !destDay) return;

    const [moved] = sourceDay.activities.splice(source.index, 1);
    destDay.activities.splice(destination.index, 0, moved);

    // Recalculate orders
    const updates: { id: string; dayId: string; order: number }[] = [];
    for (const day of newDays) {
      day.activities.forEach((a, i) => {
        updates.push({ id: a.id, dayId: day.id, order: i });
        a.order = i;
      });
    }

    setTrip({ ...trip, days: newDays });

    try {
      await fetch("/api/activities/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activities: updates }),
      });
    } catch {
      console.error("Failed to save reorder");
      fetchTrip();
    }
  }

  const sortedDays = trip?.days
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tripId) {
    return (
      <div className="p-8 text-center">
        <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Selecteer een reis vanuit de{" "}
          <Link href="/" className="text-primary hover:underline">
            homepage
          </Link>{" "}
          om je itinerary te bekijken.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 mx-auto space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {trip?.name ?? "Itinerary"}
          </h1>
          {trip && (
            <p className="text-muted-foreground mt-1">
              {new Date(trip.startDate).toLocaleDateString("nl-NL")} —{" "}
              {new Date(trip.endDate).toLocaleDateString("nl-NL")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "kanban")}>
            <TabsList>
              <TabsTrigger value="list" className="gap-1.5">
                <List className="w-3.5 h-3.5" />
                Lijst
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-1.5">
                <Columns3 className="w-3.5 h-3.5" />
                Kanban
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setShowAddDay(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Dag Toevoegen
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {viewMode === "list" ? (
          <div className="space-y-6 max-w-4xl">
            {sortedDays.map((day, index) => (
              <Card key={day.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{day.title}</h2>
                        <p className="text-sm text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("nl-NL", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddActivity(day.id)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Activiteit
                    </Button>
                  </div>

                  {day.notes && (
                    <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
                      {day.notes}
                    </p>
                  )}

                  <Droppable droppableId={day.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-[40px] rounded-lg transition-colors ${snapshot.isDraggingOver ? "bg-accent/50 p-2" : ""}`}
                      >
                        {day.activities
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((activity, actIndex) => (
                            <Draggable key={activity.id} draggableId={activity.id} index={actIndex}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={snapshot.isDragging ? "opacity-90" : ""}
                                >
                                  <div className="flex items-start gap-1">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mt-3 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                      <ActivityCard
                                        activity={activity}
                                        onDelete={() => deleteActivity(activity.id)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {showAddActivity === day.id && (
                    <>
                      <Separator />
                      <form onSubmit={(e) => addActivity(e, day.id)} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Activiteit naam"
                            value={newActivity.name}
                            onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                            required
                          />
                          <PlacesAutocomplete
                            value={newActivity.location}
                            onChange={(value) => setNewActivity({ ...newActivity, location: value })}
                            onPlaceSelect={(place) => setNewActivity({
                              ...newActivity,
                              location: place.name,
                              address: place.address,
                              latitude: place.latitude,
                              longitude: place.longitude,
                              placeId: place.placeId,
                            })}
                            placeholder="Zoek locatie..."
                          />
                        </div>
                        <Input
                          placeholder="Beschrijving"
                          value={newActivity.description}
                          onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                        />
                        <div className="grid grid-cols-4 gap-3">
                          <Input
                            type="time"
                            value={newActivity.startTime}
                            onChange={(e) => setNewActivity({ ...newActivity, startTime: e.target.value })}
                          />
                          <Input
                            type="time"
                            value={newActivity.endTime}
                            onChange={(e) => setNewActivity({ ...newActivity, endTime: e.target.value })}
                          />
                          <Select
                            value={newActivity.category}
                            onValueChange={(value) => setNewActivity({ ...newActivity, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sightseeing">Bezienswaardigheden</SelectItem>
                              <SelectItem value="food">Eten & Drinken</SelectItem>
                              <SelectItem value="transport">Transport</SelectItem>
                              <SelectItem value="shopping">Winkelen</SelectItem>
                              <SelectItem value="accommodation">Overnachting</SelectItem>
                              <SelectItem value="culture">Cultuur</SelectItem>
                              <SelectItem value="nature">Natuur</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder="Kosten"
                            value={newActivity.cost || ""}
                            onChange={(e) => setNewActivity({ ...newActivity, cost: Number(e.target.value) })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm">Toevoegen</Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setShowAddActivity(null)}>
                            Annuleren
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Kanban view */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {sortedDays.map((day, index) => (
              <div key={day.id} className="w-80 shrink-0">
                <div className="bg-muted/50 rounded-xl border">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </span>
                      <h3 className="font-semibold text-sm truncate">{day.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(day.date).toLocaleDateString("nl-NL", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>

                  <Droppable droppableId={day.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-2 space-y-2 min-h-[100px] transition-colors ${snapshot.isDraggingOver ? "bg-accent/30" : ""}`}
                      >
                        {day.activities
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((activity, actIndex) => (
                            <Draggable key={activity.id} draggableId={activity.id} index={actIndex}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={snapshot.isDragging ? "opacity-90" : ""}
                                >
                                  <ActivityCard
                                    activity={activity}
                                    onDelete={() => deleteActivity(activity.id)}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setShowAddActivity(day.id)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Activiteit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DragDropContext>

      {sortedDays.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nog geen dagen gepland. Voeg je eerste dag toe!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Activity Dialog (for kanban view) */}
      {showAddActivity && viewMode === "kanban" && (
        <Dialog open={!!showAddActivity} onOpenChange={() => setShowAddActivity(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Activiteit Toevoegen</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => addActivity(e, showAddActivity)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Naam</Label>
                  <Input
                    placeholder="Activiteit naam"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Locatie</Label>
                  <PlacesAutocomplete
                    value={newActivity.location}
                    onChange={(value) => setNewActivity({ ...newActivity, location: value })}
                    onPlaceSelect={(place) => setNewActivity({
                      ...newActivity,
                      location: place.name,
                      address: place.address,
                      latitude: place.latitude,
                      longitude: place.longitude,
                      placeId: place.placeId,
                    })}
                    placeholder="Zoek locatie..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Beschrijving</Label>
                <Input
                  placeholder="Beschrijving"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Starttijd</Label>
                  <Input
                    type="time"
                    value={newActivity.startTime}
                    onChange={(e) => setNewActivity({ ...newActivity, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Eindtijd</Label>
                  <Input
                    type="time"
                    value={newActivity.endTime}
                    onChange={(e) => setNewActivity({ ...newActivity, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Categorie</Label>
                  <Select
                    value={newActivity.category}
                    onValueChange={(value) => setNewActivity({ ...newActivity, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sightseeing">Bezienswaardigheden</SelectItem>
                      <SelectItem value="food">Eten & Drinken</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="shopping">Winkelen</SelectItem>
                      <SelectItem value="accommodation">Overnachting</SelectItem>
                      <SelectItem value="culture">Cultuur</SelectItem>
                      <SelectItem value="nature">Natuur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Kosten</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newActivity.cost || ""}
                    onChange={(e) => setNewActivity({ ...newActivity, cost: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">Toevoegen</Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddActivity(null)}>
                  Annuleren
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showAddDay} onOpenChange={setShowAddDay}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dag Toevoegen</DialogTitle>
          </DialogHeader>
          <form onSubmit={addDay} className="space-y-4">
            <div className="space-y-2">
              <Label>Datum</Label>
              <Input
                type="date"
                value={newDay.date}
                onChange={(e) => setNewDay({ ...newDay, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                placeholder="Bijv. Stadsverkenning"
                value={newDay.title}
                onChange={(e) => setNewDay({ ...newDay, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Notities</Label>
              <Textarea
                placeholder="Optionele notities voor deze dag"
                value={newDay.notes}
                onChange={(e) => setNewDay({ ...newDay, notes: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">Toevoegen</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddDay(false)}>
                Annuleren
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
