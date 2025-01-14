# Development Guide

This guide provides information for contributors and maintainers of the `StacksmithsVpc` module.

---

## Prerequisites

1. **Node.js**: Ensure you have Node.js installed (version 16 or later).

   ### Installation Steps (Ubuntu)

   - Update your system:

     ```bash
     sudo apt update && sudo apt upgrade -y
     ```

   - Install Node.js from the NodeSource repository:

     ```bash
     curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
     sudo apt install -y nodejs
     ```

   - Verify installation:

     ```bash
     node -v
     npm -v
     ```

2. **AWS CDK**: Install the AWS CDK CLI:

   ```bash
   npm install -g aws-cdk
   ```

3. **Dependencies**: Install project dependencies in the root directory of the project (the directory where `package.json` is located):

   ```bash
   npm install
   ```

4. **Initialize the Project**: This step applies only when setting up a new project in an empty directory. To initialize a CDK project, use the following command:

   ```bash
   cdk init app --language typescript
   ```

   This creates the basic structure for a CDK project. For detailed information about the default project structure, refer to the [CDK documentation](https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk.html).

---

## Project Structure

```text
.
├── cdk.json         # CDK CLI configuration
├── examples/        # Example usage of the module
├── jest.config.js   # Jest testing configuration
├── src/             # Source code for the construct
├── test/            # Unit tests for the module
├── package.json     # Node.js package metadata
├── README.md        # User documentation
├── DEVELOPMENT.md   # Contributor documentation (this file)
└── tsconfig.json    # TypeScript configuration
```

---

## Development Workflow

### Running Tests

Run unit tests with Jest (e.g., to validate constructs and ensure expected outputs). Run the tests:

```bash
npm test
```

To watch tests during development, use the following command:

```bash
npm test -- --watch
```

### Linting and Formatting

Ensure code follows consistent style guidelines:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint:fix
```

### Building the Module

Compile TypeScript into JavaScript:

```bash
npm run build
```

Clean up compiled files:

```bash
npm run clean
```

---

## Useful Commands

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `npm test`         | Run unit tests                     |
| `npm run lint`     | Check code style                   |
| `npm run lint:fix` | Fix code style issues              |
| `npm run build`    | Compile TypeScript into JavaScript |
| `npm run clean`    | Remove compiled files              |
