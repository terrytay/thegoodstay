# The Good Stay - Professional Dog Boarding Website

A modern, full-featured website for professional dog boarding services built with Next.js 14, Supabase, and Stripe. Features assessment booking, e-commerce functionality, and a comprehensive admin dashboard.

## 🐕 Features

### Customer-Facing Features
- **Professional Homepage** with hero section, services overview, and testimonials
- **Assessment Booking System** for initial dog-owner consultations
- **E-commerce Shop** for pet treats, toys, and accessories
- **Shopping Cart & Checkout** with Stripe payment processing
- **Responsive Design** optimized for all devices
- **SEO Optimized** with structured data and meta tags

### Admin Features
- **Dashboard** with analytics and quick actions
- **Product Management** with CRUD operations
- **Order Management** and tracking
- **Booking Management** for assessment visits
- **Customer Management** and communication tools

### Technical Features
- **Next.js 14** with App Router and TypeScript
- **Supabase** for database and authentication
- **Stripe** for secure payment processing
- **Tailwind CSS** for modern styling
- **SEO Optimization** with structured data
- **Admin Dashboard** for content management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd the-good-stay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase and Stripe credentials.

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL from `supabase-schema.sql` in the SQL editor

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Lucide React icons
- **Backend**: Next.js API routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Stripe Checkout & Webhooks
- **Deployment**: Vercel

### Project Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── book-assessment/   # Assessment booking
│   └── shop/              # E-commerce pages
├── components/            # Reusable components
│   ├── admin/            # Admin-specific components
│   ├── sections/         # Homepage sections
│   ├── shop/             # Shop components
│   └── seo/              # SEO components
└── lib/                  # Utilities and configurations
    ├── supabase/         # Database client
    └── stripe/           # Payment processing
```

## 💾 Database Schema

The application uses PostgreSQL with the following main tables:

- **profiles** - User profiles and contact information
- **bookings** - Assessment visit requests
- **products** - Shop inventory
- **orders** - Purchase orders
- **order_items** - Individual order items
- **reviews** - Customer testimonials

See `supabase-schema.sql` for the complete schema with RLS policies.

## 🛒 E-commerce Features

### Product Management
- CRUD operations for products
- Inventory tracking
- Category organization
- Image management

### Shopping Cart
- Add/remove items
- Quantity adjustments
- Real-time total calculations
- Persistent across sessions

### Checkout Process
- Stripe Checkout integration
- Address collection
- Tax calculations
- Email confirmations

## 📱 Admin Dashboard

Access the admin dashboard at `/admin` with features including:

- **Analytics Dashboard** with key metrics
- **Product Management** for inventory control
- **Order Processing** and fulfillment
- **Booking Management** for assessment visits
- **Customer Relationship** tools

## 🔧 Configuration

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe Webhooks

Configure webhooks in your Stripe dashboard:
- Endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

## 📈 SEO Features

### Structured Data
- Business information (LocalBusiness)
- Product listings (Product schema)
- Reviews and ratings (Review schema)
- Service offerings (Service schema)

### Meta Tags
- Open Graph for social sharing
- Twitter Cards
- Comprehensive keyword targeting
- Mobile-optimized viewport

### Technical SEO
- XML sitemap generation
- Robots.txt configuration
- Semantic HTML structure
- Performance optimization

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Import project from GitHub
   - Add environment variables
   - Deploy automatically

3. **Configure Custom Domain**
   - Add domain in Vercel settings
   - Update DNS records
   - Update environment URLs

See `DEPLOYMENT.md` for detailed deployment instructions.

## 🧪 Testing

### Test the Application

1. **Assessment Booking**
   - Fill out the booking form
   - Check Supabase for new booking records

2. **E-commerce Flow**
   - Add products to cart
   - Complete checkout with test cards
   - Verify order creation

3. **Admin Dashboard**
   - Access `/admin`
   - Test product CRUD operations
   - Review booking management

### Stripe Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive data
- Webhook signature verification
- CORS configuration for API routes
- Input validation and sanitization

## 📊 Performance

- Next.js 14 with App Router for optimal performance
- Image optimization with Next.js Image component
- Static generation where possible
- Database connection pooling
- Optimized bundle size with tree shaking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the deployment guide
- Open an issue on GitHub

## 🙏 Acknowledgments

- Design inspiration from Lettuce & Co
- Built with Next.js, Supabase, and Stripe
- Icons by Lucide React
- Fonts by Google Fonts (Inter & Playfair Display)