// src/pages/Desktop.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  BarChart3,
  Calendar,
  Users,
  FolderOpen,
  Mail,
  MessageSquare,
  Settings,
  HelpCircle,
} from "lucide-react";
import "../styles/Desktop.css";

export default function Desktop() {
  const [hovered, setHovered] = useState(null);

  const navigate = useNavigate(); // <-- ADD THIS

  const dockItems = [
    { icon: <FolderOpen size={28} />, label: "Files" },
    { icon: <Mail size={28} />, label: "Mail" },
    { icon: <Calendar size={28} />, label: "Calendar" },
    { icon: <MessageSquare size={28} />, label: "Chat" },

    {
      icon: <BarChart3 size={28} />,
      label: "Recruiter Dashboard",
      active: true,
      route: "/dashboard", // <-- ADD THIS
    },

    { icon: <Users size={28} />, label: "Teams" },
    { icon: <Settings size={28} />, label: "Settings" },
  ];

  const desktopIcons = [
    { icon: <FileText size={28} />, label: "Files" },
    { icon: <BarChart3 size={28} />, label: "Reports" },
    { icon: <Calendar size={28} />, label: "Calendar" },
  ];

  const scale = (index) => {
    if (hovered === null) return 1;

    const diff = Math.abs(index - hovered);

    if (diff === 0) return 1.55;
    if (diff === 1) return 1.28;
    if (diff === 2) return 1.12;
    return 1;
  };

  return (
    <div className="desktop">

      {/* Top Bar */}
      <div className="topbar">
        <div className="brand">RecruiterOS</div>

        <div className="status">
          <span>10:56 PM</span>
          <span>WiFi</span>
          <span>100%</span>
        </div>
      </div>

      {/* Desktop Icons */}
      <div className="desktop-icons">
        {desktopIcons.map((item, i) => (
          <div className="desktop-icon" key={i}>
            <div className="desktop-box">{item.icon}</div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Dock */}
      <div className="dock">
        {dockItems.map((item, index) => (
          <div
            key={index}
            className={`dock-icon ${item.active ? "active" : ""}`}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}

            onClick={() => {
              if (item.route) {
                navigate(item.route);
              }
            }}

            style={{
              transform: `scale(${scale(index)}) translateY(${
                hovered === index
                  ? -14
                  : hovered !== null && Math.abs(index - hovered) === 1
                  ? -7
                  : 0
              }px)`,
            }}
          >
            {item.icon}
            <div className="tooltip">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Help Button */}
      <div className="help-btn">
        <HelpCircle size={22} />
      </div>
    </div>
  );
}