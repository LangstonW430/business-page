import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FreelanceServices from './FreelanceServices.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FreelanceServices />
  </StrictMode>,
)
