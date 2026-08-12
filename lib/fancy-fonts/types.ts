export type FancyCategory = 'popular' | 'social' | 'decorative';

export interface FancyStyle {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: FancyCategory;
  transform: (text: string) => string;
  tags: string[];
}
