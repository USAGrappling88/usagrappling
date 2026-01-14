import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Layout } from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function News() {
  const { data: pressReleases, isLoading } = useQuery({
    queryKey: ["all-published-press-releases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_releases")
        .select("id, slug, title, summary, og_image_url, publish_date, category")
        .eq("status", "published")
        .order("publish_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <Link
              to="/"
              className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              News & Press Releases
            </h1>
            <p className="text-primary-foreground/80 mt-4 text-lg">
              Stay up to date with the latest news from USA Grappling
            </p>
          </div>
        </div>

        {/* Articles */}
        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 bg-card rounded-xl p-4 border border-border">
                  <Skeleton className="md:w-48 lg:w-64 h-40 md:h-32 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : !pressReleases || pressReleases.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No news articles available.</p>
            </div>
          ) : (
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
                    <h2 className="text-lg md:text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                      {article.title}
                    </h2>
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
          )}
        </div>
      </div>
    </Layout>
  );
}
