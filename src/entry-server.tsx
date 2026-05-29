import { renderToString } from 'react-dom/server';
import { StrictMode } from 'react';
import FreelanceServices from './FreelanceServices.tsx';

export function render(): string {
  return renderToString(
    <StrictMode>
      <FreelanceServices />
    </StrictMode>
  );
}
