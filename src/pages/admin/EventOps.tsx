import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Plus,
  Calendar,
  MapPin,
  ExternalLink,
  Trash2,
  Archive,
  ArchiveRestore,
  Pencil,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getStateAbbreviation, EVENT_STYLE_CONFIG } from "@/lib/stateAbbreviations";

type EventStyle = "catch_wrestling" | "college" | "grappling" | "sport_jiu_jitsu";

interface Event {
  id: string;
  name: string;
  event_date: string;
  location: string;
  state_abbr: string;
  notes: string | null;
  registration_url: string | null;
  style: EventStyle;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export const EventPanel = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "archived">("upcoming");
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    event_date: undefined as Date | undefined,
    location: "",
    notes: "",
    registration_url: "",
    style: "grappling" as EventStyle,
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user && isAdmin,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const filteredEvents = events?.filter((event) => {
    const eventDate = new Date(event.event_date);
    eventDate.setHours(0, 0, 0, 0);
    if (activeTab === "archived") return event.is_archived;
    if (activeTab === "past") return !event.is_archived && eventDate < today;
    return !event.is_archived && eventDate >= today;
  }) || [];

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const stateAbbr = getStateAbbreviation(data.location);
      const { data: newEvent, error } = await supabase
        .from("events")
        .insert({
          name: data.name,
          event_date: format(data.event_date!, "yyyy-MM-dd"),
          location: data.location,
          state_abbr: stateAbbr || "US",
          notes: data.notes || null,
          registration_url: data.registration_url || null,
          style: data.style,
        })
        .select()
        .single();
      if (error) throw error;
      return newEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
      setIsCreateOpen(false);
      resetForm();
      toast.success("Event created successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const stateAbbr = getStateAbbreviation(data.location);
      const { error } = await supabase
        .from("events")
        .update({
          name: data.name,
          event_date: format(data.event_date!, "yyyy-MM-dd"),
          location: data.location,
          state_abbr: stateAbbr || "US",
          notes: data.notes || null,
          registration_url: data.registration_url || null,
          style: data.style,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
      setIsEditOpen(false);
      setSelectedEvent(null);
      resetForm();
      toast.success("Event updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async ({ id, archive }: { id: string; archive: boolean }) => {
      const { error } = await supabase
        .from("events")
        .update({ is_archived: archive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
      toast.success(variables.archive ? "Event archived!" : "Event restored!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      setDeleteConfirmText("");
      toast.success("Event deleted permanently!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      event_date: undefined,
      location: "",
      notes: "",
      registration_url: "",
      style: "grappling",
    });
  };

  const syncAcwaEvents = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-acwa-events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["admin-events"] });
        queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
      } else {
        toast.error(`Sync failed: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    const [year, month, day] = event.event_date.split("-").map(Number);
    setFormData({
      name: event.name,
      event_date: new Date(year, month - 1, day),
      location: event.location,
      notes: event.notes || "",
      registration_url: event.registration_url || "",
      style: event.style,
    });
    setIsEditOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-foreground">Event Operations</h2>
        <div className="flex gap-3">
          <Button 
            onClick={syncAcwaEvents} 
            variant="outline"
            disabled={isSyncing}
            className="border-accent text-accent hover:bg-accent/10"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing..." : "Sync ACWA"}
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {events?.filter(e => !e.is_archived && new Date(e.event_date) >= today).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Past</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {events?.filter(e => !e.is_archived && new Date(e.event_date) < today).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Archived</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">
              {events?.filter(e => e.is_archived).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{events?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Event Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No {activeTab} events found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Style</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => {
                      const styleConfig = EVENT_STYLE_CONFIG[event.style];
                      return (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(event.event_date), "MMM d, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">{event.name}</div>
                            {event.notes && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {event.notes}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-bold">
                                {event.state_abbr}
                              </Badge>
                              <span className="text-sm">{event.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${styleConfig.bgClass} ${styleConfig.textClass}`}>
                              {styleConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {event.registration_url && (
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => archiveMutation.mutate({ id: event.id, archive: !event.is_archived })}
                              >
                                {event.is_archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  setEventToDelete(event);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Add a new event to the calendar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Event Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Pennsylvania Open" />
            </div>
            <div>
              <Label>Event Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.event_date && "text-muted-foreground")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.event_date ? format(formData.event_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker mode="single" selected={formData.event_date} onSelect={(date) => setFormData({ ...formData, event_date: date })} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Fort Worth, Texas" />
              <p className="text-xs text-muted-foreground mt-1">State abbreviation will be auto-generated</p>
            </div>
            <div>
              <Label htmlFor="style">Style *</Label>
              <Select value={formData.style} onValueChange={(v) => setFormData({ ...formData, style: v as EventStyle })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_STYLE_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="registration_url">Registration URL</Label>
              <Input id="registration_url" type="url" value={formData.registration_url} onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional information..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(formData)} disabled={!formData.name || !formData.event_date || !formData.location || createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Event Name *</Label>
              <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Event Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.event_date && "text-muted-foreground")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.event_date ? format(formData.event_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker mode="single" selected={formData.event_date} onSelect={(date) => setFormData({ ...formData, event_date: date })} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="edit-location">Location *</Label>
              <Input id="edit-location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-style">Style *</Label>
              <Select value={formData.style} onValueChange={(v) => setFormData({ ...formData, style: v as EventStyle })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_STYLE_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-registration">Registration URL</Label>
              <Input id="edit-registration" type="url" value={formData.registration_url} onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedEvent && updateMutation.mutate({ id: selectedEvent.id, data: formData })} disabled={!formData.name || !formData.event_date || !formData.location || updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Event Permanently</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Type the event name to confirm:
              <br /><strong className="text-foreground">{eventToDelete?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type event name to confirm..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeleteConfirmText(""); }}>Cancel</Button>
            <Button variant="destructive" onClick={() => eventToDelete && deleteMutation.mutate(eventToDelete.id)} disabled={deleteConfirmText !== eventToDelete?.name || deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventPanel;
