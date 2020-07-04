Welcome to the `babanu-server` api

# How to run it

## Requirements

You must install Docker & Node.Js on your computer at first.

Add src/env.ts file with following lines

```ts
export default {
  /**
   * SECRET KEY
   *
   * used for hashing password
   */
  SECRET_KEY: <your secret key>,
}
```

Start DB

```bash
yarn up
```

Install deps

```bash
yarn
```

## Then, Run it

Run app

```bash
yarn start
```

Run tests

```bash
yarn test
```

## Todo

- authorizations (wip)
- logger
