# Todo Penguin Alpha

A modern, feature-rich task management application built with Next.js, TypeScript, and SQLite. This todo app combines powerful functionality with a beautiful, intuitive interface to help you stay organized and productive.

## ✨ Features

### Core Functionality
- **Task Management**: Create, edit, delete, and organize tasks with ease
- **Smart Lists**: Organize tasks into custom lists with colors and emojis
- **Labels & Tags**: Categorize tasks with customizable labels
- **Priority Levels**: Set task priorities (high, medium, low, none)
- **Due Dates & Deadlines**: Set dates and deadlines with natural language parsing
- **Subtasks**: Break down complex tasks into smaller, manageable subtasks
- **Search & Filter**: Find tasks quickly with advanced search and filtering options

### Advanced Features
- **Multiple Views**: View tasks by Today, Next 7 Days, Upcoming, or All tasks
- **Recurring Tasks**: Set up recurring tasks with flexible configurations
- **Activity Tracking**: Monitor task changes with detailed activity logs
- **File Attachments**: Attach files to tasks for better context
- **Time Estimation**: Estimate and track time spent on tasks
- **Natural Language Processing**: Parse dates and times from natural language input

### UI/UX
- **Modern Design**: Clean, beautiful interface built with Tailwind CSS
- **Smooth Animations**: Delightful micro-interactions with Framer Motion
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Dark Mode Support**: Easy on the eyes in any lighting condition
- **Keyboard Shortcuts**: Power user features for maximum efficiency

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Animations**: Framer Motion
- **Database**: SQLite with better-sqlite3
- **Icons**: Lucide React
- **Date Handling**: date-fns, react-day-picker
- **Package Manager**: Bun

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/todo-penguin-alpha.git
   cd todo-penguin-alpha
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   bun dev
   # or
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
todo-penguin-alpha/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/         # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── TaskCard.tsx    # Individual task display
│   │   ├── TaskForm.tsx    # Task creation/editing
│   │   └── TaskList.tsx    # Task list container
│   ├── lib/               # Utility libraries
│   │   ├── db.ts          # Database connection & schema
│   │   ├── client-services.ts # Client-side API services
│   │   ├── tasks.ts       # Task service (server-side)
│   │   ├── lists.ts       # List service (server-side)
│   │   ├── labels.ts      # Label service (server-side)
│   │   └── utils.ts       # General utilities
│   └── types/             # TypeScript type definitions
│       └── index.ts
├── data/                  # SQLite database file
├── public/               # Static assets
├── tests/               # Test files
└── README.md
```

## 🗄 Database Schema

The application uses SQLite with the following main tables:

- **tasks**: Core task information
- **lists**: Task lists/categories
- **labels**: Task labels/tags
- **task_labels**: Many-to-many relationship between tasks and labels
- **activity_logs**: Track task changes
- **attachments**: File attachments for tasks
- **reminders**: Task reminders

## 🔧 Development

### Environment Variables
The application uses environment variables for configuration. Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_PATH=./data/tasks.db

# Optional: Add other environment variables as needed
```

### Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting (recommended)
- Conventional commits for version control

## 🧪 Testing

The project includes test files in the `tests/` directory. Run tests with:

```bash
bun test
# or
npm test
```

## 📦 Building for Production

1. **Build the application**
   ```bash
   bun build
   ```

2. **Start production server**
   ```bash
   bun start
   ```

The application will be available at `http://localhost:3000` in production mode.

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically build and deploy your app

### Other Platforms
The application can be deployed to any platform that supports Next.js, including:
- Netlify
- Railway
- Digital Ocean App Platform
- AWS Amplify
- Self-hosted VPS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI components
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide](https://lucide.dev/) - Beautiful icon library
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - Fast SQLite library

## 📞 Support

If you have any questions, issues, or suggestions:

1. Check the [Issues](https://github.com/your-username/todo-penguin-alpha/issues) page
2. Create a new issue if needed
3. Join our [Discussions](https://github.com/your-username/todo-penguin-alpha/discussions) for community support

---

Made with ❤️ by [Your Name](https://github.com/your-username)
