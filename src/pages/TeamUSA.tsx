import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, Users, Shield, Globe, ChevronRight, Dices, DollarSign, Award } from "lucide-react";
import { Link } from "react-router-dom";

const TeamUSA = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[hsl(217,71%,20%)] via-[hsl(217,71%,15%)] to-[hsl(0,0%,8%)] text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTJ2NEgyNFYwSDJ2NGgtNHYyaDR2NGgydi00aDEwdjRoMnYtNGg0di0yaC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <Badge className="mb-6 bg-red-600 text-white border-none text-sm px-4 py-1">2026 Season</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            USA GRAPPLING WORLD TEAM
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-8 font-medium">
            Represent the United States. Compete on the World Stage.
          </p>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            USA Grappling fields National Teams in both No-Gi (UWW Grappling) and Gi (SJJIF) competition, providing athletes with a direct pathway to represent the United States at the highest levels of international grappling.
          </p>
          <p className="text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Athletes earn their position through official qualifying events. Winners secure a place on Team USA with funded opportunities available. Athletes may also petition for non-funded roster spots.
          </p>
          <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8">
            <Link to="/world-team-petition">
              Petition for a Spot <ChevronRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Team Structure */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Team Structure</h2>
          <p className="text-center text-muted-foreground mb-12">USA Grappling currently selects World Teams across Youth and Senior divisions</p>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-blue-600/30 bg-gradient-to-b from-blue-50/50 to-background dark:from-blue-950/20">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">No-Gi National Team (UWW Grappling)</h3>
                </div>
                <p className="text-muted-foreground mb-4">Competes at the UWW Grappling World Championships</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-600" /> October 2026</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /> To Be Announced (currently scheduled for Manama, Bahrain)</div>
                  <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" /> Ruleset: UWW Grappling (No-Gi)</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-600/30 bg-gradient-to-b from-red-50/50 to-background dark:from-red-950/20">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Gi Youth National Team (SJJIF)</h3>
                </div>
                <p className="text-muted-foreground mb-4">Competes at the SJJIF World Championship</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-red-600" /> September 3–6, 2026</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-red-600" /> Japan</div>
                  <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-red-600" /> Ruleset: Gi (SJJIF format)</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-600/30 bg-gradient-to-b from-yellow-50/50 to-background dark:from-yellow-950/20 md:col-span-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Senior National Team — Grand Prize Invitational (SJJIF)</h3>
                    <Badge className="mt-1 bg-green-600 text-white border-none text-xs">Fully Funded</Badge>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">International Grand Prize Invitational — Compete for $20,000+ in team prize money</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-yellow-600" /> September 3, 2026 — Japan</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-yellow-600" /> Japan</div>
                  <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-yellow-600" /> Ruleset: SJJIF (Sport Jiu Jitsu International Federation)</div>
                  <div className="flex items-center gap-2"><Dices className="h-4 w-4 text-yellow-600" /> Dice-Roll Format: Gi & No-Gi</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Make Team USA */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How to Make Team USA</h2>

          {/* No-Gi Trials */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-blue-600" /> No-Gi World Team Trials (UWW)
            </h3>
            <Card>
              <CardContent className="p-8">
                <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> June 6, 2026</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Duncanville Fieldhouse (Dallas/Fort Worth, TX)</div>
                  <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Host: American Grappling Federation (AGF)</div>
                  <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Age Group: U15</div>
                </div>
                <p className="text-muted-foreground">
                  Winning your division at the official UWW Trials in Dallas earns you a place on the USA Grappling World Team.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gi Qualifiers */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-red-600" /> Gi National Qualifiers (SJJIF Pathway)
            </h3>
            <Card>
              <CardContent className="p-8">
                <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> June 27, 2026</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Fort Lauderdale, Florida</div>
                  <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Ages: U11–U17 (Born 2009–2015)</div>
                  <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Rank: Open Belt (All levels welcome)</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tournament Structure */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Tournament Structure: Path to Team USA</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-blue-600">
                <CardContent className="p-6">
                  <Badge className="mb-3 bg-blue-600 text-white border-none">Phase 1</Badge>
                  <h4 className="font-bold text-lg mb-2">Gi Trials (Challenger Bracket)</h4>
                  <p className="text-sm text-muted-foreground mb-1"><strong>Format:</strong> Single elimination</p>
                  <p className="text-sm text-muted-foreground"><strong>Goal:</strong> Determine the Gi Trials Champion for each weight class</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-600">
                <CardContent className="p-6">
                  <Badge className="mb-3 bg-red-600 text-white border-none">Phase 2</Badge>
                  <h4 className="font-bold text-lg mb-2">Final X (Championship Match)</h4>
                  <p className="text-sm text-muted-foreground mb-1"><strong>Matchup:</strong> No-Gi Trials Winner vs. Gi Trials Winner</p>
                  <p className="text-sm text-muted-foreground"><strong>Outcome:</strong> Winner earns the official Team USA position</p>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-6">
              <CardContent className="p-6">
                <h4 className="font-bold mb-3">Scenarios</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Scenario A:</strong> If the No-Gi winner is present, they advance directly to the Final X</p>
                  <p><strong>Scenario B:</strong> If the No-Gi winner is not present or the spot is vacant, Gi finalists compete for the Team USA position</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Senior Selection - Japan */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-600" /> 2026 Team USA Senior Selection (Japan)
            </h3>
            <p className="text-muted-foreground mb-6">International Grand Prize Invitational — SJJIF — Fully Funded</p>

            {/* Eligibility */}
            <Card className="mb-6">
              <CardContent className="p-8">
                <h4 className="font-bold text-lg mb-4">I. Athlete Eligibility & Mandatory Requirements</h4>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Rank:</strong> Applicants must hold a verified Black Belt in Brazilian Jiu-Jitsu.</p>
                  <p><strong>Versatility:</strong> Must be proficient in both Gi and No-Gi (Dice-roll format).</p>
                  <p><strong>Documentation:</strong> Must possess a valid U.S. Passport (valid 6 months past Oct 2026).</p>
                  <p><strong>Licensing:</strong> Must be eligible for SJJIF/ASJJF individual athlete membership.</p>
                </div>
              </CardContent>
            </Card>

            {/* Competition Format */}
            <Card className="mb-6">
              <CardContent className="p-8">
                <h4 className="font-bold text-lg mb-4">II. Competition Format & Weight Divisions</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  This tournament features a unique Team Points structure. Athletes will compete individually, but their wins contribute to a cumulative team score to determine the winner of the $20,000+ Grand Prize.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <Dices className="h-4 w-4" /> The "Dice Roll" Rule
                  </h5>
                  <p className="text-sm text-muted-foreground mb-2">Immediately prior to each match, a dice roll will determine the uniform:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• <strong>Even:</strong> Gi Match</li>
                    <li>• <strong>Odd:</strong> No-Gi Match</li>
                  </ul>
                </div>
                <h5 className="font-semibold mb-3">Weight Divisions</h5>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg"><strong>Men's Lightweight:</strong> Under 76kg</div>
                  <div className="p-3 bg-muted/50 rounded-lg"><strong>Men's Heavyweight:</strong> Over 76kg</div>
                  <div className="p-3 bg-muted/50 rounded-lg"><strong>Women's Lightweight:</strong> Under 64kg</div>
                  <div className="p-3 bg-muted/50 rounded-lg"><strong>Women's Heavyweight:</strong> Over 64kg</div>
                </div>
              </CardContent>
            </Card>

            {/* Funding */}
            <Card className="mb-6 border-2 border-green-600/30">
              <CardContent className="p-8">
                <h4 className="font-bold text-lg mb-4">III. USA Grappling Funding & Coverage</h4>
                <p className="text-sm text-muted-foreground mb-4">Selected athletes will receive a Full Sponsorship Package. USA Grappling will cover all overhead costs associated with the Japan tour:</p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Team Entry Fee", detail: "$2,500 (Covered by USA Grappling)" },
                    { label: "Individual Costs", detail: "All registration and international licensing fees" },
                    { label: "Logistics", detail: "Round-trip international airfare stipend, hotel accommodations, and daily food stipend" },
                    { label: "Uniforms", detail: "Custom Team USA Gi and No-Gi competition kits" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Grand Prize */}
            <Card className="border-2 border-yellow-600/30 bg-gradient-to-b from-yellow-50/50 to-background dark:from-yellow-950/20">
              <CardContent className="p-8 text-center">
                <h4 className="font-bold text-lg mb-2">IV. The Grand Prize</h4>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                  <span className="text-3xl font-extrabold">$20,000+</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  The National Team that wins the overall tournament will receive a cash prize of $20,000+.
                </p>
                <p className="text-sm font-semibold">
                  100% of the Grand Prize winnings will be split equally among the four competing athletes.
                </p>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold">
                <Link to="/world-team-petition">Submit Senior Petition <ChevronRight className="ml-1 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Winner's Package */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[hsl(217,71%,20%)] via-[hsl(217,71%,15%)] to-[hsl(0,0%,8%)] text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Winner's Package</h2>
          <p className="text-blue-200 mb-10">Funded Team USA Athletes receive</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              "Airfare stipend for round-trip international travel",
              "Hotel accommodations for the duration of the event",
              "Food and ground transportation coverage",
              "Competition registration and UWW license fees",
              "Official Team USA gear including competition uniforms and tracksuit",
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-left">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center mb-3 text-sm font-bold">{i + 1}</div>
                <p className="text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Pathways */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Additional Pathways</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Athletes may petition for a non-funded position to represent the United States at the World Championships. This allows qualified athletes to participate beyond the funded roster.
          </p>
          <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold">
            <Link to="/world-team-petition">Submit a Petition <ChevronRight className="ml-1 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Weight Classes */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Weight Classes (Youth Divisions)</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" /> Boys
                </h3>
                <div className="space-y-2">
                  {["47kg (103 lbs)", "53kg (116.6 lbs)", "59kg (129.8 lbs)", "66kg (145.2 lbs)", "73kg (160.6 lbs)", "80kg"].map((w) => (
                    <div key={w} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                      <span className="font-medium">{w}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600" /> Girls
                </h3>
                <div className="space-y-2">
                  {["40kg (88 lbs)", "44kg (96.8 lbs)", "48kg (105.6 lbs)", "52kg (114.4 lbs)", "57kg (125.4 lbs)", "80kg (176 lbs)"].map((w) => (
                    <div key={w} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
                      <span className="font-medium">{w}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Eligibility Requirements</h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              "Active USA Grappling membership is required",
              "Athletes must meet age and weight class requirements",
              "Athletes must be eligible for a valid U.S. passport",
              "Athletes must comply with all USA Grappling rules and standards",
            ].map((req, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm">{req}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[hsl(217,71%,20%)] via-[hsl(217,71%,15%)] to-[hsl(0,0%,8%)] text-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">The Mission</h2>
          <p className="text-lg text-blue-200 mb-4 leading-relaxed">
            USA Grappling is building a national pathway for grappling athletes that connects domestic competition to international opportunity.
          </p>
          <p className="text-xl font-semibold text-white mb-10">
            This is more than a tournament. It is a direct path to representing your country.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8">
              <Link to="/world-team-petition">Petition for a Spot</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="https://usag.uventex.com/memberships" target="_blank" rel="noopener noreferrer">Join USA Grappling</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TeamUSA;
