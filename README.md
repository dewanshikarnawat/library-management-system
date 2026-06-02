<div align="center">

# 📚 Library Management System

### A modern, full-featured LMS built for real-world library operations

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**[Live Demo](#) · [Report Bug](https://github.com/dewanshikarnawat/library-management-system/issues) · [Request Feature](https://github.com/dewanshikarnawat/library-management-system/issues)**

</div>

---

## ✨ Overview

A sleek, dark-themed **Library Management System** built with modern web technologies. Designed to streamline all library operations — from managing books and members to issuing, returning, and generating analytics — all in one intuitive dashboard.

> 🎯 Built as a production-ready project showcasing full-stack development skills with real-world CRUD operations, role-based access, and live analytics.

---
<img width="1920" height="871" alt="Screenshot (488)" src="https://github.com/user-attachments/assets/a9149229-f2a7-4ebd-b03d-b0a06eea7a08" />


### 📖 Book Details
> Detailed book view with metadata, availability status, and issue history.

![Book Details](https://raw.githubusercontent.com/dewanshikarnawat/library-management-system/main/screenshots/book-details.png)

<details>
<summary>📸 View More Screenshots</summary>

### 📤 Issue Book
> Assign books to members with flexible loan periods and real-time availability updates.

![Issue Book](https://raw.githubusercontent.com/dewanshikarnawat/library-management-system/main/screenshots/issue-book.png)

### 📥 Return Book
> Process returns with a clean summary panel showing issue and due dates.

![Return Book](https://raw.githubusercontent.com/dewanshikarnawat/library-management-system/main/screenshots/return-book.png)

### 📋 Issue History
> Full audit trail of all book issues and returns with status badges.

![Issue History](https://raw.githubusercontent.com/dewanshikarnawat/library-management-system/main/screenshots/issue-history.png)

### 📊 Reports & Analytics
> Monthly comparison charts with total issued, returned, and overdue counts.

![Reports](https://raw.githubusercontent.com/dewanshikarnawat/library-management-system/main/screenshots/reports.png)

### 🏠 Dashboard
> At-a-glance library activity with charts, quick actions, and books-by-category breakdown.

![Dashboard](https://raw.githubusercontent.com/dewanshikarnawat/library-management-system/main/screenshots/dashboard.png)

</details>

---

## 🚀 Features

| Feature | Description |
|---|---|
| 📚 **Book Management** | Add, edit, view books with ISBN, author, publisher, category & copy tracking |
| 👥 **Member Management** | Register and manage library members with unique member IDs |
| 📤 **Issue Book** | Assign books with customizable loan periods (7 / 14 / 21 / 30 days) |
| 📥 **Return Book** | Process returns with automatic availability updates |
| 🕓 **Issue History** | Complete audit log of all transactions with status filters |
| 📊 **Reports & Analytics** | Monthly comparison charts, overdue tracking, category distribution |
| 🌙 **Dark Mode** | Beautiful dark UI — easy on the eyes, professional in feel |
| 🔔 **Notifications** | Real-time toast notifications for all actions |
| 🔐 **Auth** | Secure login with role-based access (Admin / Member) |

---

## 🛠️ Tech Stack

```
Frontend          →  React 18 + TypeScript + Vite
Styling           →  Tailwind CSS + shadcn/ui
Charts            →  Recharts
Backend / DB      →  Supabase (PostgreSQL + Auth + Realtime)
Icons             →  Lucide React
State             →  React Query + Context API
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js `v18+`
- A [Supabase](https://supabase.com/) account (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/dewanshikarnawat/library-management-system.git
cd library-management-system

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key

# 4. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. 🎉

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/            # shadcn base components
│   └── layout/        # Sidebar, Navbar, etc.
├── pages/             # Route-level page components
│   ├── Dashboard.tsx
│   ├── Books.tsx
│   ├── IssueBook.tsx
│   ├── ReturnBook.tsx
│   ├── IssueHistory.tsx
│   └── Reports.tsx
├── hooks/             # Custom React hooks
├── lib/               # Supabase client & utilities
└── types/             # TypeScript interfaces
```

---

## 🗄️ Database Schema (Supabase)

| Table | Key Columns |
|---|---|
| `books` | id, title, author, isbn, category, publisher, total_copies, available_copies |
| `members` | id, name, member_id, email, role |
| `issues` | id, book_id, member_id, issue_date, due_date, return_date, fine, status |

---

## 🎨 Design Highlights

- **Dark-first UI** with a consistent navy/slate color palette
- **Responsive layout** with collapsible sidebar
- **Accessible components** using shadcn/ui primitives
- **Smooth UX** with loading states, toast feedback, and confirmation flows

---

## 🧑‍💻 Author

**Dewanshi Karnawat**

[![GitHub](https://img.shields.io/badge/GitHub-dewanshikarnawat-181717?style=flat-square&logo=github)](https://github.com/dewanshikarnawat)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/dewanshi-karnawat-388578353/)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

⭐ **If you find this project helpful, please give it a star!** ⭐

*Built with ❤️ using React + Supabase*

</div>
