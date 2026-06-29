const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { cognito } = require('../aws');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'termly_super_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function calculateSecretHash(clientId, clientSecret, username) {
  if (!clientSecret) return undefined;
  return crypto
    .createHmac('SHA256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

function isCognitoActive() {
  return (
    process.env.COGNITO_USER_POOL_ID &&
    !process.env.COGNITO_USER_POOL_ID.includes('xxxxx') &&
    process.env.COGNITO_CLIENT_ID &&
    !process.env.COGNITO_CLIENT_ID.includes('xxxxx')
  );
}

// POST /api/v1/auth/signup
router.post('/signup', async (req, res, next) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name are required.' });
  }

  try {
    let cognitoSub = null;
    let passwordHash = null;

    if (isCognitoActive()) {
      const clientId = process.env.COGNITO_CLIENT_ID;
      const clientSecret = process.env.COGNITO_CLIENT_SECRET;
      const secretHash = calculateSecretHash(clientId, clientSecret, email);

      console.log(`🔐 Registering user ${email} in Cognito...`);
      const signupParams = {
        ClientId: clientId,
        Username: email,
        Password: password,
        SecretHash: secretHash,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: fullName },
        ],
      };

      const cognitoUser = await cognito.signUp(signupParams).promise();
      cognitoSub = cognitoUser.UserSub;

      try {
        await cognito.adminConfirmSignUp({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Username: email,
        }).promise();
        console.log(`✅ Cognito user confirmed: ${email}`);
      } catch (confirmErr) {
        console.warn('⚠️ Admin confirm signup failed:', confirmErr.message);
      }
    } else {
      console.log('ℹ️ Cognito not configured. Using local DB registration.');
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Check if the user was invited
    const checkUser = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    let user;

    if (checkUser.rows.length > 0) {
      const existingUser = checkUser.rows[0];
      if (existingUser.password_hash || existingUser.cognito_sub) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }
      
      // User was invited, update their record (keep their existing role and org_id!)
      const updateResult = await db.query(
        `UPDATE users 
         SET full_name = $1, cognito_sub = $2, password_hash = $3
         WHERE id = $4
         RETURNING id, org_id, email, full_name, role`,
        [fullName, cognitoSub, passwordHash, existingUser.id]
      );
      user = updateResult.rows[0];
    } else {
      // New user registration (assign admin role)
      const insertQuery = `
        INSERT INTO users (email, full_name, role, cognito_sub, password_hash)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, org_id, email, full_name, role;
      `;
      const result = await db.query(insertQuery, [
        email.toLowerCase().trim(),
        fullName,
        'admin',
        cognitoSub,
        passwordHash,
      ]);
      user = result.rows[0];
    }

    const formattedUser = {
      id: user.id,
      orgId: user.org_id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    const token = jwt.sign(
      { id: user.id, orgId: user.org_id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: formattedUser,
    });
  } catch (err) {
    console.error('❌ Signup error:', err);
    if (err.code === 'UsernameExistsException' || err.code === '23505') {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
    next(err);
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    let dbUser = null;

    if (isCognitoActive()) {
      const clientId = process.env.COGNITO_CLIENT_ID;
      const clientSecret = process.env.COGNITO_CLIENT_SECRET;
      const secretHash = calculateSecretHash(clientId, clientSecret, email);

      console.log(`🔐 Authenticating user ${email} via Cognito...`);
      const authParams = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      };

      if (secretHash) {
        authParams.AuthParameters.SECRET_HASH = secretHash;
      }

      const authResult = await cognito.initiateAuth(authParams).promise();
      const idToken = authResult.AuthenticationResult.IdToken;

      const decodedCognito = jwt.decode(idToken);
      const cognitoSub = decodedCognito.sub;

      const userRes = await db.query('SELECT * FROM users WHERE cognito_sub = $1 OR email = $2', [cognitoSub, email.toLowerCase()]);
      if (userRes.rows.length === 0) {
        console.log(`Creating user in DB for Cognito profile: ${email}`);
        const insertRes = await db.query(
          'INSERT INTO users (email, full_name, role, cognito_sub) VALUES ($1, $2, $3, $4) RETURNING *',
          [email.toLowerCase(), decodedCognito.name || email.split('@')[0], 'admin', cognitoSub]
        );
        dbUser = insertRes.rows[0];
      } else {
        dbUser = userRes.rows[0];
      }
    } else {
      console.log('ℹ️ Cognito not configured. Using local DB password verification.');
      const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      if (userRes.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      dbUser = userRes.rows[0];
      if (!dbUser.password_hash) {
        return res.status(401).json({ error: 'Local login disabled for this account (requires Cognito).' });
      }

      const isValidPassword = await bcrypt.compare(password, dbUser.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    const token = jwt.sign(
      { id: dbUser.id, orgId: dbUser.org_id, role: dbUser.role, email: dbUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: dbUser.id,
        orgId: dbUser.org_id,
        email: dbUser.email,
        fullName: dbUser.full_name,
        role: dbUser.role,
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    if (err.code === 'NotAuthorizedException' || err.code === 'UserNotFoundException') {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (err.code === 'UserNotConfirmedException') {
      return res.status(401).json({ error: 'Cognito account has not been verified yet.' });
    }
    next(err);
  }
});

// GET /api/v1/auth/me
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const userRes = await db.query(
      'SELECT id, org_id, email, full_name, role FROM users WHERE id = $1',
      [req.user.id]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const user = userRes.rows[0];
    res.json({
      user: {
        id: user.id,
        orgId: user.org_id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/change-password — Change user password
router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  try {
    const { rows } = await db.query(
      `SELECT * FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = rows[0];

    if (isCognitoActive()) {
      const cognitoParams = {
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: user.email,
        Password: newPassword,
        Permanent: true
      };
      await cognito.adminSetUserPassword(cognitoParams).promise();
    } else {
      if (!user.password_hash) {
        return res.status(400).json({ error: 'Local password login not enabled for this account.' });
      }
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Incorrect current password.' });
      }
      const newHash = await bcrypt.hash(newPassword, 10);
      await db.query(
        `UPDATE users SET password_hash = $1 WHERE id = $2`,
        [newHash, req.user.id]
      );
    }
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: err.message || 'Failed to change password.' });
  }
});

module.exports = router;

