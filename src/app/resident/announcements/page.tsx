"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Calendar, Clock, AlertTriangle, Coffee } from "lucide-react";

export default function AnnouncementsPage() {
  const announcements = [
    {
      id: "ann-01",
      title: "Diwali Special Dinner & Holiday Timings",
      category: "Event",
      date: "10 Nov 2026",
      content:
        "Special festive buffet will be served on the terrace floor between 8:00 PM to 10:30 PM. Sweets distribution at the reception desk from 6 PM.",
    },
    {
      id: "ann-02",
      title: "ACT Fibernet Speed Upgrade to 300 Mbps",
      category: "Facility",
      date: "05 Nov 2026",
      content:
        "All floor Wi-Fi access points have been upgraded with dual-band 5GHz routers. Connect to 'GreenNest-5G' using the standard password provided on the notice board.",
    },
    {
      id: "ann-03",
      title: "Mess & Kitchen Schedule Notice",
      category: "Notice",
      date: "01 Nov 2026",
      content:
        "Breakfast: 7:30 AM – 9:30 AM | Lunch (Packed for office): 8:00 AM – 9:00 AM | Dinner: 7:45 PM – 10:00 PM. Kindly inform the mess manager in advance if skipping meals.",
    },
    {
      id: "ann-04",
      title: "Biometric Punch Access Mandatory",
      category: "Security",
      date: "25 Oct 2026",
      content:
        "For everyone's security, please punch in and punch out on the biometric reader at the main entrance gate. Visitors must be registered in the physical log book.",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Announcements & Notices</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Important updates from PG management regarding mess timings, holidays, and maintenance
        </p>
      </div>

      <div className="space-y-3">
        {announcements.map((item) => (
          <Card key={item.id} className="p-4 border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="default" className="text-[10px] uppercase font-semibold">
                {item.category}
              </Badge>
              <span className="text-[11px] text-slate-400 flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> {item.date}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
