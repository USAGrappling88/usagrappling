import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, ExternalLink, ArrowRight, Filter, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EVENT_STYLE_CONFIG } from "@/lib/stateAbbreviations";
import { getTodayCentralDateString, parseDateOnly } from "@/lib/dateUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SMOOTHCOMP_URL = "https://usag.smoothcomp.com/en/federation/362/membership";
const EVENTS_URL = "https://usag.smoothcomp.com/en/federation/362/events";

interface Event {
  id: string;
  name: string;
  event_date: string;
  location: string;
  state_abbr: string;
  notes: string | null;
  registration_url: string | null;
  style: string;
  is_archived: boolean;
}

const Events = () => {
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  
  const { data: events, isLoading } = useQuery({
    queryKey: ["public-events", showArchived],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      
      if (!showArchived) {
        query = query.eq("is_archived", false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
  });

  // Filter events
  const filteredEvents = events?.filter((event) => {
    if (styleFilter !== "all" && event.style !== styleFilter) return false;
    return true;
  }) || [];

  // Split into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingEvents = filteredEvents.filter(
    (e) => new Date(e.event_date) >= today && !e.is_archived
  );
  const pastEvents = filteredEvents.filter(
    (e) => new Date(e.event_date) < today || e.is_archived
  );

  // Group by month for upcoming
  const groupedByMonth: Record<string, Event[]> = {};
  upcomingEvents.forEach((event) => {
    const monthKey = format(new Date(event.event_date), "MMMM yyyy");
    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = [];
    }
    groupedByMonth[monthKey].push(event);
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-accent font-semibold text-sm tracking-wider uppercase mb-2 block">
              Competition Calendar
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              2025 Events
            </h1>
            <p className="text-primary-foreground/90 text-lg md:text-xl mb-8">
              Find USA Grappling sanctioned competitions near you.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              <a href={EVENTS_URL} target="_blank" rel="noopener noreferrer">
                View All Events on Smoothcomp
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-secondary border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={styleFilter} onValueChange={setStyleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Styles</SelectItem>
                  {Object.entries(EVENT_STYLE_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Showing {upcomingEvents.length} upcoming events
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? "Hide Past" : "Show Past"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, j) => (
                      <Skeleton key={j} className="h-24 w-full rounded-xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingEvents.length === 0 && pastEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No events found</h3>
              <p className="text-muted-foreground mb-6">
                {styleFilter !== "all" 
                  ? `No ${EVENT_STYLE_CONFIG[styleFilter]?.label || ""} events scheduled.`
                  : "Check back soon for upcoming events."}
              </p>
              <Button asChild className="bg-primary">
                <a href={EVENTS_URL} target="_blank" rel="noopener noreferrer">
                  View Events on Smoothcomp
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Upcoming Events by Month */}
              {Object.entries(groupedByMonth).map(([month, monthEvents]) => (
                <div key={month}>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-primary" />
                    {month}
                    <Badge variant="secondary" className="ml-2">
                      {monthEvents.length} event{monthEvents.length !== 1 ? "s" : ""}
                    </Badge>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {monthEvents.map((event, index) => {
                      const styleConfig = EVENT_STYLE_CONFIG[event.style] || EVENT_STYLE_CONFIG.grappling;
                      
                      return (
                        <Card 
                          key={event.id} 
                          className="border-l-4 hover:shadow-md transition-shadow"
                          style={{ 
                            borderLeftColor: event.style === 'catch_wrestling' 
                              ? 'hsl(var(--accent))' 
                              : event.style === 'grappling' 
                                ? 'hsl(var(--primary))' 
                                : 'hsl(var(--muted-foreground))'
                          }}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              {/* State Badge */}
                              <div className={`flex-shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center ${styleConfig.bgClass} ${styleConfig.textClass}`}>
                                <span className="font-bold text-lg leading-none">{event.state_abbr}</span>
                              </div>
                              
                              {/* Event Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-display font-bold text-foreground text-lg mb-1">
                                  {event.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {format(new Date(event.event_date), "EEEE, MMMM d, yyyy")}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {event.location}
                                  </span>
                                </div>
                                {event.notes && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {event.notes}
                                  </p>
                                )}
                              </div>
                              
                              {/* Register Button */}
                              {event.registration_url && (
                                <a
                                  href={event.registration_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0"
                                >
                                  <Button 
                                    size="sm" 
                                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                                  >
                                    Register
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Past Events */}
              {showArchived && pastEvents.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-muted-foreground mb-6 flex items-center gap-3">
                    Past Events
                    <Badge variant="outline">
                      {pastEvents.length} event{pastEvents.length !== 1 ? "s" : ""}
                    </Badge>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
                    {pastEvents.map((event) => {
                      const styleConfig = EVENT_STYLE_CONFIG[event.style] || EVENT_STYLE_CONFIG.grappling;
                      
                      return (
                        <Card key={event.id} className="border-l-4 border-muted">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className={`flex-shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center bg-muted text-muted-foreground`}>
                                <span className="font-bold text-lg leading-none">{event.state_abbr}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-display font-bold text-foreground text-lg mb-1">
                                  {event.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {format(new Date(event.event_date), "MMMM d, yyyy")}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {event.location}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Host an Event */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Host a Sanctioned Event
            </h2>
            <p className="text-muted-foreground mb-8">
              Want to host a USA Grappling sanctioned event? Get official status, 
              insurance coverage, and promotional support. Event sanctions are $90 per event.
            </p>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              <a href="/contact">Contact Us to Get Started</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
