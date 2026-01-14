import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getArticleBySlug } from "@/data/newsArticles";

const PressRelease = () => {
  const { slug } = useParams<{ slug: string }>();

  // Try to get from database first
  const { data: dbPressRelease, isLoading, error } = useQuery({
    queryKey: ["press-release", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_releases")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fallback to legacy articles if not found in database
  const legacyArticle = slug ? getArticleBySlug(slug) : undefined;
  
  // Use database record if available, otherwise use legacy article
  const pressRelease = dbPressRelease || (legacyArticle ? {
    title: legacyArticle.title,
    slug: legacyArticle.slug,
    summary: legacyArticle.excerpt,
    body_html: legacyArticle.content.split('\n\n').map(p => `<p>${p}</p>`).join(''),
    publish_date: legacyArticle.date,
    category: null,
    tags: [],
    og_image_url: legacyArticle.image,
    meta_title: legacyArticle.title,
    meta_description: legacyArticle.excerpt,
    canonical_url: `https://www.usa-grappling.com/news/${legacyArticle.slug}`,
    robots_index: true,
    updated_at: legacyArticle.date,
    location: legacyArticle.location,
  } : null);

  // Set SEO meta tags
  useEffect(() => {
    if (pressRelease) {
      // Set document title
      document.title = pressRelease.meta_title || pressRelease.title;

      // Update or create meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", pressRelease.meta_description || pressRelease.summary || "");

      // Set canonical URL
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = pressRelease.canonical_url || `https://www.usa-grappling.com/news/${slug}`;

      // Set Open Graph tags
      const ogTags = [
        { property: "og:title", content: pressRelease.meta_title || pressRelease.title },
        { property: "og:description", content: pressRelease.meta_description || pressRelease.summary || "" },
        { property: "og:url", content: pressRelease.canonical_url || `https://www.usa-grappling.com/news/${slug}` },
        { property: "og:type", content: "article" },
        { property: "og:image", content: pressRelease.og_image_url || "" },
      ];

      ogTags.forEach(({ property, content }) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("property", property);
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
      });

      // Set robots meta tag
      let robotsMeta = document.querySelector('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.setAttribute("name", "robots");
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute("content", pressRelease.robots_index ? "index, follow" : "noindex, nofollow");

      // Add JSON-LD structured data
      let jsonLdScript = document.querySelector('script[type="application/ld+json"]#news-article-schema');
      if (!jsonLdScript) {
        jsonLdScript = document.createElement("script");
        jsonLdScript.setAttribute("type", "application/ld+json");
        jsonLdScript.setAttribute("id", "news-article-schema");
        document.head.appendChild(jsonLdScript);
      }

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: pressRelease.title,
        description: pressRelease.meta_description || pressRelease.summary,
        image: pressRelease.og_image_url || undefined,
        datePublished: pressRelease.publish_date,
        dateModified: pressRelease.updated_at,
        author: {
          "@type": "Organization",
          name: "USA Grappling",
          url: "https://www.usa-grappling.com",
        },
        publisher: {
          "@type": "Organization",
          name: "USA Grappling",
          url: "https://www.usa-grappling.com",
          logo: {
            "@type": "ImageObject",
            url: "https://www.usa-grappling.com/favicon.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": pressRelease.canonical_url || `https://www.usa-grappling.com/news/${slug}`,
        },
      };

      jsonLdScript.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      document.title = "USA Grappling";
      const jsonLdScript = document.querySelector('script[type="application/ld+json"]#news-article-schema');
      if (jsonLdScript) jsonLdScript.remove();
    };
  }, [pressRelease, slug]);

  const handleShare = async () => {
    const shareUrl = pressRelease?.canonical_url || `https://www.usa-grappling.com/news/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: pressRelease?.title,
          text: pressRelease?.summary || "",
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-48 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if ((error && !legacyArticle) || (!pressRelease && !isLoading)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <article className="max-w-4xl mx-auto py-12 px-4">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          {pressRelease.category && (
            <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-4">
              {pressRelease.category}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {pressRelease.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            {pressRelease.publish_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={pressRelease.publish_date}>
                  {format(new Date(pressRelease.publish_date), "MMMM d, yyyy")}
                </time>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </header>

        {/* Featured Image */}
        {pressRelease.og_image_url && (
          <figure className="mb-8">
            <img
              src={pressRelease.og_image_url}
              alt={pressRelease.title}
              className="w-full rounded-lg shadow-lg object-cover max-h-[500px]"
            />
          </figure>
        )}

        {/* Summary */}
        {pressRelease.summary && (
          <div className="text-lg text-muted-foreground mb-8 border-l-4 border-primary pl-4 italic">
            {pressRelease.summary}
          </div>
        )}

        {/* Article Body */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: pressRelease.body_html || "" }}
        />

        {/* Tags */}
        {pressRelease.tags && pressRelease.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {pressRelease.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-muted text-muted-foreground text-sm px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </Layout>
  );
};

export default PressRelease;
