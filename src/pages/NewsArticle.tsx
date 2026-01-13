import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { getArticleBySlug, newsArticles } from "@/data/newsArticles";
import { ArrowLeft, Calendar, MapPin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewsArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return <Navigate to="/news" replace />;
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Get other articles for "More News" section
  const otherArticles = newsArticles.filter((a) => a.id !== article.id).slice(0, 2);

  return (
    <Layout>
      <article className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Article header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {article.date}
              </span>
              {article.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {article.location}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="ml-auto"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </header>

          {/* Featured image */}
          <figure className="mb-10">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-auto rounded-xl shadow-lg"
            />
            <figcaption className="text-sm text-muted-foreground mt-3 text-center">
              USA Grappling U15 World Team at Loutraki, Greece 2025
            </figcaption>
          </figure>

          {/* Article content */}
          <div className="prose prose-lg max-w-none">
            {article.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="text-foreground/85 leading-relaxed mb-6">
                {paragraph}
              </p>
            ))}
          </div>

          {/* More news section */}
          {otherArticles.length > 0 && (
            <aside className="mt-16 pt-12 border-t border-border">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                More News
              </h2>
              <div className="space-y-4">
                {otherArticles.map((otherArticle) => (
                  <Link
                    key={otherArticle.id}
                    to={`/news/${otherArticle.slug}`}
                    className="group flex gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <img
                      src={otherArticle.image}
                      alt={otherArticle.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {otherArticle.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {otherArticle.date}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </article>
    </Layout>
  );
};

export default NewsArticle;
