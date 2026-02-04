# Azure Login Action Dev Container

This development container provides a pre-configured environment for developing and testing the Azure Login GitHub Action.

## What's Included

- **Node.js 20** - JavaScript/TypeScript runtime
- **Azure CLI** - Command-line tools for Azure
- **PowerShell** - Cross-platform PowerShell for Azure PowerShell module
- **GitHub CLI** - Command-line tools for GitHub
- **GNU Core Utilities** - Standard Unix tools (bash, grep, sed, etc.)
- **VS Code Extensions** - Azure and development tools

## Quick Start

### Using VS Code

1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open this repository in VS Code
3. Click "Reopen in Container" when prompted (or use Command Palette: `Dev Containers: Reopen in Container`)
4. Wait for the container to build and start

### Using GitHub Codespaces

1. Click the "Code" button on the GitHub repository
2. Select "Codespaces" tab
3. Click "Create codespace on main" (or your branch)

## Features

### Pre-installed Tools

- Azure CLI configured and ready to use
- PowerShell with support for Azure PowerShell modules
- All npm dependencies installed automatically
- GNU utilities for shell scripting and automation

### Optimized for Development

- **Persistent Azure credentials** (optional): You can mount your `~/.azure` folder by adding this to `.devcontainer/devcontainer.json`:

  ```json
  "mounts": [
    "source=${localEnv:HOME}/.azure,target=/home/node/.azure,type=bind,consistency=cached"
  ]
  ```

  Note: This requires the `HOME` environment variable on your host system (Linux/Mac). Windows users should use `${localEnv:USERPROFILE}/.azure` instead.
- **Auto-install dependencies**: `npm install` runs automatically on container creation
- **Consistent environment**: Everyone uses the same tool versions

### Environment Variables

- `AZURE_CORE_NO_COLOR=true` - Disables colored output for easier log parsing

## Building and Testing

### Using the Development Helper Script

The dev container includes a helper script that streamlines common tasks:

```bash
# Run environment checks
.devcontainer/dev.sh check

# Quick development workflow (build + test)
.devcontainer/dev.sh dev

# Full setup (install dependencies + build)
.devcontainer/dev.sh setup

# Validate Azure configuration
.devcontainer/dev.sh validate

# View all available commands
.devcontainer/dev.sh help
```

### Manual Commands

#### Build the Action

```bash
npm run build
```

#### Run Tests

```bash
npm test
```

#### Test Azure CLI

```bash
az version
az login  # If needed
az account show
```

#### Test PowerShell

```bash
pwsh
# In PowerShell:
$PSVersionTable
Get-Command Connect-AzAccount
```

## Streamlined Workflow

This dev container streamlines the development process by:

1. **Eliminating setup time** - No need to install Azure CLI, PowerShell, or Node.js manually
2. **Ensuring consistency** - All developers use the same tool versions
3. **Simplifying Azure testing** - Azure CLI and PowerShell are pre-configured
4. **Supporting GNU tools** - Full suite of Unix utilities for scripting and automation

## Customization

To add more features, edit `.devcontainer/devcontainer.json` and add features from:

- [Dev Container Features](https://containers.dev/features)
- [Microsoft Features](https://github.com/devcontainers/features)

## Troubleshooting

### Azure credentials not persisting

By default, Azure credentials are not persisted between container rebuilds. To persist credentials:

1. Add a mount configuration to `.devcontainer/devcontainer.json`:
   - **Linux/Mac**: `"source=${localEnv:HOME}/.azure,target=/home/node/.azure,type=bind,consistency=cached"`
   - **Windows**: `"source=${localEnv:USERPROFILE}/.azure,target=/home/node/.azure,type=bind,consistency=cached"`
2. Make sure the `.azure` folder exists on your host machine before starting the container
3. Rebuild the container

### Container build fails

Try rebuilding without cache:

- VS Code: Command Palette → `Dev Containers: Rebuild Container Without Cache`
- CLI: `docker build --no-cache`

### npm install fails

The container automatically runs `npm install` on creation. If it fails:

1. Check your internet connection
2. Rebuild the container
3. Manually run `npm install` in the container terminal
