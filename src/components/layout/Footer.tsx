import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-brand-blue-dark text-white/70">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-xl font-bold text-white mb-3">
              Tools<span className="text-brand-orange">Chile</span>
            </div>
            <p className="text-sm leading-relaxed mb-4 text-white/60">
              Herramientas que construyen tus proyectos. Distribuidores oficiales Makita, DeWalt, Bosch y más en Chile.
            </p>
            <div className="flex gap-3">
              {[
                { href: 'https://wa.me/56912345678', label: 'WhatsApp', icon: '💬' },
                { href: '#', label: 'Instagram',     icon: '📸' },
                { href: '#', label: 'Facebook',      icon: '📘' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-brand-orange transition text-base"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              {['Sobre Nosotros', 'Blog', 'Trabaja con Nosotros', 'Prensa'].map((l) => (
                <li key={l}><Link href="#" className="hover:text-white transition">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Ayuda</h4>
            <ul className="space-y-2 text-sm">
              {['Seguimiento de Pedidos', 'Devoluciones', 'Garantía', 'Preguntas Frecuentes'].map((l) => (
                <li key={l}><Link href="#" className="hover:text-white transition">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              {['Política de Privacidad', 'Términos y Condiciones', 'Política de Cookies'].map((l) => (
                <li key={l}><Link href="#" className="hover:text-white transition">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="tel:+56912345678" className="hover:text-white transition">+56 9 1234 5678</a></li>
              <li><a href="mailto:ventas@toolschile.cl" className="hover:text-white transition">ventas@toolschile.cl</a></li>
              <li className="text-white/50">Lun–Vie 9:00–18:00 hrs</li>
              <li><a href="https://wa.me/56912345678" className="hover:text-green-400 transition text-green-500 font-medium">WhatsApp →</a></li>
            </ul>
          </div>
        </div>

        {/* Payment methods */}
        <div className="border-t border-white/10 pt-8 mb-6">
          <p className="text-xs text-white/40 mb-3">Métodos de pago aceptados</p>
          <div className="flex gap-3 flex-wrap">
            {['Webpay Plus', 'Mercado Pago', 'Transferencia Bancaria'].map((m) => (
              <span key={m} className="px-3 py-1 bg-white/10 rounded text-xs text-white/60">{m}</span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>© {new Date().getFullYear()} ToolsChile. Todos los derechos reservados.</span>
          <span>Hecho con ❤️ en Chile 🇨🇱</span>
        </div>
      </div>
    </footer>
  )
}
