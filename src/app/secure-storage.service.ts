import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {

  private secretKey = btoa(environment.secretKey + navigator.userAgent);

  constructor() { }

  setItem(key: string, value: any) {
    debugger
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      this.secretKey
    ).toString();

    localStorage.setItem(key, encrypted);
    // console.log(`encrpted:${value} `,encrypted)
  }

  getItem(key: string) {
    debugger
    const encrypted = localStorage.getItem(key);

    if (!encrypted) return null;

    const bytes = CryptoJS.AES.decrypt(encrypted, this.secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return decrypted ? JSON.parse(decrypted) : null;
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }
}
