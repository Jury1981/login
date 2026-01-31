import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as core from '@actions/core';

import { AzureCliLogin } from '../../src/Cli/AzureCliLogin';
import { LoginConfig } from '../../src/common/LoginConfig';

jest.setTimeout(30000);

// Mock the modules
jest.mock('@actions/exec');
jest.mock('@actions/io');
jest.mock('@actions/core');

describe('AzureCliLogin', () => {
    let azureCliLogin: AzureCliLogin;
    let loginConfig: LoginConfig;
    let execMock: jest.Mocked<typeof exec>;
    let ioMock: jest.Mocked<typeof io>;
    let coreMock: jest.Mocked<typeof core>;

    beforeEach(() => {
        execMock = exec as jest.Mocked<typeof exec>;
        ioMock = io as jest.Mocked<typeof io>;
        coreMock = core as jest.Mocked<typeof core>;

        // Reset all mocks
        jest.clearAllMocks();

        // Setup default mocks
        ioMock.which.mockResolvedValue('/usr/bin/az');
        coreMock.info.mockImplementation(() => {});
        coreMock.debug.mockImplementation(() => {});
        coreMock.warning.mockImplementation(() => {});
        coreMock.error.mockImplementation(() => {});

        // Create a basic login config for managed identity
        loginConfig = new LoginConfig();
        loginConfig.authType = LoginConfig.AUTH_TYPE_IDENTITY;
        loginConfig.servicePrincipalId = 'test-client-id';
        loginConfig.tenantId = 'test-tenant-id';
        loginConfig.subscriptionId = 'test-subscription-id';
        loginConfig.environment = 'azurecloud';

        azureCliLogin = new AzureCliLogin(loginConfig);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('loginWithUserAssignedIdentity - Azure CLI version handling', () => {
        beforeEach(() => {
            // Mock executeAzCliCommand to capture arguments
            execMock.exec.mockResolvedValue(0);
        });

        test('should use --username for Azure CLI version < 2.69.0', async () => {
            // Set Azure CLI version to 2.68.0
            azureCliLogin.azVersion = '2.68.0';

            const args: string[] = ['--identity'];
            await azureCliLogin.loginWithUserAssignedIdentity(args);

            // Verify that --username was added to args
            expect(args).toContain('--username');
            expect(args).toContain('test-client-id');
            expect(args).not.toContain('--client-id');
        });

        test('should use --client-id for Azure CLI version >= 2.69.0', async () => {
            // Set Azure CLI version to 2.69.0
            azureCliLogin.azVersion = '2.69.0';

            const args: string[] = ['--identity'];
            await azureCliLogin.loginWithUserAssignedIdentity(args);

            // Verify that --client-id was added to args
            expect(args).toContain('--client-id');
            expect(args).toContain('test-client-id');
            expect(args).not.toContain('--username');
        });

        test('should use --client-id for Azure CLI version 2.70.0', async () => {
            // Set Azure CLI version to 2.70.0
            azureCliLogin.azVersion = '2.70.0';

            const args: string[] = ['--identity'];
            await azureCliLogin.loginWithUserAssignedIdentity(args);

            // Verify that --client-id was added to args
            expect(args).toContain('--client-id');
            expect(args).toContain('test-client-id');
            expect(args).not.toContain('--username');
        });

        test('should use --username when Azure CLI version parsing fails', async () => {
            // Set an unparseable version
            azureCliLogin.azVersion = 'invalid-version';

            const args: string[] = ['--identity'];
            await azureCliLogin.loginWithUserAssignedIdentity(args);

            // Verify that --username is used as fallback
            expect(args).toContain('--username');
            expect(args).toContain('test-client-id');
            expect(args).not.toContain('--client-id');
            expect(coreMock.warning).toHaveBeenCalledWith('Failed to parse the minor version of Azure CLI. Assuming the version is less than 2.69.0');
        });

        test('should use --username for Azure CLI version 2.0.0', async () => {
            // Set Azure CLI version to very old version
            azureCliLogin.azVersion = '2.0.0';

            const args: string[] = ['--identity'];
            await azureCliLogin.loginWithUserAssignedIdentity(args);

            // Verify that --username was added to args
            expect(args).toContain('--username');
            expect(args).toContain('test-client-id');
            expect(args).not.toContain('--client-id');
        });

        test('should use --client-id for Azure CLI version 2.100.0', async () => {
            // Set Azure CLI version to future version
            azureCliLogin.azVersion = '2.100.0';

            const args: string[] = ['--identity'];
            await azureCliLogin.loginWithUserAssignedIdentity(args);

            // Verify that --client-id was added to args
            expect(args).toContain('--client-id');
            expect(args).toContain('test-client-id');
            expect(args).not.toContain('--username');
        });

        test('should handle version with only major number', async () => {
            // Set Azure CLI version to just major version
            azureCliLogin.azVersion = '2';

            const args: string[] = ['--identity'];
            await azureCliLogin.loginWithUserAssignedIdentity(args);

            // parseInt on undefined should return NaN, which is < 69, so --username should be used
            expect(args).toContain('--username');
            expect(args).toContain('test-client-id');
        });
    });
});
