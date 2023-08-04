import {
  HTTP_ERROR_MESSAGES,
  HttpError,
  $,
  ErrorFunctions,
  $400,
  $401,
  $403,
  $404,
  $405,
  $409,
  $410,
  $429,
  $500,
} from "./error"; // Replace 'your-file-path' with the correct path to your file
import { expect } from "chai";

// Test HTTP_ERROR_MESSAGES object
describe("HTTP_ERROR_MESSAGES", () => {
  it("should be an object", () => {
    expect(HTTP_ERROR_MESSAGES).to.be.an("object");
  });

  it('400 should be "Bad Request"', () => {
    expect(HTTP_ERROR_MESSAGES[400]).to.equal("Bad Request");
  });

  it('401 should be "Unauthorized"', () => {
    expect(HTTP_ERROR_MESSAGES[401]).to.equal("Unauthorized");
  });

  it('403 should be "Forbidden"', () => {
    expect(HTTP_ERROR_MESSAGES[403]).to.equal("Forbidden");
  });

  it('404 should be "Not Found"', () => {
    expect(HTTP_ERROR_MESSAGES[404]).to.equal("Not Found");
  });

  it("405 should be 'Method Not Allowed'", () => {
    expect(HTTP_ERROR_MESSAGES[405]).to.equal("Method Not Allowed");
  });

  it('409 should be "Conflict"', () => {
    expect(HTTP_ERROR_MESSAGES[409]).to.equal("Conflict");
  });

  it('410 should be "Gone"', () => {
    expect(HTTP_ERROR_MESSAGES[410]).to.equal("Gone");
  });

  it('429 should be "Too Many Requests"', () => {
    expect(HTTP_ERROR_MESSAGES[429]).to.equal("Too Many Requests");
  });

  it('500 should be "Internal Server Error"', () => {
    expect(HTTP_ERROR_MESSAGES[500]).to.equal("Internal Server Error");
  });
});

// Test HttpError class
describe("HttpError", () => {
  it("should create an instance of HttpError", () => {
    const httpError = new HttpError(404, "Not Found");
    expect(httpError).to.be.an.instanceOf(HttpError);
  });

  it("should have the correct status and message", () => {
    const status = 400;
    const message = "Bad Request";
    const httpError = new HttpError(status, message);
    expect(httpError.status).to.equal(status);
    expect(httpError.message).to.equal(message);
  });
});

// Test ErrorFunction $
describe("$", () => {
  it("should return an instance of HttpError", () => {
    const httpError = $(404, "Not Found");
    expect(httpError).to.be.an.instanceOf(Function);
  });

  it("should have the correct status and message", () => {
    const status = 400;
    const message = "Bad Request";
    const httpError = $(status, message)();
    expect(httpError.status).to.equal(status);
    expect(httpError.message).to.equal(message);
  });

  it("should have the correct status and message when only status is provided", () => {
    const status = 400;
    const httpError = $(status)();
    expect(httpError.status).to.equal(status);
    expect(httpError.message).to.equal(HTTP_ERROR_MESSAGES[status]);

    const status2 = 404;
    const httpError2 = $(status2)();
    expect(httpError2.status).to.equal(status2);
    expect(httpError2.message).to.equal(HTTP_ERROR_MESSAGES[status2]);

    const status3 = 450;
    const httpError3 = $(status3)();
    expect(httpError3.status).to.equal(status3);
    expect(httpError3.message).to.equal("Unknown Error");
  });
});

describe("ErrorFunctions", () => {
  describe("4xx", () => {
    // Test error functions for 400 - 499
    it("4xx should return an instance of HttpError", () => {
      for (let i = 400; i < 500; i++) {
        const httpError = ErrorFunctions[i]();
        expect(httpError).to.be.an.instanceOf(HttpError);
      }
    });

    it("4xx should have the correct status and message", () => {
      for (let i = 400; i < 500; i++) {
        const httpError = ErrorFunctions[i]();
        expect(httpError.status).to.equal(i);
        expect(httpError.message).to.equal(
          HTTP_ERROR_MESSAGES[i] ?? "Unknown Error"
        );
      }
    });
  });

  describe("5xx", () => {
    // Test error functions for 500 - 599
    it("5xx should return an instance of HttpError", () => {
      for (let i = 500; i < 600; i++) {
        const httpError = ErrorFunctions[i]();
        expect(httpError).to.be.an.instanceOf(HttpError);
      }
    });

    it("5xx should have the correct status and message", () => {
      for (let i = 500; i < 600; i++) {
        const httpError = ErrorFunctions[i]();
        expect(httpError.status).to.equal(i);
        expect(httpError.message).to.equal(
          HTTP_ERROR_MESSAGES[i] ?? "Unknown Error"
        );
      }
    });
  });
});

describe("Function shortcuts", () => {
  [
    { status: 400, function: $400 },
    { status: 401, function: $401 },
    { status: 403, function: $403 },
    { status: 404, function: $404 },
    { status: 405, function: $405 },
    { status: 409, function: $409 },
    { status: 410, function: $410 },
    { status: 429, function: $429 },
    { status: 500, function: $500 },
  ].forEach(({ status, function: func }) => {
    describe(`$${status}`, () => {
      it(`${status} should return an instance of HttpError`, () => {
        const httpError = func();
        expect(httpError).to.be.an.instanceOf(HttpError);
      });

      it(`${status} should have the correct status and message`, () => {
        const httpError = func();
        expect(httpError.status).to.equal(status);
        expect(httpError.message).to.equal(
          HTTP_ERROR_MESSAGES[status] ?? "Unknown Error"
        );
      });
    });
  });
});
