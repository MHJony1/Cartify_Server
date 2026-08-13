import "dotenv/config";
import app from "./app/app";



const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Cartify server running on port ${PORT}`);
});