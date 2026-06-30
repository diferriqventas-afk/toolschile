// prisma/seed.ts
// Run: npx ts-node prisma/seed.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding ToolsChile database...')

  // Admin user
  const adminPassword = await bcrypt.hash('admin123456', 12)
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@toolschile.cl' },
    update: {},
    create: {
      email:    'admin@toolschile.cl',
      name:     'Admin ToolsChile',
      password: adminPassword,
      role:     'ADMIN',
    },
  })
  console.log('✅ Admin user:', admin.email)

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'taladros' },        update: {}, create: { name: 'Taladros',        slug: 'taladros',        icon: '🔧', sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'atornilladores' },  update: {}, create: { name: 'Atornilladores',  slug: 'atornilladores',  icon: '⚙️', sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'esmeriles' },       update: {}, create: { name: 'Esmeriles',       slug: 'esmeriles',       icon: '🔩', sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: 'sierras' },         update: {}, create: { name: 'Sierras',         slug: 'sierras',         icon: '🪚', sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: 'compresores' },     update: {}, create: { name: 'Compresores',     slug: 'compresores',     icon: '💨', sortOrder: 5 } }),
    prisma.category.upsert({ where: { slug: 'manuales' },        update: {}, create: { name: 'Herramientas Manuales', slug: 'manuales',  icon: '🧰', sortOrder: 6 } }),
    prisma.category.upsert({ where: { slug: 'jardineria' },      update: {}, create: { name: 'Jardinería',      slug: 'jardineria',      icon: '🌿', sortOrder: 7 } }),
    prisma.category.upsert({ where: { slug: 'accesorios' },      update: {}, create: { name: 'Accesorios',      slug: 'accesorios',      icon: '📦', sortOrder: 8 } }),
  ])
  console.log('✅ Categories:', categories.length)

  // Brands
  const brands = await Promise.all([
    prisma.brand.upsert({ where: { slug: 'makita' },    update: {}, create: { name: 'Makita',    slug: 'makita',    website: 'https://makita.cl'    } }),
    prisma.brand.upsert({ where: { slug: 'dewalt' },    update: {}, create: { name: 'DeWalt',    slug: 'dewalt',    website: 'https://dewalt.com'    } }),
    prisma.brand.upsert({ where: { slug: 'bosch' },     update: {}, create: { name: 'Bosch',     slug: 'bosch',     website: 'https://bosch.cl'      } }),
    prisma.brand.upsert({ where: { slug: 'milwaukee' }, update: {}, create: { name: 'Milwaukee', slug: 'milwaukee', website: 'https://milwaukeetool.com' } }),
    prisma.brand.upsert({ where: { slug: 'stanley' },   update: {}, create: { name: 'Stanley',   slug: 'stanley',   website: 'https://stanleytools.com' } }),
    prisma.brand.upsert({ where: { slug: 'total' },     update: {}, create: { name: 'Total',     slug: 'total'                                       } }),
  ])
  console.log('✅ Brands:', brands.length)

  const [makita, dewalt, bosch, milwaukee, stanley, total] = brands
  const [taladros, atorni, esmeriles, sierras, compresores, manuales, jardineria, accesorios] = categories

  // Sample products
  const products = [
    {
      sku: 'MK-HP2071F', name: 'Taladro Percutor Makita HP2071F 750W',
      slug: 'taladro-percutor-makita-hp2071f-750w',
      shortDesc: 'Taladro percutor profesional 750W con sistema de doble velocidad y portabrocas metálico.',
      description: 'El HP2071F de Makita es un taladro percutor profesional diseñado para trabajos exigentes en concreto, madera y metal. Con su motor de 750W y sistema de doble velocidad, ofrece el máximo rendimiento para profesionales y aficionados.',
      categoryId: taladros.id, brandId: makita.id, isFeatured: true, isOnOffer: false,
      variants: [{ name: 'Estándar 220V', price: 89990, comparePrice: 119990, stock: 12, isDefault: true, sku: 'MK-HP2071F-220' }],
      specs: [
        { label: 'Potencia', value: '750W', sortOrder: 0 },
        { label: 'Velocidad', value: '0–2.900 rpm', sortOrder: 1 },
        { label: 'Capacidad en concreto', value: '20mm', sortOrder: 2 },
        { label: 'Peso', value: '2.0 kg', sortOrder: 3 },
        { label: 'Voltaje', value: '220V', sortOrder: 4 },
      ],
    },
    {
      sku: 'DW-DCD777', name: 'Atornillador Inalámbrico DeWalt DCD777 20V',
      slug: 'atornillador-inalambrico-dewalt-dcd777-20v',
      shortDesc: 'Atornillador compacto 20V MAX con motor sin escobillas para máxima durabilidad.',
      description: 'El DCD777 de DeWalt combina un diseño compacto con la potencia del sistema 20V MAX. Su motor brushless ofrece hasta 57% más de duración y mayor eficiencia energética.',
      categoryId: atorni.id, brandId: dewalt.id, isFeatured: true, isOnOffer: true,
      variants: [
        { name: 'Solo herramienta', price: 64990, comparePrice: 84990, stock: 8,  isDefault: true,  sku: 'DW-DCD777-TOOL' },
        { name: 'Kit con 2 baterías', price: 94990, comparePrice: 124990, stock: 5, isDefault: false, sku: 'DW-DCD777-KIT' },
      ],
      specs: [
        { label: 'Voltaje', value: '20V MAX', sortOrder: 0 },
        { label: 'Torque máximo', value: '47 Nm', sortOrder: 1 },
        { label: 'Velocidades', value: '2', sortOrder: 2 },
        { label: 'Peso (sin batería)', value: '0.89 kg', sortOrder: 3 },
      ],
    },
    {
      sku: 'BS-GWS850', name: 'Esmeril Angular Bosch GWS 850 4.5"',
      slug: 'esmeril-angular-bosch-gws-850-4-5',
      shortDesc: 'Esmeril angular 850W con disco de 115mm. Ideal para corte y desbaste.',
      description: 'El GWS 850 de Bosch es un esmeril angular compacto y ligero, perfecto para trabajos de corte, desbaste y acabado. Su motor de 850W proporciona alto rendimiento constante.',
      categoryId: esmeriles.id, brandId: bosch.id, isFeatured: true, isOnOffer: false,
      variants: [{ name: 'Disco 4½" (115mm)', price: 49990, comparePrice: 64990, stock: 15, isDefault: true, sku: 'BS-GWS850-115' }],
      specs: [
        { label: 'Potencia', value: '850W', sortOrder: 0 },
        { label: 'Disco', value: '115mm (4½")', sortOrder: 1 },
        { label: 'Velocidad sin carga', value: '11.000 rpm', sortOrder: 2 },
        { label: 'Peso', value: '1.7 kg', sortOrder: 3 },
      ],
    },
    {
      sku: 'MW-M18FCSBL', name: 'Sierra Circular Milwaukee M18 FCSBL 7¼"',
      slug: 'sierra-circular-milwaukee-m18-fcsbl-7',
      shortDesc: 'Sierra circular inalámbrica 18V con motor brushless y disco 7¼".',
      description: 'La M18 FCSBL es la sierra circular más avanzada del sistema M18 de Milwaukee. Su motor POWERSTATE sin escobillas y su tecnología REDLINK PLUS garantizan el máximo rendimiento y protección.',
      categoryId: sierras.id, brandId: milwaukee.id, isFeatured: true, isOnOffer: true,
      variants: [
        { name: 'Solo herramienta', price: 119990, comparePrice: 154990, stock: 5,  isDefault: true,  sku: 'MW-M18FCSBL-TOOL' },
        { name: 'Kit con batería 5Ah', price: 174990, comparePrice: 224990, stock: 3, isDefault: false, sku: 'MW-M18FCSBL-KIT' },
      ],
      specs: [
        { label: 'Voltaje', value: '18V', sortOrder: 0 },
        { label: 'Disco', value: '184mm (7¼")', sortOrder: 1 },
        { label: 'Profundidad de corte 90°', value: '57mm', sortOrder: 2 },
        { label: 'Velocidad sin carga', value: '5.200 rpm', sortOrder: 3 },
      ],
    },
    {
      sku: 'ST-STHT77403', name: 'Set Herramientas Stanley 65 Piezas',
      slug: 'set-herramientas-stanley-65-piezas',
      shortDesc: 'Maletín profesional con 65 herramientas manuales esenciales para el hogar.',
      description: 'El set STHT77403 de Stanley incluye 65 herramientas de alta calidad almacenadas en un maletín resistente con bandeja organizadora. Ideal para el hogar y trabajos de bricolaje.',
      categoryId: manuales.id, brandId: stanley.id, isFeatured: true, isOnOffer: false,
      variants: [{ name: '65 piezas', price: 29990, comparePrice: 39990, stock: 20, isDefault: true, sku: 'ST-STHT77403' }],
      specs: [
        { label: 'Piezas', value: '65', sortOrder: 0 },
        { label: 'Incluye', value: 'Destornilladores, alicates, llaves, martillo', sortOrder: 1 },
        { label: 'Material maletín', value: 'Plástico ABS', sortOrder: 2 },
        { label: 'Garantía', value: 'Vida útil limitada', sortOrder: 3 },
      ],
    },
    {
      sku: 'TT-TCS1240241', name: 'Compresor Total 24L 1.5HP TCS1240241',
      slug: 'compresor-total-24l-1-5hp-tcs1240241',
      shortDesc: 'Compresor de aire 24 litros 1.5HP para herramientas neumáticas y pintura.',
      description: 'Compresor de pistón con depósito de 24 litros, ideal para herramientas neumáticas, inflado de neumáticos y pistola de pintura. Motor de inducción de 1.5HP para uso continuo.',
      categoryId: compresores.id, brandId: total.id, isFeatured: false, isOnOffer: true,
      variants: [{ name: '24L 220V', price: 54990, comparePrice: 72990, stock: 9, isDefault: true, sku: 'TT-TCS1240241-220' }],
      specs: [
        { label: 'Capacidad', value: '24 litros', sortOrder: 0 },
        { label: 'Potencia', value: '1.5HP (1.1kW)', sortOrder: 1 },
        { label: 'Presión máxima', value: '8 bar (116 PSI)', sortOrder: 2 },
        { label: 'Caudal libre', value: '185 L/min', sortOrder: 3 },
        { label: 'Voltaje', value: '220V', sortOrder: 4 },
      ],
    },
    {
      sku: 'MK-DUH523Z', name: 'Tijera de Jardín Inalámbrica Makita DUH523Z 36V',
      slug: 'tijera-jardin-inalambrica-makita-duh523z-36v',
      shortDesc: 'Tijera podadora inalámbrica 36V (2×18V) para setos y arbustos.',
      description: 'La DUH523Z de Makita es una tijera podadora inalámbrica que combina dos baterías de 18V para ofrecer la potencia de 36V. Ideal para corte de setos, arbustos y bordes del jardín.',
      categoryId: jardineria.id, brandId: makita.id, isFeatured: false, isOnOffer: true,
      variants: [
        { name: 'Solo herramienta', price: 64990, comparePrice: 84990, stock: 7, isDefault: true,  sku: 'MK-DUH523Z-TOOL' },
      ],
      specs: [
        { label: 'Voltaje', value: '36V (2×18V)', sortOrder: 0 },
        { label: 'Longitud de cuchilla', value: '520mm', sortOrder: 1 },
        { label: 'Capacidad de corte', value: '15mm', sortOrder: 2 },
        { label: 'Peso (sin baterías)', value: '2.6 kg', sortOrder: 3 },
      ],
    },
    {
      sku: 'BS-GLL380', name: 'Nivel Láser Bosch GLL 3-80 3 Líneas',
      slug: 'nivel-laser-bosch-gll-3-80-3-lineas',
      shortDesc: 'Nivel láser de 3 líneas 360° con soporte y estuche. Alcance 30m.',
      description: 'El GLL 3-80 de Bosch proyecta 3 líneas láser a 360° para nivelación precisa en trabajos de construcción, instalación y carpintería. Incluye soporte de suelo y maletín.',
      categoryId: accesorios.id, brandId: bosch.id, isFeatured: true, isOnOffer: false,
      variants: [{ name: 'Kit con soporte', price: 44990, comparePrice: 59990, stock: 11, isDefault: true, sku: 'BS-GLL380-KIT' }],
      specs: [
        { label: 'Alcance', value: '30m', sortOrder: 0 },
        { label: 'Líneas', value: '3 (360°)', sortOrder: 1 },
        { label: 'Precisión', value: '±0.3mm/m', sortOrder: 2 },
        { label: 'Batería', value: 'AA ×4', sortOrder: 3 },
      ],
    },
  ]

  for (const p of products) {
    const { variants, specs, ...productData } = p
    try {
      await prisma.product.upsert({
        where:  { slug: productData.slug },
        update: {},
        create: {
          ...productData,
          variants: { create: variants },
          specs:    { create: specs },
        },
      })
    } catch (e) {
      console.warn(`Skipping ${productData.sku}:`, e)
    }
  }
  console.log('✅ Products seeded:', products.length)

  // Sample coupon
  await prisma.coupon.upsert({
    where:  { code: 'BIENVENIDO10' },
    update: {},
    create: {
      code:     'BIENVENIDO10',
      type:     'PERCENTAGE',
      value:    10,
      minOrder: 20000,
      maxUses:  500,
      isActive: true,
    },
  })
  await prisma.coupon.upsert({
    where:  { code: 'DESCUENTO5000' },
    update: {},
    create: {
      code:     'DESCUENTO5000',
      type:     'FIXED',
      value:    5000,
      minOrder: 30000,
      maxUses:  200,
      isActive: true,
    },
  })
  console.log('✅ Coupons seeded')

  console.log('\n🎉 Seed complete!')
  console.log('─────────────────────────────')
  console.log('Admin email:    admin@toolschile.cl')
  console.log('Admin password: admin123456')
  console.log('Coupon 1:       BIENVENIDO10 (10% off, mín $20.000)')
  console.log('Coupon 2:       DESCUENTO5000 ($5.000 off, mín $30.000)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
