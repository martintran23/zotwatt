import { handler } from "./analyze";

const fakeWeatherData = {
  hours: [
    { time: "10:00 AM", score: 450, cloudcover: 20 },
    { time: "11:00 AM", score: 680, cloudcover: 10 },
    { time: "12:00 PM", score: 720, cloudcover: 5 },
    { time: "1:00 PM", score: 690, cloudcover: 8 },
    { time: "2:00 PM", score: 500, cloudcover: 15 },
  ],
  location: "Irvine, CA",
  appliances: ["EV charger", "dishwasher", "washing machine"],
};

handler(fakeWeatherData as any, {} as any, {} as any);
