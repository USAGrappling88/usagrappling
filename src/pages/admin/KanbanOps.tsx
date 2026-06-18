import { useState, useEffect } from "react";
import { opsSupabase } from "@/lib/opsSupabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronRight, CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface KanbanCard {
  id: string;
  title: string;
  description: string | null;
  column_name: string;
  priority: number;
  assignee: string | null;
  due_date: string | null;
  project_id: string | null;
}

interface Project {
  id: string;
  name: string;
  color: string | null;
}

const COLUMNS = ["backlog", "active", "review", "done"] as const;

const COLUMN_LABELS: Record<(typeof COLUMNS)[number], string> = {
  backlog: "Backlog",
  active: "Active",
  review: "Review",
  done: "Done",
};

const COLUMN_COLORS: Record<(typeof COLUMNS)[number], string> = {
  backlog: "bg-gray-50 border-gray-200",
  active: "bg-blue-50 border-blue-200",
  review: "bg-yellow-50 border-yellow-200",
  done: "bg-green-50 border-green-200",
};

const COLUMN_HEADER_COLORS: Record<(typeof COLUMNS)[number], string> = {
  backlog: "text-gray-600",
  active: "text-blue-600",
  review: "text-yellow-600",
  done: "text-green-600",
};

const PRIORITY_ICONS: Record<number, string> = {
  1: "🔴",
  2: "🟠",
  3: "🟡",
  4: "⚪",
};

const NEXT_COLUMN: Record<string, string | undefined> = {
  backlog: "active",
  active: "review",
  review: "done",
};

export const KanbanPanel = () => {
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "review">("active");

  const fetchData = async () => {
    setLoading(true);
    const [cardsRes, projRes] = await Promise.all([
      opsSupabase.from("kanban_cards").select("*").order("priority").order("title"),
      opsSupabase.from("projects").select("id, name, color"),
    ]);
    setCards(cardsRes.data || []);
    setProjects(projRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const moveCard = async (card: KanbanCard, targetColumn: string) => {
    setUpdating(card.id);
    const { error } = await opsSupabase
      .from("kanban_cards")
      .update({ column_name: targetColumn })
      .eq("id", card.id);

    if (!error) {
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, column_name: targetColumn } : c));
      toast.success(`"${card.title}" → ${COLUMN_LABELS[targetColumn as (typeof COLUMNS)[number]]}`);
    } else {
      toast.error("Failed to update card");
    }
    setUpdating(null);
  };

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));

  const displayColumns: readonly string[] =
    filter === "active"
      ? (["active", "review", "done"] as const)
      : filter === "review"
      ? (["review", "done"] as const)
      : COLUMNS;

  const stats = {
    backlog: cards.filter(c => c.column_name === "backlog").length,
    active: cards.filter(c => c.column_name === "active").length,
    review: cards.filter(c => c.column_name === "review").length,
    done: cards.filter(c => c.column_name === "done").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {COLUMNS.map(col => (
          <button
            key={col}
            onClick={() => setFilter(col === "backlog" || col === "done" ? "all" : col as any)}
            className={`p-3 rounded-lg border text-left transition-all ${COLUMN_COLORS[col]} ${filter !== "all" && filter === col ? "ring-2 ring-offset-1 ring-primary" : ""}`}
          >
            <div className="text-2xl font-bold text-foreground">{stats[col]}</div>
            <div className={`text-sm font-medium ${COLUMN_HEADER_COLORS[col]}`}>{COLUMN_LABELS[col]}</div>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          {(["all", "active", "review"] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All Columns" : f === "active" ? "Active + forward" : "Review + Done"}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={fetchData}>
          <RotateCcw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Kanban columns */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${displayColumns.length}, minmax(260px, 1fr))` }}>
        {displayColumns.map(col => {
          const colCards = cards.filter(c => c.column_name === col);
          return (
            <div key={col} className={`rounded-xl border ${COLUMN_COLORS[col as (typeof COLUMNS)[number]]} flex flex-col`}>
              <div className={`px-4 py-3 border-b font-semibold text-sm flex items-center justify-between ${COLUMN_HEADER_COLORS[col as (typeof COLUMNS)[number]]}`}>
                <span>{COLUMN_LABELS[col as (typeof COLUMNS)[number]]}</span>
                <Badge variant="secondary">{colCards.length}</Badge>
              </div>

              <div className="p-3 space-y-3 flex-1">
                {colCards.map(card => {
                  const project = card.project_id ? projectMap[card.project_id] : null;
                  const isOverdue = card.due_date && new Date(card.due_date) < new Date() && col !== "done";
                  const nextCol = NEXT_COLUMN[col];

                  return (
                    <Card key={card.id} className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm font-medium leading-tight">
                            {PRIORITY_ICONS[card.priority] || "⚪"}{" "}
                            {card.title}
                          </CardTitle>
                        </div>
                      </CardHeader>

                      {project && (
                        <div className="px-6 pb-2">
                          <Badge
                            variant="outline"
                            style={{ borderColor: project.color || undefined, color: project.color || undefined }}
                          >
                            {project.name}
                          </Badge>
                        </div>
                      )}

                      <CardContent className="pb-3 pt-0 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{card.assignee || "Unassigned"}</span>
                          {card.due_date && (
                            <span className={isOverdue ? "text-destructive font-medium" : ""}>
                              {isOverdue ? "⚠ " : ""}{card.due_date}
                            </span>
                          )}
                        </div>

                        {card.description && (
                          <p className="text-xs text-muted-foreground line-clamp-3">{card.description}</p>
                        )}

                        {/* Action buttons */}
                        {col !== "done" && (
                          <div className="flex items-center gap-2 pt-1">
                            {nextCol && (
                              <Button
                                size="sm"
                                variant="default"
                                disabled={updating === card.id}
                                onClick={() => moveCard(card, nextCol)}
                              >
                                {updating === card.id
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <><ChevronRight className="w-3 h-3" /> {COLUMN_LABELS[nextCol as (typeof COLUMNS)[number]]}</>
                                }
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updating === card.id}
                              onClick={() => moveCard(card, "done")}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" /> Done
                            </Button>
                          </div>
                        )}

                        {col === "done" && (
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updating === card.id}
                              onClick={() => moveCard(card, "active")}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" /> Reopen
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {colCards.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">No cards</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
