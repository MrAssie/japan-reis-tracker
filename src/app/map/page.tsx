"use client";

import { useEffect, useState } from "react";
import MapView from "@/components/MapView";

interface Activity {
  id: string;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string;
  day: { date: string; title: string };
}

export default function MapPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    try {
      const res = await fetch("/api/activities");
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch {
      console.error("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  }

  const markers = activities
    .filter((a) => a.latitude && a.longitude)
    .map((a) => ({
      id: a.id,
      lat: a.latitude!,
      lng: a.longitude!,
      title: a.name,
      category: a.category,
    }));

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-4">
        <h1 className="text-3xl font-bold text-japan-dark">Kaart</h1>
        <p className="text-japan-gray mt-1">
          Al je activiteiten op de kaart — {markers.length} locaties
        </p>
      </div>

      <div className="flex-1 px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-japan-red border-t-transparent" />
          </div>
        ) : (
          <div className="h-full rounded-xl overflow-hidden border border-gray-200">
            <MapView
              markers={markers}
              center={{ lat: 35.6762, lng: 139.6503 }}
              zoom={6}
            />
          </div>
        )}
      </div>
    </div>
  );
}
