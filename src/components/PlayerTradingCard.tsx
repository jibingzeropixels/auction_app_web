import React from "react";
import { Box, Typography, Paper, Chip, Divider } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";

import { ApiPlayer, LegacyPlayer } from "@/types/player";

interface PlayerTradingCardProps {
  player: ApiPlayer | LegacyPlayer;
}
type SkillType = string | { [key: string]: string | number };
const PlayerTradingCard: React.FC<PlayerTradingCardProps> = ({ player }) => {
  const isLegacyPlayer = "name" in player;

  const fullName = isLegacyPlayer
    ? player.name
    : `${player.firstName} ${player.lastName}`;

  const skills = isLegacyPlayer ? [player.category] : player.skills || [];

  const status = isLegacyPlayer
    ? player.status
    : player.soldStatus || "available";

  const basePrice = isLegacyPlayer ? player.basePrice : player.basePrice || 100;

  const isIcon = !isLegacyPlayer ? player.isIcon : false;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const getCardColor = () => {
    if (!skills || skills.length === 0) {
      return "#2196f3";
    }

    const colorMap: Record<string, string> = {
      football: "#4caf50",
      cricket: "#3f51b5",
      badminton: "#ff9800",
      "table-tennis": "#f44336",
      swimming: "#00bcd4",
      dancing: "#e91e63",
      singing: "#9c27b0",
      foosball: "#ff5722",
      carroms: "#607d8b",
      chess: "#795548",
    };

    const firstSkill = skills[0];
    let skillName: string;

    if (typeof firstSkill === "string") {
      skillName = firstSkill.toLowerCase();
    } else if (firstSkill && typeof firstSkill === "object") {
      const keys = Object.keys(firstSkill);
      if (keys.length > 0) {
        skillName = keys[0].toLowerCase();
      } else {
        return "#2196f3";
      }
    } else {
      return "#2196f3";
    }

    return colorMap[skillName] || "#2196f3";
  };

  const getGradient = (color: string) => {
    return `linear-gradient(135deg, ${color} 0%, ${adjustColor(
      color,
      -40
    )} 100%)`;
  };

  const adjustColor = (color: string, amount: number) => {
    return (
      "#" +
      color.replace(/^#/, "").replace(/../g, (color) => {
        const colorValue = Math.min(
          255,
          Math.max(0, parseInt(color, 16) + amount)
        ).toString(16);
        return colorValue.padStart(2, "0");
      })
    );
  };

  const getSkillLabel = (skill: SkillType): string => {
    if (typeof skill === "string") {
      return skill;
    }

    if (skill && typeof skill === "object") {
      const keys = Object.keys(skill);
      if (keys.length > 0) {
        const key = keys[0];
        const value = skill[key];
        return value ? `${key} (${value})` : key;
      }
    }

    return "Unknown";
  };

  const getSkillIcon = (skill: SkillType) => {
    const iconMap: Record<string, string> = {
      football: "⚽",
      cricket: "🏏",
      badminton: "🏸",
      "table-tennis": "🏓",
      swimming: "🏊",
      dancing: "💃",
      singing: "🎤",
      foosball: "⚽",
      carroms: "🎮",
      chess: "♟️",
    };

    let skillName: string;

    if (typeof skill === "string") {
      skillName = skill.toLowerCase();
    } else if (skill && typeof skill === "object") {
      const keys = Object.keys(skill);
      if (keys.length > 0) {
        skillName = keys[0].toLowerCase();
      } else {
        return "🌟";
      }
    } else {
      return "🌟";
    }

    return iconMap[skillName] || "🌟";
  };

  const cardColor = getCardColor();
  const cardGradient = getGradient(cardColor);
  const statusLabelMap: Record<string, string> = {
    pending: "Upcoming",
    unsold: "Unsold",
    sold: "Sold",
  };

  const statusColorMap: Record<
    string,
    "success" | "error" | "warning" | "info"
  > = {
    pending: "info",
    unsold: "error",
    sold: "success",
  };
  return (
    <Paper
      elevation={8}
      sx={{
        width: "100%",
        maxWidth: 320,
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        transition: "transform 0.3s ease",
        margin: "0 auto",
        "&:hover": {
          transform: "translateY(-5px)",
        },
        boxShadow: `0 16px 24px rgba(0,0,0,0.15), 0 6px 8px rgba(0,0,0,0.12), 0 0 0 2px ${cardColor}33`,
      }}
    >
      <Box
        sx={{
          p: 2,
          background: cardGradient,
          color: "white",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
            position: "relative",
            zIndex: 2,
          }}
        >
          {fullName}
        </Typography>

        {isIcon && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 0.5,
            }}
          >
            <StarIcon sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography
              variant="subtitle2"
              sx={{
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                position: "relative",
                zIndex: 2,
              }}
            >
              Icon Player
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            position: "absolute",
            top: -15,
            right: -15,
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
      </Box>

      <Box
        sx={{
          width: "100%",
          height: 150,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.03), rgba(0,0,0,0))",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {"photoUrl" in player && player.photoUrl ? (
          <Box
            component="img"
            src={player.photoUrl}
            alt={fullName}
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: `4px solid ${cardColor}`,
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              background: "white",
            }}
          />
        ) : (
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: `4px solid ${cardColor}`,
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #f5f5f5, #e0e0e0)",
              color: cardColor,
              fontSize: "2.5rem",
              fontWeight: "bold",
            }}
          >
            {getInitials(fullName)}
          </Box>
        )}

        <PersonIcon
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            opacity: 0.1,
            fontSize: 30,
          }}
        />
        <PersonIcon
          sx={{
            position: "absolute",
            bottom: 10,
            left: 10,
            opacity: 0.1,
            fontSize: 30,
          }}
        />
      </Box>

      <Box sx={{ textAlign: "center", p: 1.5, bgcolor: cardColor + "08" }}>
        <Chip
          label={`Base Price: ₹${basePrice.toLocaleString()}`}
          sx={{
            fontWeight: "bold",
            bgcolor: "white",
            border: `2px solid ${cardColor}`,
            color: cardColor,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            fontSize: "0.9rem",
          }}
        />
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          sx={{ mb: 1, color: "text.primary" }}
        >
          Skills
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {skills && skills.length > 0 ? (
            skills.map((skill, index) => (
              <Chip
                key={index}
                label={getSkillLabel(skill)}
                size="small"
                icon={
                  <Box component="span" sx={{ ml: 1 }}>
                    {getSkillIcon(skill)}
                  </Box>
                }
                sx={{
                  backgroundColor: `${cardColor}22`,
                  color: "text.primary",
                  fontWeight: "medium",
                  border: `1px solid ${cardColor}44`,
                }}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No skills listed
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Chip
            label={statusLabelMap[status] ?? status.toUpperCase()}
            color={statusColorMap[status] ?? "warning"}
            sx={{
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default PlayerTradingCard;
