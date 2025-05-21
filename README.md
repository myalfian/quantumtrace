<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Running with Docker

This project includes a Docker setup for building and running the app in a containerized environment.

- **Node.js version:** 22.13.1 (as specified in the Dockerfile)
- **Exposed port:** `4173` (Vite preview server)
- **Environment variables:**
  - The app can use a `.env` file for configuration. Copy `.env.example` to `.env` and adjust as needed. Uncomment the `env_file` line in `docker-compose.yml` if you want to use it.
- **Dependencies:** All dependencies are installed and built inside the Docker image. No local Node.js installation is required.

### Build and Run

To build and start the app using Docker Compose:

```sh
docker compose up --build
```

The app will be available at [http://localhost:4173](http://localhost:4173).

- The container runs as a non-root user for improved security.
- The Vite preview server is used for production preview.
- The app may require access to Firebase or Supabase (configured via environment variables), but these are cloud services and not included as containers.

**Note:**
- If you need to customize environment variables, edit the `.env` file and ensure the `env_file` line in `docker-compose.yml` is uncommented.
- No additional configuration is required unless your environment or cloud services require it.
=======
... (file content here) ...
>>>>>>> bc89eace20afea15e84765f55420225a62189f67
