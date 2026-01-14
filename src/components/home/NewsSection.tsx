import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { newsArticles } from "@/data/newsArticles";
import { Button } from "@/components/ui/button";

export function NewsSection() {
  // Show up to 3 latest articles
  const latestArticles = newsArticles.slice(0, 3);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Latest News
          </h2>
          {newsArticles.length > 3 && (
            <Link to="/news">
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All News <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-6">
          {latestArticles.map((article) => (
            <Link
              key={article.id}
              to={`/news/${article.slug}`}
              className="group flex flex-col md:flex-row gap-6 bg-card rounded-xl p-4 border border-border hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="md:w-48 lg:w-64 flex-shrink-0">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-40 md:h-32 object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                  {article.title}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {article.date}
                  </span>
                  {article.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {article.location}
                    </span>
                  )}
                </div>
                <p className="text-foreground/70 line-clamp-2">
                  {article.excerpt}
                </p>
              </div>
              <div className="hidden md:flex items-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
