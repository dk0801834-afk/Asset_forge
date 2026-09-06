import logging
from decimal import Decimal
from sqlalchemy.orm import Session

from ..core.security import hash_password
from ..models.user import User, UserRole
from ..models.tenant import Tenant
from ..models.category import Category
from ..models.bundle import Bundle
from ..models.order import Order, OrderStatus

logger = logging.getLogger(__name__)


BUNDLES_DATA = [
    {
        "category_slug": "3d-icons",
        "name": "100 Minimalist 3D App Icons",
        "slug": "100-minimalist-3d-app-icons",
        "tagline": "Clean, modern 3D icon pack for apps, websites, and presentations",
        "description": "A premium collection of 100 hand-crafted minimalist 3D icons rendered in 4K resolution. Perfect for mobile apps, SaaS dashboards, landing pages, and pitch decks. Each icon comes in multiple angles and color variations.",
        "long_description": """
# 100 Minimalist 3D App Icons

Elevate your product design with this meticulously crafted collection of 100 minimalist 3D icons. Each icon is rendered at 4K resolution with soft lighting and clean geometry that fits perfectly into modern design systems.

## What's Included
- **100 unique 3D icons** in multiple categories (arrows, actions, media, social, commerce)
- **4K resolution (2048×2048)** transparent PNGs
- **Blender source files** (.blend) for full customization
- **Figma-ready exports** optimized for direct import
- **3 color variations** per icon (clay, glass, glossy)
- **3 camera angles** (front, perspective, top-down)
- Regular updates with new icons added monthly

## Perfect For
- Mobile app interfaces
- SaaS dashboards and web apps
- Landing pages and marketing sites
- Pitch decks and presentations
- Social media graphics

## License
Standard B2B commercial license included with purchase. Use in unlimited client projects.
        """.strip(),
        "price": Decimal("49.00"),
        "compare_at_price": Decimal("99.00"),
        "thumbnail_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop",
        "preview_images": [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&h=800&fit=crop",
        ],
        "asset_count": 100,
        "file_formats": ["PNG", "BLEND", "GLB", "FIG"],
        "file_size_mb": Decimal("1200"),
        "tags": ["3d", "icons", "minimalist", "ui", "app", "modern", "clay"],
        "features": [
            "100 unique 3D icons",
            "4K resolution PNGs with transparency",
            "Blender source files included",
            "3 color variations per icon",
            "3 camera angles",
            "Lifetime updates",
            "Commercial B2B license",
        ],
        "is_featured": True,
    },
    {
        "category_slug": "textures",
        "name": "50 Sci-Fi Metal Textures",
        "slug": "50-sci-fi-metal-textures",
        "tagline": "PBR-ready scratched metal, brushed steel, and futuristic panels",
        "description": "50 high-resolution sci-fi metal textures perfect for game environments, 3D rendering, product visualization, and concept art. Each texture includes full PBR maps (albedo, normal, roughness, metallic, AO) at 4K resolution.",
        "long_description": """
# 50 Sci-Fi Metal Textures

Professional-grade PBR texture pack designed for sci-fi environments, spacecraft interiors, cyberpunk scenes, and futuristic product renders.

## What's Included
- **50 seamless metal textures** in various styles
- **4K resolution (4096×4096)** 16-bit TIFF/PNG
- **Full PBR maps**: Albedo, Normal, Roughness, Metallic, AO, Height
- **Tileable/seamless** for infinite surfaces
- Bonus: 10 decal overlays for wear and tear

## Styles Included
- Brushed titanium panels
- Scratched spacecraft hulls
- Diamond plate flooring
- Futuristic carbon fiber
- Cyberpunk neon-lit grime
- Anodized colored metals
- Worn industrial plating
- Hexagonal mesh patterns

## Compatible With
All major 3D software: Blender, Maya, 3ds Max, Cinema 4D, Unreal Engine, Unity, Substance Painter.
        """.strip(),
        "price": Decimal("79.00"),
        "compare_at_price": Decimal("149.00"),
        "thumbnail_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
        "preview_images": [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&h=800&fit=crop",
        ],
        "asset_count": 300,
        "file_formats": ["PNG", "TIFF", "EXR", "SBSAR"],
        "file_size_mb": Decimal("3500"),
        "tags": ["textures", "metal", "sci-fi", "pbr", "game-development", "4k", "seamless"],
        "features": [
            "50 unique seamless textures",
            "4K 16-bit resolution",
            "Full PBR map sets (6 maps each)",
            "Works with all major 3D software",
            "Bonus decal overlays",
            "Commercial B2B license",
        ],
        "is_featured": True,
    },
    {
        "category_slug": "illustrations",
        "name": "200 Isometric Business Illustrations",
        "slug": "200-isometric-business-illustrations",
        "tagline": "Flat-style isometric illustrations for SaaS, fintech, and B2B marketing",
        "description": "A vast library of 200 professionally designed isometric illustrations covering business, technology, finance, teamwork, and productivity. Fully editable vectors ready for web and print.",
        "long_description": """
# 200 Isometric Business Illustrations

Comprehensive isometric illustration library for B2B companies. Create stunning landing pages, onboarding flows, presentations, and marketing materials in minutes.

## What's Included
- **200 isometric illustrations** across 10 categories
- **Fully editable vector files** (SVG, AI, EPS, FIG)
- **Organized layers** for easy customization
- **Pre-made scenes** you can combine
- Consistent style and color palette
- Dark mode variants for 50 key illustrations
        """.strip(),
        "price": Decimal("59.00"),
        "compare_at_price": Decimal("129.00"),
        "thumbnail_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        "preview_images": [
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=800&fit=crop",
        ],
        "asset_count": 200,
        "file_formats": ["SVG", "AI", "EPS", "FIG", "PNG"],
        "file_size_mb": Decimal("450"),
        "tags": ["illustration", "isometric", "business", "saas", "vector", "marketing"],
        "features": [
            "200 unique illustrations",
            "10 themed categories",
            "Fully editable vectors",
            "Dark mode variants included",
            "Figma-ready components",
            "Lifetime updates",
            "Commercial license",
        ],
        "is_featured": True,
    },
    {
        "category_slug": "ui-kits",
        "name": "Enterprise Dashboard UI Kit",
        "slug": "enterprise-dashboard-ui-kit",
        "tagline": "500+ components for building complex B2B admin interfaces",
        "description": "The ultimate dashboard UI kit for designing complex enterprise applications, admin panels, analytics platforms, and SaaS tools. Built with atomic design principles and ready for production.",
        "long_description": """
# Enterprise Dashboard UI Kit

Design production-ready B2B dashboards in record time. 500+ meticulously crafted components following atomic design principles, with full auto-layout, variants, and dark mode support.

## What's Included
- **500+ UI components** organized in atomic design system
- **50+ dashboard templates** (analytics, CRM, project management)
- **100+ charts & data visualization** components
- **Dark & light mode** for every component
- **Auto-layout 4.0** ready in Figma
- **Design tokens** exported for code integration
- Bonus: React/Tailwind starter templates
        """.strip(),
        "price": Decimal("129.00"),
        "compare_at_price": Decimal("249.00"),
        "thumbnail_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        "preview_images": [
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop",
        ],
        "asset_count": 550,
        "file_formats": ["FIG", "SKETCH", "XD", "JSON"],
        "file_size_mb": Decimal("280"),
        "tags": ["ui-kit", "dashboard", "enterprise", "figma", "admin", "saas", "design-system"],
        "features": [
            "500+ components",
            "50+ full dashboard templates",
            "Dark & light mode",
            "Auto-layout 4.0",
            "React/Tailwind code snippets",
            "Design tokens included",
        ],
        "is_featured": True,
    },
    {
        "category_slug": "typography",
        "name": "30 Premium Display Fonts Collection",
        "slug": "30-premium-display-fonts",
        "tagline": "Headline, branding, and decorative fonts for standout design",
        "description": "Curated collection of 30 premium display typefaces from award-winning type foundries. Perfect for branding, headlines, posters, and hero sections that demand attention.",
        "price": Decimal("89.00"),
        "compare_at_price": Decimal("299.00"),
        "thumbnail_url": "https://images.unsplash.com/photo-1467951591042-f388365db261?w=800&h=600&fit=crop",
        "preview_images": [
            "https://images.unsplash.com/photo-1467951591042-f388365db261?w=1200&h=800&fit=crop",
        ],
        "asset_count": 30,
        "file_formats": ["OTF", "TTF", "WOFF", "WOFF2"],
        "file_size_mb": Decimal("120"),
        "tags": ["fonts", "typography", "branding", "display", "typeface"],
        "features": [
            "30 premium display fonts",
            "Web font formats included (WOFF2)",
            "Desktop & web license",
            "Multiple weights per family",
            "Multilingual support",
        ],
        "is_featured": False,
    },
    {
        "category_slug": "photography",
        "name": "250 B2B Stock Photography Pack",
        "slug": "250-b2b-stock-photos",
        "tagline": "Professional office, team, and tech photoshoots",
        "description": "Avoid generic stock photos. This pack features 250 professionally shot photographs of modern offices, diverse teams, tech devices, and business scenarios — perfect for B2B marketing.",
        "price": Decimal("39.00"),
        "compare_at_price": Decimal("89.00"),
        "thumbnail_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
        "preview_images": [
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop",
        ],
        "asset_count": 250,
        "file_formats": ["JPG", "RAW"],
        "file_size_mb": Decimal("4500"),
        "tags": ["photography", "stock", "business", "office", "team"],
        "features": [
            "250 high-res photos",
            "Diverse team representation",
            "Modern office environments",
            "Tech & device shots",
            "Commercial use license",
        ],
        "is_featured": False,
    },
]


CATEGORIES_DATA = [
    {"name": "3D Icons", "slug": "3d-icons", "description": "3D rendered icon sets for modern interfaces", "icon": "🎨", "sort_order": 1},
    {"name": "Textures & Materials", "slug": "textures", "description": "PBR textures for 3D, games, and visualization", "icon": "🧱", "sort_order": 2},
    {"name": "Illustrations", "slug": "illustrations", "description": "Vector illustrations for web and marketing", "icon": "✏️", "sort_order": 3},
    {"name": "UI Kits", "slug": "ui-kits", "description": "Complete design systems and component libraries", "icon": "📱", "sort_order": 4},
    {"name": "Typography", "slug": "typography", "description": "Premium fonts and typefaces", "icon": "🔤", "sort_order": 5},
    {"name": "Photography", "slug": "photography", "description": "Professional stock photography packs", "icon": "📷", "sort_order": 6},
    {"name": "Templates", "slug": "templates", "description": "Web, slide, and document templates", "icon": "📄", "sort_order": 7},
    {"name": "Sound & Audio", "slug": "audio", "description": "Sound effects, music, and audio packs", "icon": "🎵", "sort_order": 8},
]


def seed_initial_data(db: Session):
    """Seed the database with initial data if empty."""
    # Create default tenant
    tenant = db.query(Tenant).filter(Tenant.slug == "assetforge").first()
    if not tenant:
        tenant = Tenant(name="AssetForge", slug="assetforge", is_active=True)
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        logger.info("Created default tenant: AssetForge")

    # Create admin user
    admin = db.query(User).filter(User.email == "admin@assetforge.io").first()
    if not admin:
        admin = User(
            tenant_id=tenant.id,
            email="admin@assetforge.io",
            hashed_password=hash_password("Admin@12345"),
            full_name="Admin User",
            company_name="AssetForge",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        logger.info("Created admin user: admin@assetforge.io / Admin@12345")

    # Create demo customer
    customer = db.query(User).filter(User.email == "demo@assetforge.io").first()
    if not customer:
        customer = User(
            tenant_id=tenant.id,
            email="demo@assetforge.io",
            hashed_password=hash_password("Demo@12345"),
            full_name="Demo Customer",
            company_name="Demo Studio Inc.",
            role=UserRole.CUSTOMER,
            is_active=True,
            is_verified=True,
        )
        db.add(customer)
        logger.info("Created demo customer: demo@assetforge.io / Demo@12345")

    db.commit()

    # Create categories
    categories = {}
    for cat_data in CATEGORIES_DATA:
        cat = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
        if not cat:
            cat = Category(**cat_data, is_active=True)
            db.add(cat)
            db.commit()
            db.refresh(cat)
            logger.info(f"Created category: {cat.name}")
        categories[cat.slug] = cat

    # Create bundles
    for bundle_data in BUNDLES_DATA:
        cat_slug = bundle_data.pop("category_slug")
        slug = bundle_data["slug"]
        bundle = db.query(Bundle).filter(Bundle.slug == slug).first()
        if not bundle:
            cat = categories.get(cat_slug)
            if cat:
                bundle = Bundle(**bundle_data, category_id=cat.id, is_active=True)
                db.add(bundle)
                logger.info(f"Created bundle: {bundle.name}")

    db.commit()
    logger.info("Database seeding complete.")
