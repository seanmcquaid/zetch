<p align="center">
  <img src="logo.svg" width="160px" align="center" alt="Zetch logo" />
  <h1 align="center">Zetch</h1>
  <p align="center">
    HTTP Client with static type inference from your Zod Schemas
  </p>
</p>

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Configs](#configs)
  - [AuthConfig](#authconfig)
  - [RetriesConfig](#retriesconfig)
  - [BaseZetchConfig](#basezetchconfig)
  - [ZetchRequestConfig](#zetchrequestconfig)
  - [ZetchClientConfig](#zetchclientconfig)

## Introduction

Zetch is a Fetch based HTTP Client that allows you to get static type inference from your existing [Zod](https://github.com/colinhacks/zod) schemas.

Zetch is designed to be as simple, light-weight and un-opinionated as possible. The goal is that this will eliminate the need for you to manually pass in types to your API calls. Instead, you can just pass in your Zod schema associated with the API call and get immediate static type inference.

Some key features of Zetch are:

- **Static type inference** - Zetch will infer the types of your API calls from your Zod schemas.
- **Retries Configuration** - Zetch will retry your API calls to your specified amount if they fail and they meet your specified status codes.
- **Auth Configuration** - Zetch allows you to configure your Authorization headers by providing your token and token scheme. If the request fails, your provided refeshToken function will run to get a new token prior to the retried request.
- **Error logging** - Zetch will log API errors or Schema Validation errors to your configured onError functions.
- **Base Headers** - Zetch allows you to configure your headers in a simple way for all of your calls for one client.
- **Request Configuration** - Zetch allows you to configure your specific requests within a Zetch Client.

## Installation

```sh
npm install zetch       # npm
yarn add zetch          # yarn
bun add zetch           # bun
pnpm add zetch         # pnpm
```

## Usage

Making a GET request

```ts
// Create a schema for a Post
const postSchema = z.object({
  title: z.string(),
  body: z.string(),
  id: z.number(),
  userId: z.number(),
});

// Make a request to get Posts with your schema provided to get static type inference
await zetch.get('https://jsonplaceholder.typicode.com/posts', {
  validationSchema: z.array(postSchema),
});
```

Making a request with a body

```ts
// Make a POST request with your body
await zetch.post('/posts', {
  body: {
    title: 'foo',
    body: 'bar',
    userId: 1,
    id: 1,
  },
});

// Make a POST request with FormData
const formData = new FormData();
formData.append('title', 'foo');
formData.append('body', 'bar');
formData.append('userId', '1');
formData.append('id', '1');

await zetch.post('/posts', {
  body: formData,
});
```

Creating an API client and making a request

```ts
// Create a Zetch Client with a Base Url
const zetchClient = zetch.create({
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

## Configs

### AuthConfig

AuthConfig is used to configure the Authorization header for your requests and add in refreshing your token prior to a retried request.

```ts
interface AuthConfig {
  // The function you'd like called to refresh the token
  refreshToken: () => Promise<string>;
  // The token scheme you'd like to use (Basic, Bearer, JWTBearer)
  tokenScheme: TokenScheme;
  // Function to return the token you'd like to use
  token: () => string;
}
```

### RetriesConfig

Retries Config allows you to configure the number of retries and status codes for retries.

```ts
interface RetriesConfig {
  // Status codes you'd like to retry on
  retryStatuses: number[];
  // The max number of retries you'd like to allow
  numberOfRetries?: number;
}
```

### BaseZetchConfig

Base Zetch Config that's utilized for both requests and creating an API client

```ts
interface BaseZetchConfig {
  headers?: Headers;

  // Configuration for authentication
  authConfig?: AuthConfig;

  // Configuration for retries
  retriesConfig?: RetriesConfig;

  // The function you'd like to use to log API errors to your error service of choice
  onApiError?: (error: ZetchError) => void;

  // The function you'd like to use to log API Validation errors to your error service of choice
  onApiValidationError?: (error: ZodError) => void;
}
```

### ZetchRequestConfig

Configs for a Zetch Request

```ts
// Config used for all Zetch Requests except for GET requests
interface ZetchRequestConfig<ValidationSchema extends ZodFirstPartySchemaTypes>
  extends BaseZetchConfig {
  // The validation schema you'd like to use for the response
  validationSchema?: ValidationSchema;

  // The request body you'd like to send with the request
  body?: FormData | unknown[] | { [key: string]: unknown };

  // The abort controller you'd like to use for this request, in the event you would like to cancel the request
  abortController?: AbortController;
}

// Config used for GET requests
type ZetchGetRequestConfig<ValidationSchema extends ZodFirstPartySchemaTypes> =
  Omit<ZetchRequestConfig<ValidationSchema>, 'body'>;
```

### ZetchClientConfig

Config for your Zetch API Client from using `zetch.create`

```ts
interface ZetchClientConfig extends BaseZetchConfig {
  // The base url for your client
  baseUrl: string;
}
```
