import express from "express";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import { setupSwagger } from "./swagger";


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/users", userRoutes);
app.use("/", postRoutes); // Mount posts at root since /posts is the base
app.use("/", commentRoutes); // Mount comments at root for nested routes


// Swagger setup
setupSwagger(app);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});