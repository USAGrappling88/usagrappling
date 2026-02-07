import { useQuery } from "@tanstack/react-query";
import { Instagram, ExternalLink, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

export function InstagramFeedSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["instagram-feed"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-instagram-feed", {
        body: { limit: 8 },
      });

      if (error) throw error;
      return data as { posts: InstagramPost[]; error?: string };
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    retry: 1,
  });

  const posts = data?.posts || [];

  // Don't render section if no posts available
  if (!isLoading && posts.length === 0) {
    return null;
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const truncateCaption = (caption?: string, maxLength = 100) => {
    if (!caption) return "";
    if (caption.length <= maxLength) return caption;
    return caption.substring(0, maxLength).trim() + "...";
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Follow Along
            </h2>
          </div>
          <p className="text-muted-foreground text-center max-w-md">
            Stay connected with the latest from USA Grappling
          </p>
          <a
            href="https://instagram.com/usagrappling"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            @usagrappling
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted rounded-xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Carousel */}
        {!isLoading && posts.length > 0 && (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {posts.map((post) => (
                <CarouselItem
                  key={post.id}
                  className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-muted border border-border shadow-sm hover:shadow-md transition-all duration-300">
                      {/* Image/Video Thumbnail */}
                      <img
                        src={
                          post.media_type === "VIDEO"
                            ? post.thumbnail_url || post.media_url
                            : post.media_url
                        }
                        alt={truncateCaption(post.caption, 50) || "Instagram post"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Video indicator */}
                      {post.media_type === "VIDEO" && (
                        <div className="absolute top-3 right-3 p-1.5 bg-foreground/80 rounded-full">
                          <Play className="w-3 h-3 text-background fill-background" />
                        </div>
                      )}

                      {/* Carousel indicator */}
                      {post.media_type === "CAROUSEL_ALBUM" && (
                        <div className="absolute top-3 right-3 p-1.5 bg-foreground/80 rounded-full">
                          <svg
                            className="w-3 h-3 text-background"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                            <path d="M21 21H7V7h2v12h12z" opacity="0.5" />
                          </svg>
                        </div>
                      )}

                      {/* Hover overlay with caption */}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <p className="text-background text-sm font-medium line-clamp-3">
                          {truncateCaption(post.caption, 120) || "View on Instagram"}
                        </p>
                        <span className="text-background/70 text-xs mt-2">
                          {formatDate(post.timestamp)}
                        </span>
                      </div>
                    </div>
                  </a>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 bg-card border-border shadow-md hover:bg-muted" />
            <CarouselNext className="hidden md:flex -right-4 bg-card border-border shadow-md hover:bg-muted" />
          </Carousel>
        )}

        {/* CTA */}
        {!isLoading && posts.length > 0 && (
          <div className="flex justify-center mt-8">
            <a
              href="https://instagram.com/usagrappling"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white font-medium text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Instagram className="w-4 h-4" />
              Follow @usagrappling
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
