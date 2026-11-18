"use client";

import * as React from "react";
import { appStore } from "@/lib/store";
import { Notification } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, AlertTriangle, Calendar, Wrench } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const loadNotifs = React.useCallback(() => {
    setNotifications(appStore.getNotifications());
  }, []);

  React.useEffect(() => {
    loadNotifs();
    const unsubscribe = appStore.subscribe(loadNotifs);
    return unsubscribe;
  }, [loadNotifs]);

  const markAllRead = () => {
    notifications.forEach((n) => appStore.markNotificationRead(n.id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications & Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">
            System reminders for rent dues, overdue accounts, tenant move-outs, and maintenance updates
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs h-8">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            onClick={() => appStore.markNotificationRead(notif.id)}
            className={`p-4 transition-all cursor-pointer border-slate-200 ${
              notif.is_read ? "bg-white" : "bg-blue-50/40 border-blue-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg mt-0.5 ${
                    notif.type === "overdue_rent"
                      ? "bg-rose-100 text-rose-600"
                      : notif.type === "move_out_reminder"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {notif.type === "overdue_rent" ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : notif.type === "move_out_reminder" ? (
                    <Calendar className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">{formatDateTime(notif.created_at)}</p>
                </div>
              </div>

              {!notif.is_read && (
                <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
