import { Link } from 'react-router-dom';
import logoImg from '../../assets/Logo-Fixentra.png';

// Para cambiar el tamaño del logo, modifica la clase de Tailwind:
// h-6 (24px) | h-8 (32px) | h-10 (40px) | h-12 (48px) | h-16 (64px) | h-20 (80px)
const logoSize = 'h-16';

export function Logo({ to }: { to?: string }) {
  const img = <img src={logoImg} alt="Fixentra" className={`w-auto ${logoSize}`} />;

  return to ? <Link to={to}>{img}</Link> : img;
}
