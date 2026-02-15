/**
 * Server Entry Point - JavaScript loader for TypeScript server
 * This file loads tsx to enable running TypeScript files directly
 */

// Register tsx loader for TypeScript support
require('tsx/cjs');

// Import and run the TypeScript server
require('./server.ts');
