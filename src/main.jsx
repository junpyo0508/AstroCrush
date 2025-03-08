import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Starfield from './Starfield.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Starfield />
  </StrictMode>,
)
