import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  compare(plainText: string | Buffer, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}
