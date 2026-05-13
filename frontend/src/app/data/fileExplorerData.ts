export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileItem[];
  lastModified?: string;
  size?: number;
}

export const fileStructure: FileItem = {
  id: 'root',
  name: 'my-project',
  type: 'folder',
  path: '/',
  children: [
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      path: '/src',
      children: [
        {
          id: 'components',
          name: 'components',
          type: 'folder',
          path: '/src/components',
          children: [
            {
              id: 'button.tsx',
              name: 'Button.tsx',
              type: 'file',
              path: '/src/components/Button.tsx',
              content: "import React from 'react';\n\ninterface ButtonProps {\n  label: string;\n  onClick?: () => void;\n  variant?: 'primary' | 'secondary';\n}\n\nexport const Button: React.FC<ButtonProps> = ({\n  label,\n  onClick,\n  variant = 'primary',\n}) => {\n  return (\n    <button\n      onClick={onClick}\n      className={\\btn btn-\\${variant}\\}\n    >\n      {label}\n    </button>\n  );\n};",
              lastModified: '2024-01-15',
              size: 342,
            },
            {
              id: 'card.tsx',
              name: 'Card.tsx',
              type: 'file',
              path: '/src/components/Card.tsx',
              content: `import React from 'react';\n\ninterface CardProps {\n  title: string;\n  description: string;\n  children?: React.ReactNode;\n}\n\nexport const Card: React.FC<CardProps> = ({\n  title,\n  description,\n  children,\n}) => {\n  return (\n    <div className="card">\n      <div className="card-header">\n        <h3>{title}</h3>\n        <p>{description}</p>\n      </div>\n      <div className="card-body">\n        {children}\n      </div>\n    </div>\n  );\n};`,
              lastModified: '2024-01-14',
              size: 298,
            },
          ],
        },
        {
          id: 'pages',
          name: 'pages',
          type: 'folder',
          path: '/src/pages',
          children: [
            {
              id: 'home.tsx',
              name: 'Home.tsx',
              type: 'file',
              path: '/src/pages/Home.tsx',
              content: `import React from 'react';\nimport { Card } from '../components/Card';\nimport { Button } from '../components/Button';\n\nexport const Home: React.FC = () => {\n  return (\n    <div className="home-page">\n      <h1>Welcome to My App</h1>\n      <Card\n        title="Getting Started"\n        description="Learn how to use this application"\n      >\n        <Button label="Get Started" variant="primary" />\n      </Card>\n    </div>\n  );\n};`,
              lastModified: '2024-01-12',
              size: 389,
            },
            {
              id: 'about.tsx',
              name: 'About.tsx',
              type: 'file',
              path: '/src/pages/About.tsx',
              content: `import React from 'react';\n\nexport const About: React.FC = () => {\n  return (\n    <div className="about-page">\n      <h1>About Us</h1>\n      <p>This is a simple file explorer application built with React and TypeScript.</p>\n      <p>It demonstrates component-based architecture and file system navigation.</p>\n    </div>\n  );\n};`,
              lastModified: '2024-01-11',
              size: 267,
            },
          ],
        },
        {
          id: 'app.tsx',
          name: 'App.tsx',
          type: 'file',
          path: '/src/App.tsx',
          content: `import React from 'react';\nimport { Home } from './pages/Home';\nimport { About } from './pages/About';\n\nexport const App: React.FC = () => {\n  const [page, setPage] = React.useState('home');\n\n  return (\n    <div className="app">\n      <nav>\n        <button onClick={() => setPage('home')}>Home</button>\n        <button onClick={() => setPage('about')}>About</button>\n      </nav>\n      {page === 'home' && <Home />}\n      {page === 'about' && <About />}\n    </div>\n  );\n};`,
          lastModified: '2024-01-15',
          size: 354,
        },
        {
          id: 'index.tsx',
          name: 'index.tsx',
          type: 'file',
          path: '/src/index.tsx',
          content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport { App } from './App';\nimport './styles/index.css';\n\nconst root = ReactDOM.createRoot(\n  document.getElementById('root') as HTMLElement\n);\n\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`,
          lastModified: '2024-01-15',
          size: 289,
        },
      ],
    },
    {
      id: 'public',
      name: 'public',
      type: 'folder',
      path: '/public',
      children: [
        {
          id: 'index.html',
          name: 'index.html',
          type: 'file',
          path: '/public/index.html',
          content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>My React App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>`,
          lastModified: '2024-01-10',
          size: 232,
        },
        {
          id: 'favicon.ico',
          name: 'favicon.ico',
          type: 'file',
          path: '/public/favicon.ico',
          lastModified: '2024-01-10',
          size: 4096,
        },
      ],
    },
    {
      id: 'package.json',
      name: 'package.json',
      type: 'file',
      path: '/package.json',
      content: `{\n  "name": "my-project",\n  "version": "1.0.0",\n  "description": "A simple React application",\n  "main": "src/index.tsx",\n  "scripts": {\n    "start": "react-scripts start",\n    "build": "react-scripts build",\n    "test": "react-scripts test",\n    "eject": "react-scripts eject"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "@types/react": "^18.2.0",\n    "@types/react-dom": "^18.2.0",\n    "typescript": "^5.0.0"\n  }\n}`,
      lastModified: '2024-01-15',
      size: 512,
    },
    {
      id: 'readme.md',
      name: 'README.md',
      type: 'file',
      path: '/README.md',
      content: `# My Project\n\nA simple React application demonstrating file explorer functionality.\n\n## Installation\n\n\`\`\`bash\nnpm install\n\`\`\`\n\n## Running the Application\n\n\`\`\`bash\nnpm start\n\`\`\`\n\n## Building for Production\n\n\`\`\`bash\nnpm run build\n\`\`\`\n\n## Project Structure\n\n- \`src/\` - Source code\n  - \`components/\` - Reusable React components\n  - \`pages/\` - Page components\n- \`public/\` - Static assets\n- \`package.json\` - Project dependencies`,
      lastModified: '2024-01-12',
      size: 458,
    },
    {
      id: '.gitignore',
      name: '.gitignore',
      type: 'file',
      path: '/.gitignore',
      content: `node_modules/\nbuild/\ndist/\n.DS_Store\n*.log\n.env\n.env.local`,
      lastModified: '2024-01-10',
      size: 98,
    },
  ],
};
