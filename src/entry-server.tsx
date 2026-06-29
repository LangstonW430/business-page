import { renderToString } from 'react-dom/server';
import { StrictMode } from 'react';
import { StaticRouter, Routes, Route } from 'react-router-dom';
import FreelanceServices from './FreelanceServices.tsx';
import Portfolio from './Portfolio.tsx';

export function render(url = '/'): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <Routes>
          <Route path="/" element={<FreelanceServices />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </StaticRouter>
    </StrictMode>
  );
}
