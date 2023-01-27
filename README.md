<p align="center">
  <img src="logo.svg" width="160px" align="center" alt="Zetch logo" />
  <h1 align="center">Zetch</h1>
  <p align="center">
    A Fetch based HTTP Client with static type inference from your Zod Schemas
  </p>
</p>

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [zetch](#zetch)
  - [.get](#get)
  - [.post](#post)
  - [.put](#put)
  - [.patch](#patch)
  - [.delete](#delete)
  - [.create](#create)

## Introduction

## Installation

```sh
npm install zetch       # npm
yarn add zetch          # yarn
bun add zetch           # bun
pnpm add zetch         # pnpm
```

## Basic Usage

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
await zetch.get('/posts', {
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

## Zetch

### .get

```ts

```

### .post

### .put

### .patch

### .delete

### .create