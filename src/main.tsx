import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import FreelanceServices from './FreelanceServices.tsx'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <FreelanceServices />
  </StrictMode>
)

// Dev: root is empty → createRoot. Prod: root has prerendered HTML → hydrateRoot.
if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
