import React, { useEffect, useState } from "react";
import { FolderKanban, Lightbulb, Radio, Trophy, Github, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import api from "../api/axios.js";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { format } from "date-fns";

const PIE_COLORS = ["#4FD1E8", "#F5A65B", "#5FD98A", "#9B8CFF", "#F26D6D"];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [github, setGithub] = useState(null);
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/summary").then(({ data }) => setSummary(data)).finally(() => setLoading(false));
    api.get("/integrations/github/activity").then(({ data }) => setGithub(data)).catch(() => setGithub(null));
    api.get("/integrations/google/calendar/events").then(({ data }) => setEvents(data)).catch(() => setEvents(null));
  }, []);

  if (loading) {
    return <div className="p-8 text-base-50/50 font-mono text-sm">syncing live status...</div>;
  }

  const c = summary?.counts || {};

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="label-eyebrow">live monitoring</p>
          <h1 className="font-display text-2xl font-semibold mt-1">Mission Control</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-base-50/40">
          <span className="status-dot bg-signal-green animate-pulse" />
          synced {format(new Date(), "PPpp")}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={c.totalProjects ?? 0} icon={FolderKanban} accent="cyan" />
        <StatCard label="Total Ideas" value={c.totalIdeas ?? 0} icon={Lightbulb} accent="violet" />
        <StatCard label="Live / Running" value={c.runningProjectsCount ?? 0} icon={Radio} accent="amber" />
        <StatCard label="Completed" value={c.completedProjects ?? 0} icon={Trophy} accent="green" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Running projects - live processing panel */}
        <div className="card p-5 lg:col-span-2">
          <p className="label-eyebrow mb-3">currently running</p>
          {summary.runningProjects?.length ? (
            <div className="space-y-3">
              {summary.runningProjects.map((p) => (
                <div key={p._id} className="flex items-center justify-between border-b border-base-600/40 pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-base-50/40 font-mono mt-0.5">
                      {p.deadline ? `due ${format(new Date(p.deadline), "MMM d, yyyy")}` : "no deadline set"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-1.5 bg-base-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-signal-cyan"
                        style={{ width: `${p.milestoneProgress || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-base-50/50 w-9 text-right">{p.milestoneProgress || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-base-50/40">No projects currently running.</p>
          )}
        </div>

        {/* Milestone progress ring */}
        <div className="card p-5 flex flex-col items-center justify-center">
          <p className="label-eyebrow self-start mb-2">milestone completion</p>
          <div className="w-36 h-36">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: "done", value: c.milestoneProgress || 0 },
                    { name: "left", value: 100 - (c.milestoneProgress || 0) },
                  ]}
                  dataKey="value" innerRadius={45} outerRadius={62} startAngle={90} endAngle={-270}
                >
                  <Cell fill="#5FD98A" />
                  <Cell fill="#26334D" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="font-display text-2xl font-semibold -mt-24">{c.milestoneProgress || 0}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* GitHub live feed */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Github size={16} className="text-base-50/60" />
            <p className="label-eyebrow">github activity</p>
          </div>
          {github ? (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {github.recentActivity?.slice(0, 6).map((e) => (
                <div key={e.id} className="text-sm flex justify-between">
                  <span className="text-base-50/70">{e.type.replace("Event", "")} · {e.repo}</span>
                  <span className="text-base-50/30 font-mono text-xs">{format(new Date(e.createdAt), "MMM d")}</span>
                </div>
              ))}
              {!github.recentActivity?.length && <p className="text-sm text-base-50/40">No recent activity.</p>}
            </div>
          ) : (
            <p className="text-sm text-base-50/40">Connect GitHub in Settings to see live commits here.</p>
          )}
        </div>

        {/* Calendar live feed */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-base-50/60" />
            <p className="label-eyebrow">upcoming on calendar</p>
          </div>
          {events ? (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {events.slice(0, 6).map((ev) => (
                <div key={ev.id} className="text-sm flex justify-between">
                  <span className="text-base-50/70 truncate">{ev.title}</span>
                  <span className="text-base-50/30 font-mono text-xs shrink-0 ml-2">
                    {format(new Date(ev.start), "MMM d, HH:mm")}
                  </span>
                </div>
              ))}
              {!events.length && <p className="text-sm text-base-50/40">No upcoming events.</p>}
            </div>
          ) : (
            <p className="text-sm text-base-50/40">Connect Google Calendar in Settings to see events here.</p>
          )}
        </div>
      </div>

      {/* Upcoming deadlines */}
      <div className="card p-5">
        <p className="label-eyebrow mb-3">upcoming deadlines</p>
        <div className="space-y-2">
          {summary.upcomingDeadlines?.length ? (
            summary.upcomingDeadlines.map((p) => (
              <div key={p._id} className="flex items-center justify-between text-sm">
                <span>{p.name}</span>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.status} />
                  <span className="font-mono text-xs text-base-50/50">{format(new Date(p.deadline), "MMM d, yyyy")}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-base-50/40">No upcoming deadlines.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
