import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";
import { DogObject } from "./types";

const app = express();
app.use(express.json());
// All code should go below this line

// Get Hello World
app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200); // the 'status' is unnecessary but wanted to show you how to define a status
});

// Get all dogs
app.get("/dogs", async (_req, res) => {
  try {
    const dogs = await prisma.dog.findMany();
    res.status(200).json(dogs);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific dog by ID
app.get("/dogs/:id", async (req, res) => {
  const dogId = parseInt(req.params.id, 10);

  if (isNaN(dogId)) {
    res.status(400).json({ message: "id should be a number" }); // Send the correct error message
    return;
  }

  try {
    const dog = await prisma.dog.findUnique({
      where: {
        id: dogId,
      },
    });

    if (!dog) {
      res.status(204).end(); // Respond with a 204 status code and no data
    } else {
      res.status(200).json(dog);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});



//create new dog
app.post("/dogs", async (req, res) => {
  const dog: DogObject = req.body;
  const errors = [];

  // Validate age
  if (typeof dog.age !== 'number') {
    errors.push('age should be a number');
  }

  // Validate name
  if (typeof dog.name !== 'string') {
    errors.push('name should be a string');
  }

  // Validate description
  if (typeof dog.description !== 'string') {
    errors.push('description should be a string');
  }

  // Check for invalid keys
  const allowedKeys = ['name', 'age', 'description', 'breed'];
  const keys = Object.keys(dog);
  for (const key of keys) {
    if (!allowedKeys.includes(key)) {
      errors.push(`'${key}' is not a valid key`);
    }
  }

  if (errors.length > 0) {
    // If there are errors, return a 400 Bad Request response with the error messages
    res.status(400).json({ errors });
  } else {
    // If validation passes, attempt to create the dog
    try {
      const dogPost = await prisma.dog.create({ data: dog });
      res.status(201).json(dogPost);
    } catch (error) {
      // Handle any internal server errors
      res.status(500).json({ error: "Internal server error" });
    }
  }
});



app.patch("/dogs/:id", async (req, res) => {
  const dogId = Number(req.params.id);
  const validKeys = ["name", "description", "breed", "age"];

  // Check if any keys in the request body are invalid
  const invalidKeys = Object.keys(req.body).filter(key => !validKeys.includes(key));

  if (invalidKeys.length > 0) {
    // Respond with a 400 Bad Request status and an error message
    return res.status(400).json({ errors: invalidKeys.map(key => `'${key}' is not a valid key`) });
  }

  try {
    const dogUpdate = await prisma.dog.update({
      where: { id: dogId },
      data: req.body
    });
    res.status(201).json(dogUpdate);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});



app.delete("/dogs/:id", async (req, res) => {
  const dogId = parseInt(req.params.id); // Parse the string to a number

  // Check if dogId is a valid number
  if (isNaN(dogId)) {
    return res.status(400).json({ message: "id should be a number" });
  }

  try {
    const existingDog = await prisma.dog.findUnique({
      where: { id: dogId }
    });

    // Check if the dog with the specified ID exists
    if (!existingDog) {
      return res.status(204).end();
    }

    const dogDelete = await prisma.dog.delete({
      where: { id: dogId }
    });

    console.log("Dog successfully deleted");
    res.status(200).json(dogDelete);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});






// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
