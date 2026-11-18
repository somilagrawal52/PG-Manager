"use client";

import * as React from "react";
import { appStore } from "@/lib/store";
import { MaintenanceTicket, TicketStatus, TicketCategory, TicketPriority, Property, Room, Resident } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Wrench, Plus, Search, MessageSquare, Clock, CheckCircle2, User, AlertTriangle, Zap, Droplet, Wifi, Sparkles, Sofa } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function MaintenancePage() {
  const { toast } = useToast();

  const [tickets, setTickets] = React.useState<MaintenanceTicket[]>([]);
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [residents, setResidents] = React.useState<Resident[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Create Ticket Dialog
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [residentId, setResidentId] = React.useState("");
  const [propertyId, setPropertyId] = React.useState("");
  const [roomId, setRoomId] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<TicketCategory>("electrical");
  const [priority, setPriority] = React.useState<TicketPriority>("medium");

  // Ticket Detail / Update Dialog
  const [selectedTicket, setSelectedTicket] = React.useState<MaintenanceTicket | null>(null);
  const [statusUpdate, setStatusUpdate] = React.useState<TicketStatus>("open");
  const [commentText, setCommentText] = React.useState("");

  const loadData = React.useCallback(() => {
    setTickets(appStore.getTickets());
    const props = appStore.getProperties();
    setProperties(props);
    const resList = appStore.getResidents().filter((r) => r.status === "active");
    setResidents(resList);
    const rms = appStore.getRooms();
    setRooms(rms);

    if (resList.length > 0 && !residentId) {
      setResidentId(resList[0].id);
      if (resList[0].current_stay) {
        setPropertyId(resList[0].current_stay.property_id);
        if (resList[0].current_stay.room) {
          setRoomId(resList[0].current_stay.room.id);
        }
      }
    }
  }, [residentId]);

  React.useEffect(() => {
    loadData();
    const unsubscribe = appStore.subscribe(loadData);
    return unsubscribe;
  }, [loadData]);

  const handleResidentSelect = (id: string) => {
    setResidentId(id);
    const res = residents.find((r) => r.id === id);
    if (res?.current_stay) {
      setPropertyId(res.current_stay.property_id);
      if (res.current_stay.room) {
        setRoomId(res.current_stay.room.id);
      }
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ticket = appStore.createTicket({
        organization_id: appStore.getState().organization.id,
        property_id: propertyId || properties[0].id,
        room_id: roomId || undefined,
        resident_id: residentId,
        title,
        description,
        category,
        priority,
      });

      toast({
        title: "Ticket Raised",
        description: `Ticket ${ticket.ticket_number} created successfully.`,
        type: "success",
      });

      setIsCreateOpen(false);
      setTitle("");
      setDescription("");
    } catch (err: any) {
      toast({ title: "Failed to create ticket", description: err.message, type: "error" });
    }
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      appStore.updateTicketStatus(selectedTicket.id, statusUpdate, commentText || undefined);
      toast({
        title: "Ticket Status Updated",
        description: `Status changed to ${statusUpdate.replace("_", " ").toUpperCase()}.`,
        type: "success",
      });
      setSelectedTicket(null);
      setCommentText("");
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, type: "error" });
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchNum = t.ticket_number.toLowerCase().includes(q);
      const matchRes = t.resident?.full_name.toLowerCase().includes(q);
      if (!matchTitle && !matchNum && !matchRes) return false;
    }
    return true;
  });

  const getCategoryIcon = (cat: TicketCategory) => {
    switch (cat) {
      case "electrical":
        return <Zap className="h-4 w-4 text-amber-500" />;
      case "plumbing":
        return <Droplet className="h-4 w-4 text-blue-500" />;
      case "internet":
        return <Wifi className="h-4 w-4 text-purple-500" />;
      case "cleaning":
        return <Sparkles className="h-4 w-4 text-emerald-500" />;
      case "furniture":
        return <Sofa className="h-4 w-4 text-orange-500" />;
      default:
        return <Wrench className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Maintenance & Complaints</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track repairs, assign electricians/plumbers, update statuses, and log resident resolution notes
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-xs h-8">
          <Plus className="h-3.5 w-3.5 mr-1" /> Raise New Ticket
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-500 font-medium hidden md:inline">Status:</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              {["all", "open", "in_progress", "resolved", "closed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md capitalize font-medium transition-all ${
                    statusFilter === st ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
            >
              <option value="all">All Categories</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="internet">Internet / Wi-Fi</option>
              <option value="cleaning">Housekeeping</option>
              <option value="furniture">Furniture</option>
              <option value="other">Other</option>
            </select>

            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search ticket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <Card className="p-8 text-center text-slate-400">
            <Wrench className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">No maintenance tickets found.</p>
            <p className="text-xs text-slate-400 mt-1">All issues have been resolved or filter is empty.</p>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              onClick={() => {
                setSelectedTicket(ticket);
                setStatusUpdate(ticket.status);
              }}
              className="p-4 hover:shadow-md transition-all cursor-pointer border-slate-200 bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getCategoryIcon(ticket.category)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {ticket.ticket_number}
                      </span>
                      <Badge
                        variant={
                          ticket.priority === "urgent"
                            ? "destructive"
                            : ticket.priority === "high"
                            ? "warning"
                            : "secondary"
                        }
                        className="uppercase text-[9px] py-0 px-1.5"
                      >
                        {ticket.priority}
                      </Badge>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 capitalize">{ticket.category}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{ticket.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{ticket.description}</p>

                    <p className="text-[11px] text-slate-400 mt-1.5 flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {ticket.resident?.full_name} • {ticket.property?.name}
                      {ticket.room && ` (Room ${ticket.room.room_number})`}
                      <span className="mx-1.5">•</span>
                      <Clock className="h-3 w-3 mr-1" /> {formatDateTime(ticket.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0">
                  <Badge
                    variant={
                      ticket.status === "open"
                        ? "destructive"
                        : ticket.status === "in_progress"
                        ? "warning"
                        : "success"
                    }
                    className="capitalize text-xs px-2.5 py-0.5"
                  >
                    {ticket.status.replace("_", " ")}
                  </Badge>

                  {ticket.comments && ticket.comments.length > 0 && (
                    <span className="text-[11px] text-slate-500 flex items-center mt-1">
                      <MessageSquare className="h-3 w-3 mr-1 text-slate-400" />
                      {ticket.comments.length} Update{ticket.comments.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Ticket Details & Status Update Dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-500">
                  {selectedTicket.ticket_number}
                </span>
                <Badge
                  variant={
                    selectedTicket.status === "open"
                      ? "destructive"
                      : selectedTicket.status === "in_progress"
                      ? "warning"
                      : "success"
                  }
                  className="capitalize"
                >
                  {selectedTicket.status.replace("_", " ")}
                </Badge>
              </div>
              <DialogTitle className="text-base mt-1">{selectedTicket.title}</DialogTitle>
              <DialogDescription>
                Raised by {selectedTicket.resident?.full_name} ({selectedTicket.resident?.phone}) on{" "}
                {formatDate(selectedTicket.created_at)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="font-semibold text-slate-900 mb-1">Issue Description:</p>
                <p className="text-slate-700 leading-relaxed">{selectedTicket.description}</p>
              </div>

              {/* Comments & Updates thread */}
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Activity Log & Staff Updates:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(!selectedTicket.comments || selectedTicket.comments.length === 0) ? (
                    <p className="text-slate-400 italic">No notes posted yet.</p>
                  ) : (
                    selectedTicket.comments.map((comm) => (
                      <div key={comm.id} className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                        <div className="flex justify-between items-center text-[10px] text-blue-900 font-semibold mb-0.5">
                          <span>{comm.author_name}</span>
                          <span className="text-slate-400">{formatDateTime(comm.created_at)}</span>
                        </div>
                        <p className="text-slate-700">{comm.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="pt-2 border-t border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Update Status</label>
                    <select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value as TicketStatus)}
                      className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Post Note / Staff Comment</label>
                  <Input
                    placeholder="e.g. Electrician scheduled for 4 PM today"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>

                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                    Close
                  </Button>
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Save Updates
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Ticket Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Raise Maintenance Ticket</DialogTitle>
            <DialogDescription>
              Submit an operational or maintenance request for a property room
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Resident</label>
              <select
                value={residentId}
                onChange={(e) => handleResidentSelect(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium"
                required
              >
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.full_name} • {r.current_stay?.property?.name || ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="internet">Internet / Wi-Fi</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="furniture">Furniture</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Complaint Title</label>
              <Input
                placeholder="e.g. Geyser tripping circuit breaker"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Detailed Description</label>
              <Input
                placeholder="Explain the problem in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                Submit Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
