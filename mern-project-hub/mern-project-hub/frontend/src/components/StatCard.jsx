import React from "react";

const StatCard = ({ label, value, icon: Icon, accent = "cyan", suffix = "" }) => {
  const colorMap = {
    cyan: "text-signal-cyan bg-signal-cyan/10",
    amber: "text-signal-amber bg-signal-amber/10",
    green: "text-signal-green bg-signal-green/10",
    violet: "text-signal-violet bg-signal-violet/10",
  };
  return (
    <div className="card p-5 flex items-center justify-between">
      <div>
        <p className="label-eyebrow">{label}</p>
        <p className="font-display text-3xl font-semibold mt-1">
          {value}
          <span className="text-base-50/40 text-lg">{suffix}</span>
        </p>
      </div>
      {Icon && (
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colorMap[accent]}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
