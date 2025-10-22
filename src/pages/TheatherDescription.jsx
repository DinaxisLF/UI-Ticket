import { useParams } from "react-router-dom";
import TheaterImage from "../assets/teatro.jpg";
import EventCard from "../components/EventCard";

import TitleHeader from "../components/TitleHeader";

export default function TheatherDescription() {
  const theaterId = useParams().theaterId;

  const metropolitanEvents = [
    {
      id: 1,
      image: TheaterImage,
      title: "Don Quijote",
      date: "17 Sep 2025",
      time: "20:00 - 23:00",
      location: "CDMX, México",
      price: 1500,
      category: "theater",
    },
    {
      id: 2,
      image: TheaterImage,
      title: "La Vida es Sueño",
      date: "24 Sep 2023",
      time: "19:30 - 22:30",
      location: "CDMX, México",
      price: 1500,
      category: "theater",
    },
    {
      id: 3,
      image: TheaterImage,
      title: "Bodas de Sangre",
      date: "10 Oct 2023",
      time: "18:00 - 21:00",
      location: "CDMX, México",
      price: 1500,
      category: "theater",
    },
    {
      id: 4,
      image: TheaterImage,
      title: "El Burlador de Sevilla",
      date: "28 Oct 2023",
      time: "18:00 - 21:00",
      location: "CDMX, México",
      price: 1500,
      category: "theater",
    },
  ];

  const scalaEvents = [
    {
      id: 1,
      image: TheaterImage,
      title: "La Traviata",
      date: "17 Sep 2025",
      time: "20:00 - 23:00",
      location: "Milan, Italia",
      price: 1500,
      category: "theater",
    },
    {
      id: 2,
      image: TheaterImage,
      title: "Madama Butterfly",
      date: "24 Sep 2023",
      time: "19:30 - 22:30",
      location: "Milan, Italia",
      price: 1500,
      category: "theater",
    },
    {
      id: 3,
      image: TheaterImage,
      title: "Rigoletto",
      date: "10 Oct 2023",
      time: "18:00 - 21:00",
      location: "Milan, Italia",
      price: 1500,
      category: "theater",
    },
    {
      id: 4,
      image: TheaterImage,
      title: "Il Barbiere di Siviglia",
      date: "28 Oct 2023",
      time: "18:00 - 21:00",
      location: "Milan, Italia",
      price: 1500,
      category: "theater",
    },
  ];

  const colonEvents = [
    {
      id: 1,
      image: TheaterImage,
      title: "Hamlet",
      date: "17 Sep 2025",
      time: "20:00 - 23:00",
      location: "Buenos Aires, Argentina",
      price: 1500,
      category: "theater",
    },
    {
      id: 2,
      image: TheaterImage,
      title: "Romeo y Julieta",
      date: "24 Sep 2023",
      time: "19:30 - 22:30",
      location: "Buenos Aires, Argentina",
      price: 1500,
      category: "theater",
    },
    {
      id: 3,
      image: TheaterImage,
      title: "El Rey Lear",
      date: "10 Oct 2023",
      time: "18:00 - 21:00",
      location: "Buenos Aires, Argentina",
      price: 1500,
      category: "theater",
    },
    {
      id: 4,
      image: TheaterImage,
      title: "La Casa de Bernarda Alba",
      date: "28 Oct 2023",
      time: "18:00 - 21:00",
      location: "Buenos Aires, Argentina",
      price: 1500,
      category: "theater",
    },
  ];

  const id = parseInt(theaterId, 10);

  // pick the array based on the route param (use parseInt because useParams returns a string)
  const shows =
    id === 1 ? colonEvents : id === 2 ? scalaEvents : metropolitanEvents;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <TitleHeader title="Teatro Colon" />

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
