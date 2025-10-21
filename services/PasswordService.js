const bcrypt = require('bcryptjs');

class PasswordService {
    constructor() {
        // Salt rounds for bcrypt (10-12 is recommended for production)
        this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    }

    // Hash password
    async hashPassword(plainPassword) {
        try {
            const salt = await bcrypt.genSalt(this.saltRounds);
            const hashedPassword = await bcrypt.hash(plainPassword, salt);
            return hashedPassword;
        } catch (error) {
            throw new Error('Failed to hash password: ' + error.message);
        }
    }

    // Verify password
    async verifyPassword(plainPassword, hashedPassword) {
        try {
            const isValid = await bcrypt.compare(plainPassword, hashedPassword);
            return isValid;
        } catch (error) {
            throw new Error('Failed to verify password: ' + error.message);
        }
    }

    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    isPasswordHashed(password) {
        return /^\$2[ayb]\$\d{2}\$/.test(password);
    }

    // Validate password strength
    validatePasswordStrength(password) {
        const errors = [];

        if (!password) {
            errors.push('Password is required');
            return { valid: false, errors };
        }

        if (password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        if (password.length > 128) {
            errors.push('Password must be less than 128 characters long');
        }

        // Optional: Add more strength requirements
        if (!/[a-z]/.test(password)) {
            // Uncomment if you want to enforce lowercase
            // errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[A-Z]/.test(password)) {
            // Uncomment if you want to enforce uppercase
            // errors.push('Password must contain at least one uppercase letter');
        }

        if (!/\d/.test(password)) {
            // Uncomment if you want to enforce numbers
            // errors.push('Password must contain at least one number');
        }

        return {
            valid: errors.length === 0,
            errors,
            strength: this.calculatePasswordStrength(password)
        };
    }

    // Calculate password strength score (0-100)
    calculatePasswordStrength(password) {
        let score = 0;
        
        if (!password) return 0;

        // Length bonus
        score += Math.min(password.length * 2, 25);

        // Character variety bonus
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/\d/.test(password)) score += 10;
        if (/[^a-zA-Z\d]/.test(password)) score += 15;

        // Length penalties for very short passwords
        if (password.length < 6) score -= 20;
        if (password.length < 4) score -= 20;

        // Repetition penalty
        if (/(.)\1{2,}/.test(password)) score -= 10;

        // Common patterns penalty
        if (/123|abc|qwe|asd/i.test(password)) score -= 15;

        return Math.max(0, Math.min(100, score));
    }

    // Get password strength description
    getPasswordStrengthDescription(score) {
        if (score < 30) return 'Very Weak';
        if (score < 50) return 'Weak';
        if (score < 70) return 'Moderate';
        if (score < 90) return 'Strong';
        return 'Very Strong';
    }
}

module.exports = PasswordService;