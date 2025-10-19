import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    
    // TODO: Implementar lógica de registro
    res.json({ 
      message: 'Usuário registrado com sucesso',
      user: { id: 1, name, email }
    });
  } catch (error) {
    res.status(400).json({ error: 'Dados inválidos' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // TODO: Implementar lógica de login
    res.json({ 
      message: 'Login realizado com sucesso',
      token: 'jwt_token_example',
      user: { id: 1, name: 'Usuário Teste', email }
    });
  } catch (error) {
    res.status(400).json({ error: 'Credenciais inválidas' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

export { router as authRoutes };