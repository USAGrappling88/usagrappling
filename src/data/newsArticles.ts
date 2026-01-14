import u15WorldTeamImage from "@/assets/news/usa-grappling-u15-world-team-greece-2025.jpg";
import acwaCatchWrestlingImage from "@/assets/news/acwa-catch-wrestling-partnership.jpg";

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  location?: string;
}

export const newsArticles: NewsArticle[] = [
  {
    id: "2",
    slug: "usa-grappling-acwa-catch-wrestling-partnership",
    title: "USA Grappling and American Catch Wrestling Association Partner to Expand Catch Wrestling Competition Nationwide",
    excerpt: "USA Grappling announced a strategic partnership with the American Catch Wrestling Association (ACWA) to expand competitive opportunities nationwide in the grappling style of Catch Wrestling.",
    image: acwaCatchWrestlingImage,
    date: "November 15, 2025",
    location: "Los Angeles",
    content: `USA Grappling, a federally recognized 501(c)(3) nonprofit organization, announced a strategic partnership with the American Catch Wrestling Association (ACWA) to expand competitive opportunities nationwide in the grappling style of Catch Wrestling, one of the foundational disciplines of modern wrestling, submission grappling and mixed martial arts.

The partnership aligns two organizations committed to advancing non-striking combat sports, athlete safety and structured competitive pathways at the youth, collegiate and adult levels.

The American Catch Wrestling Association was founded and is led by Josh Barnett, a former UFC heavyweight champion and internationally recognized submission grappler. Through competition, education and athlete development, ACWA has played a central role in preserving and modernizing Catch Wrestling in the United States.

"At USA Grappling, we are all family in the grappling sports, and the truth will always come out on the mat," said Blair Green, executive director of USA Grappling. "This partnership reflects a shared commitment to honest competition, athlete development and expanding access to grappling opportunities rooted in tradition."

As part of the collaboration, ACWA is building a national Catch Wrestling tournament schedule, creating consistent opportunities for athletes to compete across multiple regions. The season will culminate with national titles awarded at the U.S. Open, establishing a clear competitive pathway from grassroots participation to elite-level recognition.

"We're excited to bring more opportunities for athletes to compete in Catch," Barnett said. "It's the historical foundation of all grappling and MMA, and this partnership helps ensure that legacy continues to grow."

The partnership strengthens USA Grappling's broader mission to educate families and support athletes entering non-striking combat sports, including Catch Wrestling, collegiate and UWW grappling, and sport jiu-jitsu. USA Grappling also provides insurance coverage for athletes, coaches, clubs and sanctioned events, helping ensure safe participation and accountability across all levels of competition.

More details regarding tournament dates, locations and participation requirements are available on the ACWA website.`,
  },
  {
    id: "1",
    slug: "usa-grappling-expands-nationwide-youth-collegiate-support",
    title: "USA Grappling Expands Nationwide Support for Youth and Collegiate Athletes",
    excerpt: "USA Grappling is expanding nationwide efforts to educate families and support athletes entering non-striking combat sports, including catch wrestling, college and UWW grappling, and sport jiu-jitsu.",
    image: u15WorldTeamImage,
    date: "September 16, 2026",
    location: "Los Angeles",
    content: `USA Grappling, a federally recognized 501(c)(3) nonprofit organization, is expanding nationwide efforts to educate families and support athletes entering non-striking combat sports, including catch wrestling, college and UWW grappling, and sport jiu-jitsu.

Led by Executive Director Blair Green, USA Grappling serves as an educational entry point for parents, youth athletes, and collegiate competitors navigating a rapidly growing and often fragmented grappling landscape.

"USA Grappling is the first stop a parent should make when introducing their kids and family to grappling sports," Green said. "We provide information on how to find a quality instructor that's right for a child, along with clear pathways for development, competition, and long-term opportunity."

A core benefit provided by USA Grappling is insurance coverage for athletes, coaches, clubs, and sanctioned events. This coverage helps protect families and organizations by supporting safe participation standards and accountability across youth, collegiate, and adult competition.

In addition to safety and education, USA Grappling offers structured competitive pathways for athletes pursuing higher levels of participation. The organization supports progression from local and regional events to national qualification systems and international travel teams representing the United States.

USA Grappling has won three Senior World Championship team titles and, in 2025, fielded its first U15 national team, which competed internationally and finished second overall as a team. These results reflect the organization's emphasis on long-term athlete development and responsible growth.

As a nonprofit organization, USA Grappling reinvests resources into athlete education, youth development, and expanding access to grappling sports nationwide while maintaining clear standards for coaching, competition, and participant welfare.

More information about USA Grappling is available through the organization's website and social media channels.`,
  },
];

export function getArticleBySlug(slug: string): NewsArticle | undefined {
  return newsArticles.find((article) => article.slug === slug);
}
