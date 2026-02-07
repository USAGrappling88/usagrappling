// US State abbreviations mapping
export const STATE_ABBREVIATIONS: Record<string, string> = {
  "alabama": "AL",
  "alaska": "AK",
  "arizona": "AZ",
  "arkansas": "AR",
  "california": "CA",
  "colorado": "CO",
  "connecticut": "CT",
  "delaware": "DE",
  "florida": "FL",
  "georgia": "GA",
  "hawaii": "HI",
  "idaho": "ID",
  "illinois": "IL",
  "indiana": "IN",
  "iowa": "IA",
  "kansas": "KS",
  "kentucky": "KY",
  "louisiana": "LA",
  "maine": "ME",
  "maryland": "MD",
  "massachusetts": "MA",
  "michigan": "MI",
  "minnesota": "MN",
  "mississippi": "MS",
  "missouri": "MO",
  "montana": "MT",
  "nebraska": "NE",
  "nevada": "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  "ohio": "OH",
  "oklahoma": "OK",
  "oregon": "OR",
  "pennsylvania": "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  "tennessee": "TN",
  "texas": "TX",
  "utah": "UT",
  "vermont": "VT",
  "virginia": "VA",
  "washington": "WA",
  "west virginia": "WV",
  "wisconsin": "WI",
  "wyoming": "WY",
  "district of columbia": "DC",
  "puerto rico": "PR",
  "guam": "GU",
  "virgin islands": "VI",
  "american samoa": "AS",
  "northern mariana islands": "MP",
};

// Reverse mapping for display
export const ABBREVIATION_TO_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_ABBREVIATIONS).map(([state, abbr]) => [abbr, state])
);

/**
 * Extracts state abbreviation from a location string
 * @param location - Full location string (e.g., "Fort Worth, Texas" or "Pennsylvania")
 * @returns Two-letter state abbreviation or empty string if not found
 */
export function getStateAbbreviation(location: string): string {
  if (!location) return "";
  
  const normalizedLocation = location.toLowerCase().trim();
  
  // Check if location ends with a state name
  for (const [stateName, abbr] of Object.entries(STATE_ABBREVIATIONS)) {
    if (normalizedLocation.includes(stateName)) {
      return abbr;
    }
  }
  
  // Check if it already contains a state abbreviation (e.g., "Fort Worth, TX")
  const parts = location.split(/[,\s]+/);
  for (const part of parts) {
    const upperPart = part.toUpperCase().trim();
    if (Object.values(STATE_ABBREVIATIONS).includes(upperPart)) {
      return upperPart;
    }
  }
  
  return "";
}

// Event style colors using semantic tokens
export const EVENT_STYLE_CONFIG: Record<string, { label: string; bgClass: string; textClass: string; borderClass: string }> = {
  catch_wrestling: {
    label: "Catch Wrestling",
    bgClass: "bg-accent",
    textClass: "text-accent-foreground",
    borderClass: "border-accent",
  },
  college: {
    label: "College",
    bgClass: "bg-secondary",
    textClass: "text-secondary-foreground",
    borderClass: "border-secondary",
  },
  grappling: {
    label: "Grappling",
    bgClass: "bg-primary",
    textClass: "text-primary-foreground",
    borderClass: "border-primary",
  },
  sport_jiu_jitsu: {
    label: "Sport Jiu-Jitsu",
    bgClass: "bg-muted-foreground",
    textClass: "text-background",
    borderClass: "border-muted-foreground",
  },
};
