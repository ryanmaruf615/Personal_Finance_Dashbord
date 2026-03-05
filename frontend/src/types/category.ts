// ─── Enums ──────────────────────────────────────────────────────────

export type CategoryIcon =
  | 'FOOD' | 'TRANSPORT' | 'HOUSING' | 'SALARY'
  | 'ENTERTAINMENT' | 'HEALTH' | 'SHOPPING' | 'UTILITIES'
  | 'EDUCATION' | 'TRAVEL' | 'GIFT' | 'OTHER';

// Maps backend enum to lucide-react icon name
export const CATEGORY_ICON_MAP: Record<CategoryIcon, string> = {
  FOOD: 'utensils',
  TRANSPORT: 'car',
  HOUSING: 'home',
  SALARY: 'briefcase',
  ENTERTAINMENT: 'film',
  HEALTH: 'heart-pulse',
  SHOPPING: 'shopping-bag',
  UTILITIES: 'zap',
  EDUCATION: 'graduation-cap',
  TRAVEL: 'plane',
  GIFT: 'gift',
  OTHER: 'circle-dot',
};

// ─── Requests ───────────────────────────────────────────────────────

export interface CategoryRequest {
  name: string;
  icon: CategoryIcon;
}

// ─── Responses ──────────────────────────────────────────────────────

export interface CategoryResponse {
  id: number;
  name: string;
  icon: CategoryIcon;
  isDefault: boolean;
  createdAt: string;
}
