# Shad Jatra (স্বাদ যাত্রা) 🍛

**Shad Jatra** is a premium, production-ready SaaS application designed to showcase and archive the rich culinary heritage of Bangladesh. Built with modern technologies, it offers a seamless experience for food enthusiasts to discover, submit, and manage authentic recipes with a focus on ease of use and visual excellence.

## 🚀 Live Demo
Check out the application here: [shad-jatra.vercel.app](https://shad-jatra.vercel.app)

---

## ✨ Key Features

- **Dynamic Recipe Discovery:** Real-time filtering and search for thousands of authentic Bangladeshi recipes across categories like Biryani, Fish, Meat, and more.
- **Recipe Submission:** A streamlined interface for users to contribute their own recipes, complete with a multi-step instruction builder.
- **Admin Dashboard:** A secure, robust management suite for administrators to approve pending submissions, delete content, and perform bulk imports.
- **Bulk Import (JSON):** Advanced data management allows admins to upload large batches of recipes via JSON with a built-in template guide.
- **Glassmorphism UI:** A stunning, modern design system featuring smooth gradients, micro-animations, and full support for both **Light** and **Dark** modes.
- **Advanced SEO:** Fully optimized for search engines with dynamic sitemaps, robots.txt, and metadata integration.
- **Secure Authentication:** Powered by Clerk for a reliable and protected user experience.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Styling:** Vanilla CSS & [Shadcn UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Validation:** [Zod](https://zod.dev/)

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Clerk account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Atifhasan250/shad-jatra.git
   cd shad-jatra
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key

   # Admin Configuration
   ADMIN_CLERK_USER_ID=your_clerk_user_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 👨‍💻 Developed By

**Atif Hasan**
- Portfolio: [atifs-info.vercel.app](https://atifs-info.vercel.app/)
- GitHub: [@Atifhasan250](https://github.com/Atifhasan250)
- LinkedIn: [Atif Hasan](https://www.linkedin.com/in/atifhasan250)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
