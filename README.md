# PrintFlow MVP

A print-on-demand platform for students and print shops, featuring mobile-optimized student interface and tablet-optimized shop dashboard.

## Features

### Student Portal (Mobile-Optimized)
- **Home Screen**: Upload PDF/DOCX files and select partner shop
- **Live Wait Times**: See real-time wait times for each partner shop
- **Print Settings**: Configure color mode, paper size, and number of copies
- **GCash Payment**: Integrated QR code payment with reference number tracking
- **Live Order Status**: Real-time timeline showing order progress
- **Claim QR Code**: Generate QR code for order pickup when ready

### Shop Dashboard (Tablet-Optimized)
- **Active Queue Management**: View all pending orders with payment verification
- **Order Details Modal**: Comprehensive view of customer info, print specs, and payment
- **Payment Verification**: Verify GCash reference numbers
- **Workflow Actions**: 
  - Verify & approve payments
  - Download print files
  - Mark orders as printing
  - Mark orders as ready for pickup
- **Multi-tab Organization**: Queue, Ready, and Completed tabs
- **Real-time Updates**: Auto-refresh order status

## Tech Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS v4** with custom theme (Tech Blue & Clean White)
- **Radix UI** components for accessibility
- **qrcode.react** for QR code generation
- **Lucide React** for icons

## Color Scheme

- Primary: Tech Blue (#2563eb)
- Background: Clean White (#ffffff)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)

## Routes

### Student Routes
- `/` - Student Home (file upload & location selection)
- `/student/print-settings` - Configure print options and payment
- `/student/order/:orderId` - Live order status tracking

### Shop Routes
- `/shop` - Shop Dashboard (queue management)

## Mock Data

The application uses a mock data store (`/src/app/lib/store.ts`) that simulates:
- Order management
- Print locations with live wait times
- Order status updates
- Payment tracking

## Future Enhancements (Supabase Integration)

This MVP uses local mock data. For production deployment, consider integrating **Supabase** for:

- **Real-time order synchronization** between student and shop apps
- **User authentication** for students and shop operators
- **File storage** for uploaded documents
- **Payment verification** tracking
- **Order history** and analytics
- **Multi-location management**

## Getting Started

1. The app automatically loads at the Student Home screen
2. Upload a PDF/DOCX file
3. Select a partner shop
4. Configure print settings
5. Complete GCash payment and enter reference number
6. Track order status in real-time
7. Access Shop Dashboard at `/shop` to manage orders

## Print Pricing

- Black & White: ₱5 per page
- Color: ₱15 per page
- Legal size: 1.2x multiplier
- Calculated automatically based on settings

## Order Workflow

1. **Pending** → Student submits order
2. **Awaiting Verification** → Shop verifies GCash payment
3. **Processing** → Payment approved, ready to print
4. **Printing** → Document is being printed
5. **Ready** → Available for pickup (shows claim QR code)
6. **Completed** → Order claimed and archived
