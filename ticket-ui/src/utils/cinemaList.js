import cinemaImage from "../assets/cine.jpg";

export const cinemaList = [
  {
    Id: 1,
    screenings: [
      {
        id: 1,
        image: cinemaImage,
        title: "Movie Title 1",
        date: "20 Aug 2023",
        time: "18:00 - 20:00",
        location: "CDMX, México",
        price: 120,
        category: "cinema",
      },
      {
        id: 2,
        image: cinemaImage,
        title: "Movie Title 2",
        date: "21 Aug 2023",
        time: "20:30 - 22:30",
        location: "CDMX, México",
        price: 150,
        category: "cinema",
      },
    ],
  },
];
