import { DriverStanding, ConstructorStanding, Race } from "@/types/f1";

export const MOCK_DRIVER_STANDINGS: DriverStanding[] = [
  { position: "1", points: "437", wins: "11", Driver: { driverId: "verstappen", number: "1", code: "VER", givenName: "Max", familyName: "Verstappen", fullName: "Max Verstappen", nationality: "Dutch", dateOfBirth: "1997-09-30" }, Constructors: [{ constructorId: "red_bull", name: "Red Bull Racing", nationality: "Austrian" }] },
  { position: "2", points: "345", wins: "3", Driver: { driverId: "norris", number: "4", code: "NOR", givenName: "Lando", familyName: "Norris", fullName: "Lando Norris", nationality: "British", dateOfBirth: "1999-11-13" }, Constructors: [{ constructorId: "mclaren", name: "McLaren", nationality: "British" }] },
  { position: "3", points: "307", wins: "3", Driver: { driverId: "leclerc", number: "16", code: "LEC", givenName: "Charles", familyName: "Leclerc", fullName: "Charles Leclerc", nationality: "Monegasque", dateOfBirth: "1997-10-16" }, Constructors: [{ constructorId: "ferrari", name: "Ferrari", nationality: "Italian" }] },
  { position: "4", points: "262", wins: "2", Driver: { driverId: "piastri", number: "81", code: "PIA", givenName: "Oscar", familyName: "Piastri", fullName: "Oscar Piastri", nationality: "Australian", dateOfBirth: "2001-04-06" }, Constructors: [{ constructorId: "mclaren", name: "McLaren", nationality: "British" }] },
  { position: "5", points: "244", wins: "2", Driver: { driverId: "sainz", number: "55", code: "SAI", givenName: "Carlos", familyName: "Sainz", fullName: "Carlos Sainz", nationality: "Spanish", dateOfBirth: "1994-09-01" }, Constructors: [{ constructorId: "ferrari", name: "Ferrari", nationality: "Italian" }] },
  { position: "6", points: "192", wins: "2", Driver: { driverId: "hamilton", number: "44", code: "HAM", givenName: "Lewis", familyName: "Hamilton", fullName: "Lewis Hamilton", nationality: "British", dateOfBirth: "1985-01-07" }, Constructors: [{ constructorId: "mercedes", name: "Mercedes", nationality: "German" }] },
  { position: "7", points: "192", wins: "1", Driver: { driverId: "russell", number: "63", code: "RUS", givenName: "George", familyName: "Russell", fullName: "George Russell", nationality: "British", dateOfBirth: "1998-02-15" }, Constructors: [{ constructorId: "mercedes", name: "Mercedes", nationality: "German" }] },
  { position: "8", points: "152", wins: "0", Driver: { driverId: "perez", number: "11", code: "PER", givenName: "Sergio", familyName: "Perez", fullName: "Sergio Perez", nationality: "Mexican", dateOfBirth: "1990-01-26" }, Constructors: [{ constructorId: "red_bull", name: "Red Bull Racing", nationality: "Austrian" }] },
  { position: "9", points: "62", wins: "0", Driver: { driverId: "alonso", number: "14", code: "ALO", givenName: "Fernando", familyName: "Alonso", fullName: "Fernando Alonso", nationality: "Spanish", dateOfBirth: "1981-07-29" }, Constructors: [{ constructorId: "aston_martin", name: "Aston Aramco", nationality: "British" }] },
  { position: "10", points: "31", wins: "0", Driver: { driverId: "hulkenberg", number: "27", code: "HUL", givenName: "Nico", familyName: "Hulkenberg", fullName: "Nico Hulkenberg", nationality: "German", dateOfBirth: "1987-08-19" }, Constructors: [{ constructorId: "haas", name: "Haas F1 Team", nationality: "American" }] },
];

export const MOCK_CONSTRUCTOR_STANDINGS: ConstructorStanding[] = [
  { position: "1", points: "608", wins: "5", Constructor: { constructorId: "mclaren", name: "McLaren", nationality: "British" } },
  { position: "2", points: "593", wins: "11", Constructor: { constructorId: "red_bull", name: "Red Bull Racing", nationality: "Austrian" } },
  { position: "3", points: "557", wins: "5", Constructor: { constructorId: "ferrari", name: "Ferrari", nationality: "Italian" } },
  { position: "4", points: "384", wins: "3", Constructor: { constructorId: "mercedes", name: "Mercedes", nationality: "German" } },
  { position: "5", points: "86", wins: "0", Constructor: { constructorId: "aston_martin", name: "Aston Aramco", nationality: "British" } },
];

export const MOCK_RACE_SCHEDULE: Race[] = [
  { season: "2024", round: "1", raceName: "Bahrain Grand Prix", date: "2024-03-02", time: "15:00:00Z", Circuit: { circuitId: "bahrain", circuitName: "Bahrain International Circuit", Location: { lat: "26.0325", long: "50.5106", locality: "Sakhir", country: "Bahrain" } } },
  { season: "2024", round: "2", raceName: "Saudi Arabian Grand Prix", date: "2024-03-09", time: "17:00:00Z", Circuit: { circuitId: "jeddah", circuitName: "Jeddah Corniche Circuit", Location: { lat: "21.6319", long: "39.1044", locality: "Jeddah", country: "Saudi Arabia" } } },
  { season: "2024", round: "24", raceName: "Abu Dhabi Grand Prix", date: "2024-12-08", time: "13:00:00Z", Circuit: { circuitId: "yas_marina", circuitName: "Yas Marina Circuit", Location: { lat: "24.4672", long: "54.6031", locality: "Abu Dhabi", country: "UAE" } } },
];
