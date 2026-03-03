# Automated Testing Guide - Kiadas Figyelo

## Overview

This project uses **Jest** as the testing framework with **jest-junit** for XML reporting of test results. All test results are automatically logged in XML format for CI/CD integration and test reporting.

## Running Tests

### Basic Test Execution
```bash
npm test
```
Runs all tests once and displays results in the terminal.

### Watch Mode
```bash
npm run test:watch
```
Runs tests in watch mode - automatically reruns tests when files change.

### Coverage Report
```bash
npm run test:coverage
```
Runs tests and generates a coverage report showing which parts of the code are tested.

### XML Report Generation
```bash
npm run test:xml
```
Runs all tests and generates an XML report file (`junit.xml`) in the root directory.

## Test Structure

Tests are organized in the `__tests__` directory, mirroring the source code structure:

```
__tests__/
├── lib/
│   ├── auth.test.ts       # Authentication function tests
│   └── currency.test.ts   # Currency utility tests
```

## Test Files

### 1. Authentication Tests (`__tests__/lib/auth.test.ts`)
Tests for all authentication-related functions:

- **Password Hashing**
  - Hash password correctly
  - Produce different hashes for same password

- **Password Verification**
  - Verify correct password
  - Reject incorrect password
  - Handle empty password

- **JWT Token Generation & Verification**
  - Generate valid tokens
  - Verify valid tokens
  - Reject invalid tokens
  - Include correct payload data

- **Token Utilities**
  - Decode tokens
  - Extract tokens from requests
  - Generate verification tokens

**Total: 17 tests** covering security-critical authentication logic

### 2. Currency Tests (`__tests__/lib/currency.test.ts`)
Tests for currency formatting and symbol utilities:

- **Currency Symbols**
  - USD ($), EUR (€), HUF (Ft) mapping

- **Currency Names**
  - Full currency name definitions in Hungarian

- **Format Currency**
  - HUF formatting (no decimals, thousands separator)
  - USD/EUR formatting (2 decimal places)
  - Edge cases (zero, negative, large amounts)

- **Get Currency Symbol**
  - Retrieve symbol for any currency
  - Default to HUF
  - Handle unknown currencies

**Total: 27 tests** covering all currency formatting scenarios

## XML Test Report

Test results are automatically logged to `junit.xml` when using:
```bash
npm run test:xml
```

### XML Report Format
The generated XML file includes:
- **Test Suite Information**: Test file name, timestamp, duration
- **Individual Test Cases**: Each test with its execution time
- **Test Results**: Pass/fail status, error messages (if any)
- **Summary**: Total tests, failures, errors, execution time

### Sample XML Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="jest tests" tests="44" failures="0">
  <testsuite name="Currency Utilities Tests" tests="27" failures="0">
    <testcase name="should have USD symbol" time="0.004"/>
    <testcase name="should have EUR symbol" time="0.001"/>
    ...
  </testsuite>
  <testsuite name="Authentication Tests" tests="17" failures="0">
    <testcase name="should hash a password correctly" time="0.141"/>
    ...
  </testsuite>
</testsuites>
```

## Current Test Coverage

- **Total Tests**: 44
- **Pass Rate**: 100%
- **Modules Tested**:
  - ✅ Authentication (`src/lib/auth.ts`)
  - ✅ Currency utilities (`src/lib/currency.ts`)

## Test Results Dashboard

Last test run summary:
- **Test Suites**: 2 passed, 0 failed
- **Tests**: 44 passed, 0 failed
- **Execution Time**: ~2.5 seconds
- **Report Location**: `junit.xml`

## Configuration

### Jest Configuration (`jest.config.js`)
- Preset: `ts-jest` (for TypeScript support)
- Environment: Node.js
- Test roots: `__tests__` and `src` directories
- Coverage collection: All TypeScript files except CSS modules

### Jest-Junit Configuration
- Output directory: Root directory (`./`)
- Output filename: `junit.xml` (or `test-results.xml` if env variable set)
- Includes: Full test hierarchy, timing information, status details

## Adding New Tests

To add tests for a new module:

1. Create a test file in `__tests__` mirroring the source structure
   ```bash
   __tests__/lib/new-feature.test.ts
   ```

2. Write test cases using Jest syntax:
   ```typescript
   describe('Feature Name', () => {
     test('should do something', () => {
       // Test implementation
       expect(result).toBe(expected);
     });
   });
   ```

3. Run tests to verify:
   ```bash
   npm test
   ```

4. Generate XML report:
   ```bash
   npm run test:xml
   ```

## CI/CD Integration

The XML test report (`junit.xml`) can be integrated with CI/CD systems:

- **GitHub Actions**: Parse `junit.xml` for test results
- **GitLab CI**: Use `reports: junit: junit.xml`
- **Jenkins**: Parse JUnit XML format natively
- **Azure DevOps**: JUnit format support built-in

Example GitHub Actions integration:
```yaml
- name: Run Tests
  run: npm run test:xml

- name: Publish Test Results
  uses: EnricoMi/publish-unit-test-result-action@v2
  with:
    files: junit.xml
```

## Best Practices

1. **Test Names**: Use clear, descriptive names that explain what is being tested
2. **Isolation**: Each test should be independent and not rely on others
3. **Coverage**: Aim for 80%+ coverage of critical paths
4. **Cleanup**: Use `beforeEach` and `afterEach` for setup/teardown
5. **Edge Cases**: Test boundary conditions and error scenarios

## Troubleshooting

### Tests not found
Make sure test files are in `__tests__` directory and named with `.test.ts` or `.spec.ts` extension.

### XML file not generated
Run `npm run test:xml` instead of `npm test`. The XML reporter is only included in the test:xml script.

### Type errors in tests
Ensure `@types/jest` is installed and `tsconfig.json` includes the test directory.

## Related Files

- `jest.config.js` - Jest configuration
- `package.json` - Test scripts and dependencies
- `__tests__/` - All test files
- `junit.xml` - Generated test report
