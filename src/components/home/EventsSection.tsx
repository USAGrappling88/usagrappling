import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { EVENT_STYLE_CONFIG } from "@/lib/stateAbbreviations";
import { getTodayCentralDateString, parseDateOnly } from "@/lib/dateUtils";

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

export function EventsSection() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_archived", false)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data as Event[];
    },
  });

  const { data: totalCount } = useQuery({
    queryKey: ["events-count"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const { count, error } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("is_archived", false)
        .gte("event_date", today);

      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-accent font-semibold text-sm tracking-wider uppercase mb-2 block">
            Upcoming Events
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            2025 Competition Calendar
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Find USA Grappling sanctioned events near you. Register now to compete.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-background/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/10">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg bg-primary-foreground/20" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-primary-foreground/20" />
                    <Skeleton className="h-4 w-1/2 bg-primary-foreground/20" />
                  </div>
                  <Skeleton className="w-24 h-10 rounded-md bg-primary-foreground/20" />
                </div>
              </div>
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {events.map((event, index) => {
              const styleConfig = EVENT_STYLE_CONFIG[event.style] || EVENT_STYLE_CONFIG.grappling;
              
              return (
                <div
                  key={event.id}
                  className="bg-background rounded-xl p-5 border-l-4 shadow-lg hover:shadow-xl transition-shadow"
                  style={{ borderLeftColor: `hsl(var(--${event.style === 'catch_wrestling' ? 'accent' : event.style === 'grappling' ? 'primary' : 'muted-foreground'}))` }}
                >
                  <div className="flex items-start gap-4">
                    {/* State Badge */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center ${styleConfig.bgClass} ${styleConfig.textClass}`}>
                      <span className="font-bold text-lg leading-none">{event.state_abbr}</span>
                      <span className="text-[10px] opacity-80">#{index + 1}</span>
                    </div>
                    
                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-foreground text-lg mb-1 truncate">
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-primary-foreground/70">
            No upcoming events. Check back soon!
          </div>
        )}

        {(totalCount ?? 0) > 6 && (
          <div className="text-center mt-10">
            <Link to="/events">
              <Button 
                variant="outline" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                View All {totalCount} Events <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        <p className="text-center text-primary-foreground/60 text-sm mt-8">
          More events to be announced. Follow us for updates.
        </p>
      </div>
    </section>
  );
}
