export type Locale = 'pt' | 'en' | 'es'
export const defaultLocale: Locale = 'pt'

export const dictionaries = {
    pt: {
        store: {
            search: 'Buscar...',
            cart: 'Carrinho',
            emptyCart: 'Seu carrinho está vazio',
            continueShopping: 'Continuar Comprando',
            checkout: 'Finalizar Compra',
            loginHeader: 'Entrar',
            categoryAll: 'Todas as categorias',
            searchBtn: 'Buscar',
            noProducts: 'Nenhum produto encontrado.',
            homeParams: {
                popular: 'Populares',
                newest: 'Lançamentos'
            }
        },
        product: {
            buy: 'Comprar Agora',
            addToCart: 'Adicionar ao Carrinho',
            description: 'Descrição do Produto',
            outOfStock: 'Fora de Estoque'
        },
        auth: {
            loginTitle: 'Bem-vindo de volta',
            registerTitle: 'Criar uma conta',
            email: 'E-mail',
            password: 'Senha',
            name: 'Nome Completo',
            loginBtn: 'Entrar',
            registerBtn: 'Criar Conta',
            noAccount: 'Não tem uma conta?',
            hasAccount: 'Já tem uma conta?',
            createOne: 'Crie uma',
            loginHere: 'Entre aqui'
        },
        cart: {
            title: 'Seu Carrinho',
            empty: 'Seu carrinho está vazio',
            subtotal: 'Subtotal',
            checkoutBtn: 'Finalizar Compra',
            continueShopping: 'Continuar Comprando',
            remove: 'Remover'
        },
        profile: {
            statusPending: 'Aguardando',
            statusPaid: 'Pago',
            statusCancelled: 'Cancelado',
            statusRefunded: 'Reembolsado',
            title: 'Meu Perfil',
            personalData: 'Dados Pessoais',
            name: 'Nome completo',
            phone: 'Telefone',
            addressTitle: 'Endereço',
            zipCode: 'CEP',
            street: 'Rua',
            number: 'Nº',
            complement: 'Complemento',
            neighborhood: 'Bairro',
            city: 'Cidade',
            state: 'UF',
            saveBtn: 'Salvar Alterações',
            ordersTab: 'Pedidos',
            emptyOrders: 'Você ainda não fez nenhum pedido.',
            exploreBtn: 'Explorar Produtos',
            orderId: 'Pedido',
            qtd: 'Qtd',
            detailsBtn: 'Ver detalhes',
            pwdTab: 'Alterar Senha',
            currentPwd: 'Senha atual',
            newPwd: 'Nova senha',
            confirmPwd: 'Confirmar nova senha',
            savePwdBtn: 'Alterar Senha',
            logout: 'Sair'
        },
        order: {
            confirmed: 'Pedido Confirmado!',
            thanks: 'Obrigado',
            received: 'foi recebido.',
            items: 'Itens do Pedido',
            shipping: 'Frete',
            total: 'Total',
            shippingAddress: 'Endereço de Entrega',
            yourOrder: 'Seu pedido'
        },
        checkout: {
            title: 'Finalizar Compra',
            shipping: 'Entrega',
            cepPlaceholder: 'CEP',
            calculateShipping: 'Calcular',
            address: 'Endereço',
            number: 'Número',
            complement: 'Complemento',
            neighborhood: 'Bairro',
            city: 'Cidade',
            state: 'Estado',
            payment: 'Pagamento',
            creditCard: 'Cartão de Crédito',
            pix: 'PIX',
            payBtn: 'Pagar',
            orderSummary: 'Resumo do Pedido'
        },
        footer: {
            rights: 'Todos os direitos reservados.',
            payments: 'Pagamentos processados de forma segura.'
        },
        settings: {
            language: 'Idioma',
            theme: 'Tema'
        }
    },
    en: {
        store: {
            search: 'Search...',
            cart: 'Cart',
            emptyCart: 'Your cart is empty',
            continueShopping: 'Continue Shopping',
            checkout: 'Checkout',
            loginHeader: 'Sign In',
            categoryAll: 'All categories',
            searchBtn: 'Search',
            noProducts: 'No products found.',
            homeParams: {
                popular: 'Popular',
                newest: 'New Arrivals'
            }
        },
        product: {
            buy: 'Buy Now',
            addToCart: 'Add to Cart',
            description: 'Product Description',
            outOfStock: 'Out of Stock'
        },
        auth: {
            loginTitle: 'Welcome back',
            registerTitle: 'Create an account',
            email: 'Email',
            password: 'Password',
            name: 'Full Name',
            loginBtn: 'Sign In',
            registerBtn: 'Create Account',
            noAccount: 'Don\'t have an account?',
            hasAccount: 'Already have an account?',
            createOne: 'Create one',
            loginHere: 'Sign in here'
        },
        cart: {
            title: 'Your Cart',
            empty: 'Your cart is empty',
            subtotal: 'Subtotal',
            checkoutBtn: 'Checkout',
            continueShopping: 'Continue Shopping',
            remove: 'Remove'
        },
        profile: {
            statusPending: 'Pending',
            statusPaid: 'Paid',
            statusCancelled: 'Cancelled',
            statusRefunded: 'Refunded',
            title: 'My Profile',
            personalData: 'Personal Data',
            name: 'Full Name',
            phone: 'Phone',
            addressTitle: 'Address',
            zipCode: 'ZIP Code',
            street: 'Street',
            number: 'Number',
            complement: 'Complement',
            neighborhood: 'Neighborhood',
            city: 'City',
            state: 'State',
            saveBtn: 'Save Changes',
            ordersTab: 'Orders',
            emptyOrders: 'You have not placed any orders yet.',
            exploreBtn: 'Explore Products',
            orderId: 'Order',
            qtd: 'Qty',
            detailsBtn: 'View details',
            pwdTab: 'Change Password',
            currentPwd: 'Current password',
            newPwd: 'New password',
            confirmPwd: 'Confirm new password',
            savePwdBtn: 'Change Password',
            logout: 'Logout'
        },
        order: {
            confirmed: 'Order Confirmed!',
            thanks: 'Thank you',
            received: 'has been received.',
            items: 'Order Items',
            shipping: 'Shipping',
            total: 'Total',
            shippingAddress: 'Shipping Address',
            yourOrder: 'Your order'
        },
        checkout: {
            title: 'Checkout',
            shipping: 'Shipping',
            cepPlaceholder: 'ZIP Code',
            calculateShipping: 'Calculate',
            address: 'Address',
            number: 'Number',
            complement: 'Apartment, suite, etc.',
            neighborhood: 'Neighborhood',
            city: 'City',
            state: 'State',
            payment: 'Payment',
            creditCard: 'Credit Card',
            pix: 'PIX (Brazil Only)',
            payBtn: 'Pay Now',
            orderSummary: 'Order Summary'
        },
        footer: {
            rights: 'All rights reserved.',
            payments: 'Payments processed securely.'
        },
        settings: {
            language: 'Language',
            theme: 'Theme'
        }
    },
    es: {
        store: {
            search: 'Buscar...',
            cart: 'Carrito',
            emptyCart: 'Tu carrito está vacío',
            continueShopping: 'Seguir Comprando',
            checkout: 'Finalizar Compra',
            loginHeader: 'Entrar',
            categoryAll: 'Todas las categorías',
            searchBtn: 'Buscar',
            noProducts: 'Ningún producto encontrado.',
            homeParams: {
                popular: 'Populares',
                newest: 'Novedades'
            }
        },
        product: {
            buy: 'Comprar Ahora',
            addToCart: 'Añadir al Carrito',
            description: 'Descripción del Producto',
            outOfStock: 'Agotado'
        },
        auth: {
            loginTitle: 'Bienvenido de nuevo',
            registerTitle: 'Crear una cuenta',
            email: 'Correo electrónico',
            password: 'Contraseña',
            name: 'Nombre Completo',
            loginBtn: 'Entrar',
            registerBtn: 'Crear Cuenta',
            noAccount: '¿No tienes cuenta?',
            hasAccount: '¿Ya tienes cuenta?',
            createOne: 'Crea una',
            loginHere: 'Entra aquí'
        },
        cart: {
            title: 'Tu Carrito',
            empty: 'Tu carrito está vacío',
            subtotal: 'Subtotal',
            checkoutBtn: 'Finalizar Compra',
            continueShopping: 'Seguir Comprando',
            remove: 'Eliminar'
        },
        profile: {
            statusPending: 'Pendiente',
            statusPaid: 'Pagado',
            statusCancelled: 'Cancelado',
            statusRefunded: 'Reembolsado',
            title: 'Mi Perfil',
            personalData: 'Datos Personales',
            name: 'Nombre completo',
            phone: 'Teléfono',
            addressTitle: 'Dirección',
            zipCode: 'Código Postal',
            street: 'Calle',
            number: 'Número',
            complement: 'Complemento',
            neighborhood: 'Barrio',
            city: 'Ciudad',
            state: 'Estado',
            saveBtn: 'Guardar Cambios',
            ordersTab: 'Pedidos',
            emptyOrders: 'Aún no has realizado ningún pedido.',
            exploreBtn: 'Explorar Productos',
            orderId: 'Pedido',
            qtd: 'Cant',
            detailsBtn: 'Ver detalles',
            pwdTab: 'Cambiar Contraseña',
            currentPwd: 'Contraseña actual',
            newPwd: 'Nueva contraseña',
            confirmPwd: 'Confirmar nueva contraseña',
            savePwdBtn: 'Cambiar Contraseña',
            logout: 'Salir'
        },
        order: {
            confirmed: '¡Pedido Confirmado!',
            thanks: 'Gracias',
            received: 'ha sido recibido.',
            items: 'Artículos del Pedido',
            shipping: 'Envío',
            total: 'Total',
            shippingAddress: 'Dirección de Envío',
            yourOrder: 'Su pedido'
        },
        checkout: {
            title: 'Finalizar Compra',
            shipping: 'Envío',
            cepPlaceholder: 'Código Postal',
            calculateShipping: 'Calcular',
            address: 'Dirección',
            number: 'Número',
            complement: 'Piso, puerta, etc.',
            neighborhood: 'Barrio',
            city: 'Ciudad',
            state: 'Estado',
            payment: 'Pago',
            creditCard: 'Tarjeta de Crédito',
            pix: 'PIX (Solo Brasil)',
            payBtn: 'Pagar',
            orderSummary: 'Resumen del Pedido'
        },
        footer: {
            rights: 'Todos los derechos reservados.',
            payments: 'Pagos procesados de forma segura.'
        },
        settings: {
            language: 'Idioma',
            theme: 'Tema'
        }
    }
}

export const dbTranslations: Record<Locale, Record<string, string>> = {
    pt: {},
    en: {
        'Coleções Essenciais Primavera': 'Spring Essential Collections',
        'Silhuetas atemporais e tecidos refinados para o seu dia a dia.': 'Timeless silhouettes and refined fabrics for your everyday life.',
        'Camiseta Básica Premium': 'Premium Basic T-Shirt',
        'Camiseta básica de algodão 100% com caimento perfeito. Disponível em P, M, G e GG. O essencial do seu guarda-roupa com conforto e durabilidade.': '100% cotton basic t-shirt with a perfect fit. Available in S, M, L, and XL. Your wardrobe essential with comfort and durability.',
        'Camiseta Urban Graphic': 'Urban Graphic T-Shirt',
        'Camiseta streetwear com estampa exclusiva Urban. Tecido premium, caimento oversized. Perfeita para o look do dia a dia com atitude.': 'Streetwear t-shirt with exclusive Urban print. Premium fabric, oversized fit. Perfect for an everyday look with attitude.',
        'Calça Jeans Slim Dark': 'Dark Slim Fit Jeans',
        'Calça jeans slim fit em lavagem escura. Corte moderno e confortável, ideal para looks casuais ou semi-formais. Tecido com elastano para maior mobilidade.': 'Slim fit jeans in dark wash. Modern and comfortable cut, ideal for casual or semi-formal looks. Fabric with elastane for greater mobility.',
        'Calça Cargo Street': 'Street Cargo Pants',
        'Calça cargo utilitária em verde musgo com múltiplos bolsos. O item mais versátil do streetwear moderno. Conforto e estilo em uma peça só.': 'Utility cargo pants in moss green with multiple pockets. The most versatile item in modern streetwear. Comfort and style in one piece.',
        'Vestido Floral Verão': 'Summer Floral Dress',
        'Vestido midi floral em tecido leve e fluido, perfeito para dias quentes. Estampa exclusiva com flores delicadas em tons pastéis. Do P ao GG.': 'Floral midi dress in light and fluid fabric, perfect for hot days. Exclusive print with delicate pastel flowers. From S to XL.',
        'Vestido Midi Elegance': 'Midi Elegance Dress',
        'Vestido midi elegante em bordeaux com silhueta sofisticada. Ideal para ocasiões especiais, jantares e eventos. Tecido de alta qualidade com caimento impecável.': 'Elegant bordeaux midi dress with a sophisticated silhouette. Ideal for special occasions, dinners and events. High quality fabric with an impeccable fit.',
        'Jaqueta Bomber Classic': 'Classic Bomber Jacket',
        'Jaqueta bomber preta clássica em nylon resistente com forro interno. O ícone do streetwear que nunca sai de moda. Elástico nas mangas e cintura.': 'Classic black bomber jacket in resistant nylon with inner lining. The streetwear icon that never goes out of style. Elastic on sleeves and waist.',
        'Casaco Oversize Bege': 'Beige Oversize Coat',
        'Casaco oversized em lã bege com corte estruturado. Peça-chave para o inverno com estilo minimalista. Bolsos laterais e forro interno.': 'Oversized beige wool coat with a structured cut. A key piece for winter with a minimalist style. Side pockets and inner lining.',
        'Óculos Retrô Vintage': 'Vintage Retro Glasses',
        'Óculos de sol estilo retrô com armação redonda em dourado e lentes espelhadas. Proteção UV400. O toque final para qualquer look com personalidade.': 'Retro style sunglasses with round gold frame and mirrored lenses. UV400 protection. The finishing touch for any look with personality.',
        'Bolsa Mini Crossbody': 'Mini Crossbody Bag',
        'Mini bolsa crossbody em couro legítimo caramelo. Alça ajustável, fecho magnético e dois compartimentos internos. Compacta e funcional para o dia a dia.': 'Mini crossbody bag in genuine caramel leather. Adjustable strap, magnetic clasp and two internal compartments. Compact and functional for everyday use.',
        'Camisetas': 'T-Shirts',
        'Calças': 'Pants',
        'Vestidos': 'Dresses',
        'Casacos e Jaquetas': 'Coats & Jackets',
        'Acessórios': 'Accessories',
    },
    es: {
        'Coleções Essenciais Primavera': 'Colecciones Esenciales de Primavera',
        'Silhuetas atemporais e tecidos refinados para o seu dia a dia.': 'Siluetas atemporales y telas refinadas para tu día a día.',
        'Camiseta Básica Premium': 'Camiseta Básica Premium',
        'Camiseta básica de algodão 100% com caimento perfeito. Disponível em P, M, G e GG. O essencial do seu guarda-roupa com conforto e durabilidade.': 'Camiseta básica 100% algodón con ajuste perfecto. Disponible en S, M, L y XL. El esencial de tu armario con comodidad y durabilidad.',
        'Camiseta Urban Graphic': 'Camiseta Urban Graphic',
        'Camiseta streetwear com estampa exclusiva Urban. Tecido premium, caimento oversized. Perfeita para o look do dia a dia com atitude.': 'Camiseta streetwear con estampado exclusivo Urban. Tejido premium, ajuste oversized. Perfecta para el look del día a día con actitud.',
        'Calça Jeans Slim Dark': 'Vaqueros Slim Dark',
        'Calça jeans slim fit em lavagem escura. Corte moderno e confortável, ideal para looks casuais ou semi-formais. Tecido com elastano para maior mobilidade.': 'Vaqueros slim fit en lavado oscuro. Corte moderno y cómodo, ideal para looks casuales o semi-formales. Tejido con elastano para mayor movilidad.',
        'Calça Cargo Street': 'Pantalón Cargo Street',
        'Calça cargo utilitária em verde musgo com múltiplos bolsos. O item mais versátil do streetwear moderno. Conforto e estilo em uma peça só.': 'Pantalón cargo utilitario en verde musgo con múltiples bolsillos. La prenda más versátil del streetwear moderno. Comodidad y estilo en una sola pieza.',
        'Vestido Floral Verão': 'Vestido Floral de Verano',
        'Vestido midi floral em tecido leve e fluido, perfeito para dias quentes. Estampa exclusiva com flores delicadas em tons pastéis. Do P ao GG.': 'Vestido midi floral en tejido ligero y fluido, perfecto para días calurosos. Estampado exclusivo con delicadas flores en tonos pastel. Desde la S hasta la XL.',
        'Vestido Midi Elegance': 'Vestido Midi Elegance',
        'Vestido midi elegante em bordeaux com silhueta sofisticada. Ideal para ocasiões especiais, jantares e eventos. Tecido de alta qualidade com caimento impecável.': 'Elegante vestido midi burdeos con silueta sofisticada. Ideal para ocasiones especiales, cenas y eventos. Tejido de alta calidad con caída impecable.',
        'Jaqueta Bomber Classic': 'Chaqueta Bomber Clásica',
        'Jaqueta bomber preta clássica em nylon resistente com forro interno. O ícone do streetwear que nunca sai de moda. Elástico nas mangas e cintura.': 'Clásica chaqueta bomber negra en nylon resistente con forro interior. El icono del streetwear que nunca pasa de moda. Elástico en mangas y cintura.',
        'Casaco Oversize Bege': 'Abrigo Oversize Beige',
        'Casaco oversized em lã bege com corte estruturado. Peça-chave para o inverno com estilo minimalista. Bolsos laterais e forro interno.': 'Abrigo oversize de lana beige con corte estructurado. Prenda clave para el invierno con estilo minimalista. Bolsillos laterales y forro interior.',
        'Óculos Retrô Vintage': 'Gafas Retro Vintage',
        'Óculos de sol estilo retrô com armação redonda em dourado e lentes espelhadas. Proteção UV400. O toque final para qualquer look com personalidade.': 'Gafas de sol de estilo retro con montura dorada redonda y lentes espejadas. Protección UV400. El toque final para cualquier look con personalidad.',
        'Bolsa Mini Crossbody': 'Bolso Mini Crossbody',
        'Mini bolsa crossbody em couro legítimo caramelo. Alça ajustável, fecho magnético e dois compartimentos internos. Compacta e funcional para o dia a dia.': 'Minibolso bandolera en auténtica piel caramelo. Correa ajustable, cierre magnético y dos compartimentos internos. Compacto y funcional para el día a día.',
        'Camisetas': 'Camisetas',
        'Calças': 'Pantalones',
        'Vestidos': 'Vestidos',
        'Casacos e Jaquetas': 'Abrigos y Chaquetas',
        'Acessórios': 'Accesorios',
    }
}

export function translateDb(text: string | null | undefined, locale: Locale): string {
    if (!text) return ''
    if (locale === 'pt') return text
    return dbTranslations[locale]?.[text] || text
}

export type Dictionary = typeof dictionaries.pt
