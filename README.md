<p align="center">
  <img src="logo.svg" width="160px" align="center" alt="Zetch logo" />
  <h1 align="center">Zetch</h1>
  <p align="center">
    An API client with static type inference from your Zod Schemas
  </p>
</p>


TODO :

1) Documentation
2) Changesets

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
    - [Requirements](#requirements)
    - [Node/npm](#from-npm-nodebun)
- [Types](#types)
    - [BaseZetchConfig](#base-zetch-config)
    - [ZetchRequestConfig](#zetch-request-config)
- [createZetchClient](#create-a-zetch-client)
- [ZetchError](#zetch-error)
- [Changelog](#changelog)
- [Contributing](#contributing)

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

### Requirements

### Node/npm


## Types

### BaseZetchConfig

### ZetchRequestConfig

## createZetchClient

## ZetchError

## Changelog

## Contributing