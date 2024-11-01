import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PasswordStrengthService {
  checkStrength(password: string): { score: number, feedback: string } {
    let score = 0;
    if (!password) {
      return { score: 0, feedback: 'Password is required' };
    }

    // Award every unique letter until 5 repetitions
    const letters: { [key: string]: number } = {};
    for (let i = 0; i < password.length; i++) {
      letters[password[i]] = (letters[password[i]] || 0) + 1;
      score += 5.0 / letters[password[i]];
    }

    // Bonus points for mixing it up
    const variations = {
      digits: /\d/.test(password),
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      nonWords: /\W/.test(password),
    };

    let variationCount = 0;
    for (const check of Object.values(variations)) {
      variationCount += check ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    // Return score and feedback
    if (score > 80) {
      return { score: 4, feedback: 'Strong password' };
    } else if (score > 60) {
      return { score: 3, feedback: 'Good password' };
    } else if (score >= 30) {
      return { score: 2, feedback: 'Weak password' };
    } else {
      return { score: 1, feedback: 'Very weak password' };
    }
  }
}