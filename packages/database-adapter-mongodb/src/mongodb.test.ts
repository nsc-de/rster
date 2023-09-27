import { AdapterTests } from "@rster/database-adapter-tests";
import MongoDBAdapterFactory from "./mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import { DatabaseAdapter } from "@rster/database";
import { AllowAnyTypeInformation } from "@rster/types";

describe("MongoDBAdapter", () => {
  let mongoServer: MongoMemoryServer;
  let mongoUri: string;
  let resolve: (value: DatabaseAdapter<AllowAnyTypeInformation>) => void;
  const adapter = new Promise<DatabaseAdapter<AllowAnyTypeInformation>>(
    (rs) => {
      resolve = rs;
    }
  );
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = await mongoServer.getUri();
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    await mongoClient.db("test").collection("aa").insertOne({ test: 1 });
    await mongoClient.close();

    resolve(
      MongoDBAdapterFactory({
        url: mongoUri,
        database: "test",
      })
    );
  });
  AdapterTests(adapter);

  afterAll(async () => {
    // await mongoServer.stop();
  });
});
