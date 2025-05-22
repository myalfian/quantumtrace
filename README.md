# QuantumTrace - Engineering Team Management System

A comprehensive web application for managing engineering teams, tracking projects, and monitoring productivity metrics.

## Features

- **Project Management**
  - Project tracking and monitoring
  - Team collaboration tools
  - Approval workflows

- **Daily Activities**
  - Task input and tracking
  - Activity logging
  - Reminders and notifications

- **Leave Management**
  - Leave request system
  - Approval workflows
  - Calendar integration

- **Analytics & Metrics**
  - Productivity tracking
  - Activity analytics
  - Performance metrics

- **System Administration**
  - User management
  - Role-based access control
  - System configuration

## Tech Stack

- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Supabase for backend services
- Docker for containerization

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/quantumtrace.git
   cd quantumtrace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t quantumtrace .
   ```

2. Run the container:
   ```bash
   docker run -p 4173:4173 quantumtrace
   ```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
