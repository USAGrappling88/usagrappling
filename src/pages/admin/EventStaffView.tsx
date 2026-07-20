import { useEffect, useState } from "react";
import { opsSupabase } from "@/lib/opsSupabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar as CalendarIcon, MapPin } from "lucide-react";

interface EventRow {
  id: string;
  name: string;
  event_date: string;
  city: string | null;
  state: string | null;
  status: string | null;
}

export const EventStaffView = ({ displayName, email }: { displayName: string | null; email: string }) => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // RLS on events restricts event_staff to assigned rows via assigned_event_ids().
    opsSupabase
      .from("events")
      .select("id, name, event_date, city, state, status")
      .order("event_date", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setEvents((data ?? []) as EventRow[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome, {displayName || email}</h2>
        <p className="text-sm text-muted-foreground">Your assigned events</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No events have been assigned to you yet. Reach out to an admin to get access.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => (
            <Card key={ev.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{ev.name}</CardTitle>
                  {ev.status && <Badge variant="outline" className="capitalize">{ev.status}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> {ev.event_date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {ev.city}{ev.state ? `, ${ev.state}` : ""}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventStaffView;
