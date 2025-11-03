import { useParams } from "react-router-dom";
import CinemaImage from "../assets/cine.jpg";
import TitleHeader from "../components/TitleHeader";
import CinemaOptions from "../components/CinemaOptions";
export default function CinemaDescription() {
  const cinemaId = useParams().cinemaId;

  console.log("Cinema ID:", cinemaId);

  return (
    <div className="min-h-screen bg-gray-900">
      <TitleHeader title="Cine" />
      <CinemaOptions />
    </div>
  );
}
