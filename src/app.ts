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

  try {
    const dog = await prisma.dog.findUnique({
      where: {
        id: dogId,
      },
    });

    if (!dog) {
      res.status(404).json({ error: "Dog not found" });
    } else {
      res.status(200).json(dog);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new dog
app.post("/dogs", async (req, res) => {
  const dog: DogObject = req.body;
  try {
    const dogPost = await prisma.dog.create({ data: dog });
    res.status(201).json(dogPost);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update dog
app.patch("/dogs/:id", async (req, res) => {
  const dogId = Number(req.params.id);
  const dog: DogObject = req.body;
  try {
    const dogUpdate = await prisma.dog.update({
      where: { id: dogId },
      data: dog
    });
    res.status(201).json(dogUpdate);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete dog
app.delete("/dogs/:id", async (req, res) => {
  const dogId = parseInt(req.params.id); // Parse the string to a number
  try {
    const dogDelete = await prisma.dog.delete({
      where: { id: dogId }
    });
    console.log("dog successfully deleted")
    res.status(204).json(dogDelete);
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
