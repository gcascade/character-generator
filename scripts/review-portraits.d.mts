import type { Server } from 'node:http';

export interface ReviewedPortrait {
  stem: string;
  race: string;
  characterClass: string;
  variant: string;
  file: string | null;
  status: 'present' | 'trashed' | 'missing';
}

export interface Review {
  list(): ReviewedPortrait[];
  reject(stem: string): boolean;
  restore(stem: string): boolean;
  image(file: string): { bytes: Buffer; type: string } | undefined;
}

export function createReview(options?: {
  imagesDir?: string;
  trashDir?: string;
  onChange?: () => void;
}): Review;

export function createReviewServer(review?: Review): Server;
