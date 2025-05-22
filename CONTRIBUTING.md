# Contributing to QuantumTrace

Thank you for your interest in contributing to QuantumTrace! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### 1. Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/quantumtrace.git
   cd quantumtrace
   ```

### 2. Set Up Development Environment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Create a Branch

Create a new branch for your feature or fix:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

### 4. Make Changes

1. Write your code following our coding standards
2. Add tests if applicable
3. Update documentation as needed
4. Run the linter:
   ```bash
   npm run lint
   ```
5. Run type checking:
   ```bash
   npm run type-check
   ```

### 5. Commit Your Changes

Follow our commit message format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding or modifying tests
- chore: Maintenance tasks

Example:
```
feat(auth): add social login support

- Add Google OAuth integration
- Add GitHub OAuth integration
- Update documentation

Closes #123
```

### 6. Push and Create Pull Request

1. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request on GitHub:
   - Use the PR template
   - Describe your changes
   - Link related issues
   - Request review from maintainers

### 7. Review Process

1. Wait for maintainers to review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful comments
- Keep components small and focused

### Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Maintain or improve test coverage

### Documentation

- Update README.md if needed
- Document new features
- Add JSDoc comments for functions
- Update API documentation

## Getting Help

- Open an issue for bugs or feature requests
- Join our community discussions
- Contact maintainers for questions

Thank you for contributing to QuantumTrace! 