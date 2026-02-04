#!/usr/bin/env bash
#
# Azure Login Action - Development Helper Script
# 
# This script provides streamlined commands for common development tasks
# using GNU utilities and Azure tools.
#

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

# Check if we're in a dev container
check_dev_container() {
    if [[ -n "${REMOTE_CONTAINERS:-}" ]] || [[ -n "${CODESPACES:-}" ]]; then
        log_info "Running in dev container environment"
        return 0
    else
        log_warning "Not running in dev container - some features may not work optimally"
        return 1
    fi
}

# Verify Azure CLI is available
check_azure_cli() {
    if command -v az &> /dev/null; then
        local az_version
        az_version=$(az version --output tsv 2>&1 | grep -oP 'azure-cli\s+\K[\d.]+' || echo "unknown")
        log_info "Azure CLI version: ${az_version}"
        return 0
    else
        log_error "Azure CLI not found. Please install it or use the dev container."
        return 1
    fi
}

# Verify PowerShell is available
check_powershell() {
    if command -v pwsh &> /dev/null; then
        local pwsh_version
        pwsh_version=$(pwsh -NoProfile -Command '$PSVersionTable.PSVersion.ToString()' 2>/dev/null || echo "unknown")
        log_info "PowerShell version: ${pwsh_version}"
        return 0
    else
        log_error "PowerShell not found. Please install it or use the dev container."
        return 1
    fi
}

# Run all prerequisite checks
run_checks() {
    log_info "Running environment checks..."
    check_dev_container || true
    check_azure_cli || return 1
    check_powershell || return 1
    log_success "All prerequisite checks passed"
}

# Build the action
build_action() {
    log_info "Building Azure Login Action..."
    cd "${PROJECT_ROOT}"
    
    if [[ ! -f package.json ]]; then
        log_error "package.json not found in ${PROJECT_ROOT}"
        return 1
    fi
    
    npm run build
    log_success "Build completed successfully"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    cd "${PROJECT_ROOT}"
    npm test
    log_success "Tests completed"
}

# Clean build artifacts
clean() {
    log_info "Cleaning build artifacts..."
    cd "${PROJECT_ROOT}"
    rm -rf lib/
    rm -rf node_modules/
    log_success "Clean completed"
}

# Install dependencies
install_deps() {
    log_info "Installing dependencies..."
    cd "${PROJECT_ROOT}"
    npm install
    log_success "Dependencies installed"
}

# Full setup (install + build)
setup() {
    log_info "Running full setup..."
    install_deps
    build_action
    log_success "Setup completed"
}

# Validate Azure login configuration
validate_azure() {
    log_info "Validating Azure configuration..."
    
    # Check if logged in to Azure CLI
    if az account show &> /dev/null; then
        log_success "Azure CLI: Logged in"
        az account show --output table
    else
        log_warning "Azure CLI: Not logged in. Run 'az login' to authenticate."
    fi
    
    # Check PowerShell Az module
    if pwsh -NoProfile -Command "Get-Module -ListAvailable -Name Az.Accounts" &> /dev/null; then
        log_success "PowerShell: Az.Accounts module available"
    else
        log_warning "PowerShell: Az.Accounts module not found. Run 'Install-Module -Name Az -AllowClobber -Scope CurrentUser' in PowerShell."
    fi
}

# Quick development workflow
dev() {
    log_info "Running development workflow..."
    build_action
    run_tests
    log_success "Development workflow completed"
}

# Display usage information
usage() {
    cat << EOF
Azure Login Action - Development Helper

USAGE:
    $0 <command>

COMMANDS:
    check       Run environment prerequisite checks
    build       Build the action
    test        Run tests
    dev         Quick dev workflow (build + test)
    setup       Full setup (install deps + build)
    install     Install npm dependencies
    clean       Clean build artifacts
    validate    Validate Azure configuration
    help        Show this help message

EXAMPLES:
    $0 check          # Check environment
    $0 dev            # Build and test
    $0 setup          # Install and build
    $0 validate       # Check Azure login status

For more information, see .devcontainer/README.md
EOF
}

# Main command handler
main() {
    cd "${PROJECT_ROOT}"
    
    case "${1:-help}" in
        check)
            run_checks
            ;;
        build)
            build_action
            ;;
        test)
            run_tests
            ;;
        dev)
            dev
            ;;
        setup)
            setup
            ;;
        install)
            install_deps
            ;;
        clean)
            clean
            ;;
        validate)
            validate_azure
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            log_error "Unknown command: $1"
            echo
            usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
