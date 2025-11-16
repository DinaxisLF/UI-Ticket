import React from "react";
import OptionCard from "./OptionCard";
import CineRoomImage from "../assets/cine-room.jpg";

export default function CinemaOptions(cinemaId) {
  const cinemaIdValue = cinemaId?.cinemaId || 1;
  console.log("CinemaOptions received cinemaId:", cinemaIdValue);
  const cinemaOptions = [
    {
      id: cinemaIdValue,
      name: "Tradicional",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: cinemaIdValue,
      name: "Plus",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: cinemaIdValue,
      name: "VIP",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: cinemaIdValue,
      name: "MACRO XE",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: cinemaIdValue,
      name: "Junior",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: cinemaIdValue,
      name: "4DX",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: cinemaIdValue,
      name: "IMAX",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: cinemaIdValue,
      name: "VR",
      imageUrl: CineRoomImage,
      link: "cinemaEvents",
      type: "Cinema",
    },
    {
      id: cinemaIdValue,
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
