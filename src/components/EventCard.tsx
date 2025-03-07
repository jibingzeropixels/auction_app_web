"use client";

import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

interface EventCardProps {
  img: string;
  eventName: string;
  eventDate: string;
  details: string;
  season: string;
}

const EventCard: React.FC<EventCardProps> = ({
  img,
  eventName,
  eventDate,
  details,
  season,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(
      `/season/${encodeURIComponent(season)}/events/${encodeURIComponent(
        eventName
      )}`
    );
  };

  return (
    <Card
      className="w-full max-w-sm shadow-lg hover:shadow-xl transition-shadow"
      onClick={handleClick}
    >
      <CardActionArea>
        <CardMedia component="img" height="200" image={img} alt={eventName} />
        <CardContent>
          <Typography variant="h6" component="div">
            {eventName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {eventDate}
          </Typography>
          <Typography variant="body2" className="mt-2">
            {details}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default EventCard;
