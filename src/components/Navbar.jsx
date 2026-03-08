import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const esActivo = (ruta) => location.pathname === ruta ? 'nav-link activo' : 'nav-link'

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">🍽️ Rescate Sabor</Link>
      <div className="nav-links">
        <Link to="/" className={esActivo('/')}>Inicio</Link>
        <Link to="/favoritos" className={esActivo('/favoritos')}>Favoritos</Link>
        <Link to="/nueva" className={esActivo('/nueva')}>+ Nueva</Link>
        <Link to="/acerca" className={esActivo('/acerca')}>Acerca de</Link>
      </div>
    </nav>
  )
}
