import React from "react";
import { useParams } from "react-router-dom";
import TitleHeader from "../components/TitleHeader";
import { cinemaList } from "../utils/cinemaList";
import EventCard from "../components/EventCard";

export default function CinemaScreenings() {
  const id = useParams().id;
  const shows = id == 1 ? cinemaList[0].screenings : [];
  const type = useParams().type;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <TitleHeader title={type} />

        <div className="grid grid-cols-2  gap-6 max-w-7xl mx-auto">
          {shows.map((event, index) => (
            <div
              key={event.id ?? index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
