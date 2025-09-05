import { User } from '../../users/user.entity';

export interface LoginResponse {
    message: string;
    user: Omit<User, 'password' | 'hashPassword'>;
    accessToken: string;
}