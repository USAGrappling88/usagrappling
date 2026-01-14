import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function NewsSection() {
  const { data: pressReleases, isLoading } = useQuery({
    queryKey: ["published-press-releases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_releases")
        .select("id, slug, title, summary, og_image_url, publish_date, category")
        .eq("status", "published")
        .order("publish_date", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const { data: totalCount } = useQuery({
    queryKey: ["press-releases-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("press_releases")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");

      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Latest News
          </h2>
          {(totalCount ?? 0) > 5 && (
            <Link to="/news">
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All News <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-6 bg-card rounded-xl p-4 border border-border">
                <Skeleton className="md:w-48 lg:w-64 h-40 md:h-32 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : pressReleases && pressReleases.length > 0 ? (
          <div className="space-y-6">
            {pressReleases.map((article) => (
              <Link
                key={article.id}
                to={`/news/${article.slug}`}
                className="group flex flex-col md:flex-row gap-6 bg-card rounded-xl p-4 border border-border hover:shadow-md hover:border-primary/20 transition-all"
              >
                <div className="md:w-48 lg:w-64 flex-shrink-0">
                  <img
                    src={article.og_image_url || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-40 md:h-32 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {article.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    {article.publish_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(article.publish_date), "MMMM d, yyyy")}
                      </span>
                    )}
                    {article.category && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {article.category}
                      </span>
                    )}
                  </div>
                  <p className="text-foreground/70 line-clamp-2">
                    {article.summary}
                  </p>
                </div>
                <div className="hidden md:flex items-center">
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No news articles available.
          </div>
        )}

        {(totalCount ?? 0) > 5 && (
          <div className="text-center mt-8">
            <Link to="/news">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View All {totalCount} Articles <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
