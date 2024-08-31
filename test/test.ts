// Make sure we are in test mode!
import dotenv from "dotenv";
import process from "process";
process.env.TEST = "true";

// Also need to load the .env file
dotenv.config();

import assert from "assert";
import type { WebSessionDoc } from "../server/concepts/websession";

// Test mode must be set before importing the routes
import { routes } from "../server/routes";

import db, { client } from "../server/db";
if (db.databaseName !== "test-db") {
  throw new Error("Not connected to test database");
}

// Actual WebSession comes form Express.js, but here
// we just need a mock object
const getEmptySession = () => {
  return { cookie: {} } as WebSessionDoc;
};

beforeEach(async () => {
  // We just drop the test database before each test
  await db.dropDatabase();

  // Might want to add some default users for convenience
  await routes.createUser(getEmptySession(), "alice", "alice123");
  await routes.createUser(getEmptySession(), "bob", "bob123");
});

describe("Create a user and log in", () => {
  it("should create a user and log in", async () => {
    const session = getEmptySession();

    await assert.doesNotReject(routes.createUser(session, "barish", "1234"));
    await assert.rejects(routes.logIn(session, "barish", "123"));
    await assert.doesNotReject(routes.logIn(session, "barish", "1234"));
    await assert.rejects(routes.logIn(session, "barish", "1234"), "Should not be able to login while already logged-in");
  });

  it("duplicate username should fail", async () => {
    const session = getEmptySession();

    await assert.doesNotReject(routes.createUser(session, "barish", "1234"));
    await assert.rejects(routes.createUser(session, "barish", "1234"));
  });
});

// More testcases needed!

// After all tests are done, we close the connection
// so that the program can exit
after(async () => {
  await client.close();
});
