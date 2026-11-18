import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
        <Building2 className="h-7 w-7" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900">404 — Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mt-2">
        The requested accommodation page or resident record could not be found.
      </p>
      <div className="mt-6 flex space-x-3">
        <Link href="/dashboard">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
