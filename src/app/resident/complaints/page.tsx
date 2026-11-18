"use client";

import * as React from "react";
import { appStore } from "@/lib/store";
import { MaintenanceTicket, TicketCategory, TicketPriority, Resident } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Wrench, Plus, MessageSquare, Clock, CheckCircle2, Zap, Droplet, Wifi, Sparkles, Sofa, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ResidentComplaintsPage() {
  const { toast } = useToast();
  const residentId = "res-001"; // Rahul Sharma

  const [tickets, setTickets] = React.useState<MaintenanceTicket[]>([]);
  const [resident, setResident] = React.useState<Resident | undefined>(() => appStore.getResident(residentId));

  // Dialog State
  const [isOpen, setIsOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<TicketCategory>("electrical");
  const [priority, setPriority] = React.useState<TicketPriority>("medium");

  const loadTickets = React.useCallback(() => {
    // Resident can only view their own tickets
    const myTickets = appStore.getTickets().filter((t) => t.resident_id === residentId);
    setTickets(myTickets);
    setResident(appStore.getResident(residentId));
  }, []);

  React.useEffect(() => {
    loadTickets();
    const unsubscribe = appStore.subscribe(loadTickets);
    return unsubscribe;
  }, [loadTickets]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resident?.current_stay) return;

    try {
      const ticket = appStore.createTicket({
        organization_id: appStore.getState().organization.id,
        property_id: resident.current_stay.property_id,
        room_id: resident.current_stay.room?.id,
        resident_id: resident.id,
        title,
        description,
        category,
        priority,
      });

      toast({
        title: "Complaint Ticket Raised",
        description: `Ticket ${ticket.ticket_number} created. Management has been notified.`,
        type: "success",
      });

      setIsOpen(false);
      setTitle("");
      setDescription("");
    } catch (err: any) {
      toast({ title: "Failed to submit complaint", description: err.message, type: "error" });
    }
  };

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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Maintenance Complaints</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit repair requests for your room and track electrician/plumber updates
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-xs h-8">
          <Plus className="h-3.5 w-3.5 mr-1" /> Raise Complaint
        </Button>
      </div>

      <div className="space-y-3">
        {tickets.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 bg-white">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-sm text-slate-800">No Complaints Logged</p>
            <p className="text-xs text-slate-400 mt-1">If anything needs maintenance, click "Raise Complaint" above.</p>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="p-4 border-slate-200 bg-white space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getCategoryIcon(ticket.category)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {ticket.ticket_number}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 capitalize">{ticket.category}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{ticket.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ticket.description}</p>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> Reported on {formatDateTime(ticket.created_at)}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    ticket.status === "open"
                      ? "destructive"
                      : ticket.status === "in_progress"
                      ? "warning"
                      : "success"
                  }
                  className="capitalize text-xs"
                >
                  {ticket.status.replace("_", " ")}
                </Badge>
              </div>

              {/* Staff Updates / Comments */}
              {ticket.comments && ticket.comments.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase text-slate-400">Management Updates:</p>
                  {ticket.comments.map((comm) => (
                    <div key={comm.id} className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-xs">
                      <div className="flex justify-between items-center text-[10px] text-blue-900 font-semibold mb-0.5">
                        <span>{comm.author_name}</span>
                        <span className="text-slate-400">{formatDateTime(comm.created_at)}</span>
                      </div>
                      <p className="text-slate-700">{comm.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Raise Ticket Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Raise Maintenance Request</DialogTitle>
            <DialogDescription>
              Our property staff will inspect and schedule a technician to resolve this
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="electrical">Electrical (Fan / Light / Geyser)</option>
                  <option value="plumbing">Plumbing (Tap / Flush / Leak)</option>
                  <option value="internet">Internet / Wi-Fi</option>
                  <option value="cleaning">Housekeeping / Cleaning</option>
                  <option value="furniture">Furniture / Bed / Latch</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Urgency</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="low">Low (Can wait 2-3 days)</option>
                  <option value="medium">Medium (Within 24 hours)</option>
                  <option value="high">High (Affecting sleep/work)</option>
                  <option value="urgent">Urgent (Water leak / short circuit)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Summary Title</label>
              <Input
                placeholder="e.g. Washroom tap continuously dripping"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Details & Preferred Time</label>
              <Input
                placeholder="Provide details so technician brings proper tools..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                Submit Complaint
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
