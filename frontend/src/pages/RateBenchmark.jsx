import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function RateBenchmark() {
  const [query, setQuery] = useState("");
  const [yourRate, setYourRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const fetchBenchmark = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      if (data?.data?.error) {
        setError(data.data.error);
        setStats(null);
      } else if (data?.data) {
        setStats(data.data);
      } else {
        setError("No data returned.");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to fetch benchmark.");
    } finally {
      setLoading(false);
    }
  };

  const parseRate = (v) => {
    if (!v) return null;
    const n = Number(String(v).replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const yr = parseRate(yourRate);

  const compareNote = (() => {
    if (!stats || yr == null) return null;
    const { suggested_range } = stats || {};
    if (!suggested_range) return null;

    const { floor, ceiling } = suggested_range;
    if (yr < floor)
      return {
        tone: "below",
        msg: `Your rate ($${yr}/hr) is below suggested low ($${floor}/hr). Consider raising.`,
      };
    if (yr > ceiling)
      return {
        tone: "above",
        msg: `Your rate ($${yr}/hr) is above suggested high ($${ceiling}/hr). Justify with portfolio & speed.`,
      };
    return {
      tone: "within",
      msg: `Your rate ($${yr}/hr) is within the suggested band ($${floor}–${ceiling}/hr).`,
    };
  })();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Rate Benchmarking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Role or query (e.g. "React developer hourly rate")'
                className="md:col-span-2"
              />
              <Button
                onClick={fetchBenchmark}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Benchmarking..." : "Benchmark"}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                value={yourRate}
                onChange={(e) => setYourRate(e.target.value)}
                placeholder="Your hourly rate (optional, e.g. 85)"
              />
              {compareNote && (
                <div className="md:col-span-2 flex items-center">
                  <Badge
                    className={
                      compareNote.tone === "below"
                        ? "bg-destructive/20 text-destructive"
                        : compareNote.tone === "above"
                          ? "bg-yellow-200/20 text-yellow-700 dark:text-yellow-300"
                          : "bg-green-200/20 text-green-700 dark:text-green-300"
                    }
                  >
                    {compareNote.msg}
                  </Badge>
                </div>
              )}
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </CardContent>
        </Card>

        {stats && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Role" value={stats.searched_role} />
                <Stat label="Mean" value={`$${stats.avg_rate}/hr`} />
                <Stat label="Median" value={`$${stats.median_rate}/hr`} />
                <Stat label="Std Dev" value={`N/A`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Percentiles & Band</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Stat label="Min" value={`$${stats.min_rate}/hr`} />
                <Stat label="P10" value={`$${stats.p10_rate}/hr`} />
                <Stat label="P90" value={`$${stats.p90_rate}/hr`} />
                <Stat label="Max" value={`$${stats.max_rate}/hr`} />
              </CardContent>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-0">
                <Band
                  label="Suggested Low"
                  value={`$${stats.suggested_range?.floor}/hr`}
                />
                <Band
                  label="Suggested Mid"
                  value={`$${stats.suggested_range?.point}/hr`}
                />
                <Band
                  label="Suggested High"
                  value={`$${stats.suggested_range?.ceiling}/hr`}
                />
              </CardContent>
            </Card>

            {stats.recommendation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{stats.recommendation}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-3 rounded-xl border">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function Band({ label, value }) {
  return (
    <div className="p-3 rounded-xl border">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
