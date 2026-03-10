import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://giovanadiasjewelry.com.br')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/checkout/',
          '/minha-conta/',
          '/carrinho/',
          '/reembolso/',
          '/pedido/',
          '/embed/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
