import express from "express";
const app = express();
const router = express.Router();
// const port = 3000;
import { faker } from '@faker-js/faker'; // Import Faker.js

// Sample data (replace this with your database or data source)
let cars = [];
let deals = [];
let carsId =[];

// Function to generate a random car object using Faker.js
const  generateRandomCar = () => {
  let newId = faker.string.uuid();
  carsId.push(newId);
  return {
    id: newId,
    name: faker.vehicle.model(),
    dealership: faker.helpers.arrayElement(['Dealership A', 'Dealership B', 'Dealership C']),
    owner: null,
  };
}

// Function to generate a random deal object using Faker.js
const generateRandomDeal = (carId) => {
  return {
    id: faker.string.uuid(),
    carId,
    dealership: faker.helpers.arrayElement(['Dealership A', 'Dealership B', 'Dealership C']),
    price: faker.number.int({ min: 100000, max: 500000 }),
  };
}


//function to generate some sample cars and deals using Faker.js
function generateSampleData() {
  for (let i = 0; i < 10; i++) {
    const car = generateRandomCar();
    cars.push(car);

    const deal = generateRandomDeal(car.id);
    deals.push(deal);
  }
}
// Generate some sample data at the start of the server
generateSampleData();



// Endpoint to view all cars
export const viewAllCars = router.get('/api/cars', (req, res) => {
  res.json(cars);
});

// Endpoint to view all cars in a dealership
export const carsInDealership =  router.get('/api/cars/dealerships/:dealership', (req, res) => {
  const dealershipName = req.params.dealership;
  const carsInDealership = cars.filter((car) => car.dealership === dealershipName);
  res.send(carsInDealership);
});

// Endpoint to view all deals from a certain dealership
export const dealsCertainDealership = router.get('/dealerships/:dealership/deals', (req, res) => {
  const dealershipName = req.params.dealership;
  const dealsFromDealership = deals.filter((deal) => deal.dealership === dealershipName);
  res.json(dealsFromDealership);
});

// Endpoint to allow the user to buy a car after a deal is made
export const buyCar = router.post('/buy/:dealId', (req, res) => {
  const dealId = req.params.dealId;
  const deal = deals.find((deal) => deal.id === dealId);
  console.log(deals);
  
  if (!deal) {
    return res.status(404).json({ error: 'Deal not found' });
  }

  const car = cars.find((car) => car.id === deal.carId);
  
  if (!car) {
    return res.status(404).json({ error: 'Car not found' });
  }

  car.owner = faker.person.fullName(); // Assign a random name as the owner using Faker.js
  // firstName() +" "+ faker.person.lastName()
  res.json({ message: 'Car purchased successfully', car });
});


// For User

// Function to generate a random car object using faker
const generateCar = () => ({
  make: faker.vehicle.manufacturer(),
  model: faker.vehicle.model(),
  price: faker.number.int({ min: 15000, max: 50000 }),
});

// Function to generate a random deal object using faker
const generateDeal = () => ({
  car: generateCar(),
  discount: faker.number.int({ min: 500, max: 5000 }),
  customerName: faker.person.fullName(),
});

const soldVehicles = Array.from({ length: 5 }, () => generateDeal());


// Endpoint to view all cars
 export const dealerAllCars = router.get('/cars', (req, res) => {
  const cars = Array.from({ length: 10 }, () => generateCar());
  res.json(cars);
});

// Endpoint to view all cars sold by dealership
export const dealerAllSoldCars = router.get('/sold-cars', (req, res) => {
  res.json(soldVehicles);
});

// Endpoint to add cars to dealership
export const dealerAddCars = router.post('/cars', (req, res) => {
  const newCar = generateCar();
  cars.push(newCar);
  res.status(201).json(cars);
});

// Endpoint to view deals provided by dealership
export const dealerProvidedCars = router.get('/deals', (req, res) => {
  const deals = Array.from({ length: 10 }, () => generateDeal());
  res.json(deals);
});

// Endpoint to add deals to dealership
export const dealerAddDeals = router.post('/deals', (req, res) => {
  const newDeal = generateDeal();
  deals.push(newDeal);
  res.status(201).json(deals);
});

// Endpoint to view all vehicles dealership has sold
export const dealerAllSoldVehicles = router.get('/sold-vehicles', (req, res) => {
  res.json(soldVehicles);
});

// Endpoint to add new vehicle to the list of sold vehicles after a deal is made
export const dealerAddNewToSold = router.post('/sold-vehicles', (req, res) => {
  const newSoldVehicle = generateCar();
  soldVehicles.push(newSoldVehicle);
  res.status(201).json(soldVehicles);
});
