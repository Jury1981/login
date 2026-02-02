# Example: Using Azure Login Action in Dev Containers

This example demonstrates how to use the Azure Login action in a GitHub Actions workflow
with dev containers for testing.

## Basic Workflow with Dev Container

```yaml
name: Test in Dev Container

on: [push, pull_request]

jobs:
  test-in-devcontainer:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Build and run dev container
        uses: devcontainers/ci@v0.3
        with:
          runCmd: |
            # The dev container has Azure CLI and PowerShell pre-installed
            az version
            pwsh -Command '$PSVersionTable'
            
            # Run the build and test
            npm run build
            npm test

  azure-login-test:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    
    steps:
      - name: Azure Login with OIDC
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      
      - name: Run Azure CLI commands
        run: |
          az account show
          az group list
```

## Dev Container Testing Workflow

```yaml
name: Dev Container Validation

on:
  push:
    paths:
      - '.devcontainer/**'
      - 'src/**'
  pull_request:

jobs:
  validate-devcontainer:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Test Dev Container
        uses: devcontainers/ci@v0.3
        with:
          runCmd: |
            # Verify all tools are available
            node --version
            npm --version
            az version
            pwsh --version
            gh --version
            
            # Run development workflow
            .devcontainer/dev.sh check
            .devcontainer/dev.sh dev
```

## Local Development

For local development, use the dev container directly:

1. Open repository in VS Code
2. Install the "Dev Containers" extension
3. Click "Reopen in Container"
4. Run commands:

   ```bash
   # Quick development workflow
   .devcontainer/dev.sh dev
   
   # Or manually
   npm install
   npm run build
   npm test
   ```

## Benefits

- **Consistent Environment**: Same tools across all developers and CI
- **Pre-configured Azure Tools**: Azure CLI and PowerShell ready to use
- **GNU Utilities**: Full Unix toolchain for scripting
- **Fast Setup**: No manual installation required
