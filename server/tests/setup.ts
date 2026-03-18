import mongoose from "mongoose";

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Missing MONGO_URI for tests");
  }

  // Use a dedicated test database so tests never touch dev/prod data
  const testUri = mongoUri.replace(/\/([^/?]+)(\?|$)/, "/finalproject_fsd_test$2");
  await mongoose.connect(testUri);
});

afterAll(async () => {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});