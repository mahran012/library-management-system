import path from 'node:path';

import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';

dotenv.config();

type UserRole = 'Student' | 'Librarian' | 'Manager';

interface Account {
  universityId: string;
  name: string;
  role: UserRole;
  email: string;
}

interface LoginRequest {
  universityId?: string;
  role?: UserRole;
  password?: string;
}

const app = express();

const port = Number(process.env.PORT) || 3000;
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    'JWT_SECRET is required. Create a local .env file based on .env.example.',
  );
}

const accounts: Account[] = [
  {
    universityId: 'U2023101',
    name: 'Alex Mercer',
    role: 'Student',
    email: 'alex.mercer@university.edu',
  },
  {
    universityId: 'U2023102',
    name: 'Sarah Connor',
    role: 'Student',
    email: 'sarah.connor@university.edu',
  },
  {
    universityId: 'U2023103',
    name: 'Bruce Banner',
    role: 'Student',
    email: 'bruce.banner@university.edu',
  },
  {
    universityId: 'U2023104',
    name: 'Clark Kent',
    role: 'Student',
    email: 'clark.kent@university.edu',
  },
  {
    universityId: 'AST001',
    name: 'Emily Watson',
    role: 'Librarian',
    email: 'emily.watson@university.edu',
  },
  {
    universityId: 'AST002',
    name: 'Marcus Vance',
    role: 'Librarian',
    email: 'marcus.vance@university.edu',
  },
  {
    universityId: 'MGR001',
    name: 'Dr Catherine Halsey',
    role: 'Manager',
    email: 'catherine.halsey@university.edu',
  },
];

const standardPassword = 'password123';

app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'library-management-system',
  });
});

app.post('/api/login', (request, response) => {
  const {
    universityId,
    role,
    password,
  } = request.body as LoginRequest;

  if (!universityId || !role || !password) {
    response.status(400).json({
      success: false,
      message: 'University ID, role and password are required.',
    });

    return;
  }

  if (password !== standardPassword) {
    response.status(401).json({
      success: false,
      message: 'Invalid university ID, role or password.',
    });

    return;
  }

  const account = accounts.find(
    (candidate) =>
      candidate.universityId === universityId &&
      candidate.role === role,
  );

  if (!account) {
    response.status(401).json({
      success: false,
      message: 'Invalid university ID, role or password.',
    });

    return;
  }

  const token = jwt.sign(
    {
      universityId: account.universityId,
      name: account.name,
      role: account.role,
      email: account.email,
    },
    jwtSecret,
    {
      expiresIn: '1d',
    },
  );

  response.json({
    success: true,
    token,
    user: account,
  });
});

app.get('/api/verify', (request, response) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    response.status(401).json({
      success: false,
      message: 'Authentication token is required.',
    });

    return;
  }

  const token = authorization.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, jwtSecret);

    response.json({
      success: true,
      user: payload,
    });
  } catch {
    response.status(401).json({
      success: false,
      message: 'Authentication token is invalid or expired.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (_request, response) => {
      response.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(
      `Library Management System running at http://localhost:${port}`,
    );
  });
}

startServer().catch((error: unknown) => {
  console.error('Failed to start application server.', error);
  process.exit(1);
});
