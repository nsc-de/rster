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

// Test HTTP_ERROR_MESSAGES object
describe("HTTP_ERROR_MESSAGES", () => {
  it("should be an object", () => {
    expect(typeof HTTP_ERROR_MESSAGES).toBe("object");
  });

  it('400 should be "Bad Request"', () => {
    expect(HTTP_ERROR_MESSAGES[400]).toEqual("Bad Request");
  });

  it('401 should be "Unauthorized"', () => {
    expect(HTTP_ERROR_MESSAGES[401]).toEqual("Unauthorized");
  });

  it('403 should be "Forbidden"', () => {
    expect(HTTP_ERROR_MESSAGES[403]).toEqual("Forbidden");
  });

  it('404 should be "Not Found"', () => {
    expect(HTTP_ERROR_MESSAGES[404]).toEqual("Not Found");
  });

  it("405 should be 'Method Not Allowed'", () => {
    expect(HTTP_ERROR_MESSAGES[405]).toEqual("Method Not Allowed");
  });

  it('409 should be "Conflict"', () => {
    expect(HTTP_ERROR_MESSAGES[409]).toEqual("Conflict");
  });

  it('410 should be "Gone"', () => {
    expect(HTTP_ERROR_MESSAGES[410]).toEqual("Gone");
  });

  it('429 should be "Too Many Requests"', () => {
    expect(HTTP_ERROR_MESSAGES[429]).toEqual("Too Many Requests");
  });

  it('500 should be "Internal Server Error"', () => {
    expect(HTTP_ERROR_MESSAGES[500]).toEqual("Internal Server Error");
  });
});

// Test HttpError class
describe("HttpError", () => {
  it("should create an instance of HttpError", () => {
    const httpError = new HttpError(404, "Not Found");
    expect(httpError).toBeInstanceOf(HttpError);
  });

  it("should have the correct status and message", () => {
    const status = 400;
    const message = "Bad Request";
    const httpError = new HttpError(status, message);
    expect(httpError.status).toEqual(status);
    expect(httpError.message).toEqual(message);
  });
});

// Test ErrorFunction $
describe("$", () => {
  it("should return an instance of HttpError", () => {
    const httpError = $(404, "Not Found");
    expect(httpError).toBeInstanceOf(Function);
  });

  it("should have the correct status and message", () => {
    const status = 400;
    const message = "Bad Request";
    const httpError = $(status, message)();
    expect(httpError.status).toEqual(status);
    expect(httpError.message).toEqual(message);
  });

  it("should have the correct status and message when only status is provided", () => {
    const status = 400;
    const httpError = $(status)();
    expect(httpError.status).toEqual(status);
    expect(httpError.message).toEqual(HTTP_ERROR_MESSAGES[status]);

    const status2 = 404;
    const httpError2 = $(status2)();
    expect(httpError2.status).toEqual(status2);
    expect(httpError2.message).toEqual(HTTP_ERROR_MESSAGES[status2]);

    const status3 = 450;
    const httpError3 = $(status3)();
    expect(httpError3.status).toEqual(status3);
    expect(httpError3.message).toEqual("Unknown Error");
  });
});

describe("ErrorFunctions", () => {
  it("create", () => {
    // should return $
    expect(ErrorFunctions.create).toEqual($);
  });

  it("$", () => {
    // should return $
    expect(ErrorFunctions.$).toEqual($);
  });

  it("$ errors [should test 200 functions]", () => {
    for (let i = 400; i < 600; i++) {
      const fn = ErrorFunctions[`$${i}`];
      expect(fn).toBeInstanceOf(Function);
      const httpError = fn();
      expect(httpError).toBeInstanceOf(HttpError);
      expect(httpError.status).toEqual(i);
      expect(httpError.message).toEqual(
        HTTP_ERROR_MESSAGES[i] ?? "Unknown Error"
      );
    }

    // @ts-ignore
    expect(() => ErrorFunctions.$aaa).toThrow("Unknown error function $aaa");
  });

  it("direct errors [should test 200 functions]", () => {
    for (let i = 400; i < 600; i++) {
      const fn = ErrorFunctions[i];
      expect(fn).toBeInstanceOf(Function);
      const httpError = fn();
      expect(httpError).toBeInstanceOf(HttpError);
      expect(httpError.status).toEqual(i);
      expect(httpError.message).toEqual(
        HTTP_ERROR_MESSAGES[i] ?? "Unknown Error"
      );
    }

    // @ts-ignore
    expect(() => ErrorFunctions.aaa).toThrow("Unknown error function aaa");
  });
  describe("4xx", () => {
    // Test error functions for 400 - 499
    it("4xx should return an instance of HttpError", () => {
      for (let i = 400; i < 500; i++) {
        const httpError = ErrorFunctions[i]();
        expect(httpError).toBeInstanceOf(HttpError);
      }
    });

    it("4xx should have the correct status and message", () => {
      for (let i = 400; i < 500; i++) {
        const httpError = ErrorFunctions[i]();
        expect(httpError.status).toEqual(i);
        expect(httpError.message).toEqual(
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
        expect(httpError).toBeInstanceOf(HttpError);
      }
    });

    it("5xx should have the correct status and message", () => {
      for (let i = 500; i < 600; i++) {
        const httpError = ErrorFunctions[i]();
        expect(httpError.status).toEqual(i);
        expect(httpError.message).toEqual(
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
        expect(httpError).toBeInstanceOf(HttpError);
      });

      it(`${status} should have the correct status and message`, () => {
        const httpError = func();
        expect(httpError.status).toEqual(status);
        expect(httpError.message).toEqual(
          HTTP_ERROR_MESSAGES[status] ?? "Unknown Error"
        );
      });
    });
  });
});
