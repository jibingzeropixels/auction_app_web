"use client";
import EventCard from "@/components/EventCard";
import { useParams } from "next/navigation";

const Events = () => {
  const { seasons } = useParams(); // Get dynamic season from URL

  return (
    <div className="flex flex-wrap gap-4">
      <EventCard
        img="https://source.unsplash.com/400x300/?event"
        eventName="Tech Conference 2025"
        eventDate="March 15, 2025"
        details="Join us for an exciting conference on the future of technology."
        season={seasons as string} // Pass season dynamically
      />
      <EventCard
        img="https://source.unsplash.com/400x300/?music"
        eventName="Music Festival"
        eventDate="April 20, 2025"
        details="A weekend of amazing live performances and great vibes."
        season={seasons as string}
      />
    </div>
  );
};

export default Events;
