// vitest.setup.ts
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extindem funcția expect din Vitest cu matchers de la jest-dom
expect.extend(matchers);

// Curățăm DOM-ul după fiecare test (pentru a nu se influența între ele)
afterEach(() => {
  cleanup();
});