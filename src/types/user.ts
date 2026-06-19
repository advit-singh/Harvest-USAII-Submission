export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface UpdateUserProfileInput {
  fullName?: string;
  avatarUrl?: string;
}
