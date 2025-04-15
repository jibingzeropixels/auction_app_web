export interface ApiPlayer {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: number | null;
  skills?: string[];
  eventId: string;
  isIcon: boolean;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  updatedAt: string | null;
  soldStatus?: "sold" | "unsold" | "pending" | "available";
  teamId?: string | null;
  __v?: number;
  basePrice?: number;
  photoUrl?: string;
  soldAmount?: number;
}

export interface LegacyPlayer {
  _id: string;
  name: string;
  basePrice: number;
  category: string;
  status: "available" | "sold" | "unsold";
  teamId?: string;
  soldAmount?: number;
  battingSkill?: number;
  bowlingSkill?: number;
  fieldingSkill?: number;
  photoUrl?: string;
}

export const convertToLegacyPlayer = (apiPlayer: ApiPlayer): LegacyPlayer => {
  return {
    _id: apiPlayer._id,
    name: `${apiPlayer.firstName} ${apiPlayer.lastName}`,
    basePrice: apiPlayer.basePrice || 50000,
    category: apiPlayer.skills?.[0] || "Unknown",
    status:
      (apiPlayer.soldStatus as "available" | "sold" | "unsold") || "available",
    teamId: apiPlayer.teamId || undefined,
    battingSkill: Math.floor(Math.random() * 10) + 1,
    bowlingSkill: Math.floor(Math.random() * 10) + 1,
    fieldingSkill: Math.floor(Math.random() * 10) + 1,
  };
};

export const convertToApiPlayer = (legacyPlayer: LegacyPlayer): ApiPlayer => {
  const nameParts = legacyPlayer.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    _id: legacyPlayer._id,
    firstName,
    lastName,
    skills: legacyPlayer.category ? [legacyPlayer.category] : [],
    eventId: "",
    isIcon: false,
    createdAt: new Date().toISOString(),
    createdBy: "",
    isActive: true,
    updatedAt: null,
    soldStatus: legacyPlayer.status,
    teamId: legacyPlayer.teamId,
    basePrice: legacyPlayer.basePrice,
    photoUrl: legacyPlayer.photoUrl,
  };
};
