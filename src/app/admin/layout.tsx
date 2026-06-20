import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Tag, Image, BarChart2, Settings, ChevronRight,
} from 'lucide-react'

const ADMIN_NAV = [
  { label: 'Dashboard',   href: '/admin',             icon: LayoutDashboard },
  { label: 'Productos',   href: '/admin/products',    icon: Package },
  { label: 'Pedidos',     href: '/admin/orders',      icon: ShoppingBag },
  { label: 'Clientes',    href: '/admin/customers',   icon: Users },
  { label: 'Cupones',     href: '/admin/coupons',     icon: Tag },
  { label: 'Banners',     href: '/admin/banners',     icon: Image },
  { label: 'Reportes',    href: '/admin/reports',     icon: BarChart2 },
  { label: 'Configuración', href: '/admin/settings',  icon: Settings },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/')

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="font-display text-lg font-bold text-brand-blue">
            Tools<span className="text-brand-orange">Chile</span>
          </Link>
          <p className="text-gray-400 text-xs mt-0.5">Panel de Administración</p>
        </div>

        <nav className="flex-1 py-4 px-3">
          {ADMIN_NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-brand-blue hover:text-white text-sm font-medium transition-all group mb-0.5"
            >
              <Icon size={17} />
              {label}
              <ChevronRight size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition" />
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold">
              A
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Admin</p>
              <p className="text-xs text-gray-400">admin@toolschile.cl</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
