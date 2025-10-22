import React from "react";
import OptionCard from "./OptionCard";
import CineRoomImage from "../assets/cine-room.jpg";

export default function CinemaOptions() {
  const cinemaOptions = [
    {
      id: 1,
      name: "Tradicional",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: 2,
      name: "Plus",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: 3,
      name: "VIP",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: 4,
      name: "MACRO XE",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: 5,
      name: "Junior",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: 6,
      name: "4DX",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: 7,
      name: "IMAX",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: 8,
      name: "VR",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: 9,
      name: "Screen X",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-3  gap-6 max-w-7xl mx-auto">
        {cinemaOptions.map((event) => (
          <OptionCard
            key={event.id}
            id={event.id}
            imageUrl={event.imageUrl}
            eventName={event.name}
            link={event.link}
            type={event.type}
          />
        ))}
      </div>
    </div>
  );
}
