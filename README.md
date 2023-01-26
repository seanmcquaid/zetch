<p align="center">
  <img src="logo.svg" width="160px" align="center" alt="Zetch logo" />
  <h1 align="center">Zetch</h1>
  <p align="center">
    An API client with static type inference from your Zod Schemas
  </p>
</p>

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Base Configuration Options](#base-configuration-options)
- [Request Configuration Options](#request-configuration-options)

## Introduction

Zetch is an API Client library that allows you to get static type inference from your existing [Zod](https://github.com/colinhacks/zod) schemas.

Zetch is designed to be as simple, light-weight and un-opinionated as possible. The goal is that this will eliminate the need for you to manually pass in types to your API calls. Instead, you can just pass in your Zod schema associated with the API call and get immediate static type inference.

Some key features of Zetch are:

- **Static type inference** - Zetch will infer the types of your API calls from your Zod schemas.
- **Retries Configuration** - Zetch will retry your API calls to your specified amount if they fail and they meet your specified status codes.
- **Auth Configuration** - Zetch allows you to configure your Authorization headers by providing your token and token scheme. If the request fails, your provided refeshToken function will run to get a new token prior to the retried request.
- **Error logging** - Zetch will log API errors or Schema Validation errors to your configured logging functions.
- **Base Headers** - Zetch allows you to configure your headers in a simple way for all of your calls for one client.
- **Request Configuration** - Zetch allows you to configure your specific requests within a Zetch Client.

## Installation

```sh
npm install zetch       # npm
yarn add zetch          # yarn
bun add zetch           # bun
pnpm add zetch         # pnpm
```

## Basic Usage

Creating an API client and making a request

```ts
// Create a Zetch Client with a Base Url
const zetchClient = createZetchClient({
  baseUrl: 'https://jsonplaceholder.typicode.com',
});

// Create a schema for a Post
const postSchema = z.object({
  title: z.string(),
  body: z.string(),
  id: z.number(),
  userId: z.number(),
});

// Make a request to get Posts with your schema provided to get static type inference
const result = await zetchClient.get('/posts', {
  validationSchema: z.array(postSchema),
});
```

## Base Configuration Options

```ts
interface BaseZetchConfig {
    // The base url for your client
    baseUrl: string;

    // Base headers you'd like to provide for every request from the client
    headers?: Headers;

    // Configuration for authentication
    authConfig?: {
        // The function you'd like called to refresh the token
        refreshToken: () => Promise<string>;
        // The token scheme you'd like to use (Basic, Bearer, JWTBearer)
        tokenScheme: TokenScheme;
        // The original token you'd like to use
        token: string;
    };

    // Configuration for retries
    retriesConfig?: {
        // Status codes you'd like to retry on
        retryStatuses: number[];
        // The max number of retries you'd like to allow
        numberOfRetries?: number;
    };

    // The function you'd like to use to log API errors to your error service of choice
    logApiError?: (error: ZetchError) => void;

    // The function you'd like to use to log API Validation errors to your error service of choice
    logApiValidationError?: (error: ZodError) => void;
}
```

## Request Configuration Options

```ts
interface ZetchRequestConfig {
  // The validation schema you'd like to use for the response
  validationSchema?: ZodFirstPartySchemaTypes;

  // The headers you'd like to provide for this specific request. These will override previously set values in your client
  headers?: Headers;

  // The request body you'd like to send with the request
  body?: FormData | unknown[] | { [key: string]: unknown };

  // The abort controller you'd like to use for this request, in the event you would like to cancel the request
  abortController?: AbortController;
}
```

```ts
interface ZetchGetRequestConfig<
    ValidationSchema extends ZodFirstPartySchemaTypes
> {
    // The validation schema you'd like to use for the response
    validationSchema?: ValidationSchema;

    // The headers you'd like to provide for this specific request. These will override previously set values in your client
    headers?: Headers;

    // The abort controller you'd like to use for this request, in the event you would like to cancel the request
    abortController?: AbortController;
}
```