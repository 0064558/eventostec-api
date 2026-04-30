export interface EventSummary {
  id: string;
  title: string;
  description: string;
  date: string;
  city: string;
  uf: string;
  remote: boolean;
  eventUrl: string;
  imgUrl: string;
}

export interface CouponDetails {
  code: string;
  discount: number;
  validUntil: string;
}

export interface EventDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  city: string;
  uf: string;
  imgUrl: string;
  eventUrl: string;
  coupons: CouponDetails[];
}

export interface EventFilters {
  title: string;
  city: string;
  uf: string;
  startDate: string;
  endDate: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  date: number;
  city: string;
  uf: string;
  remote: boolean;
  eventUrl: string;
  image?: File;
}

export interface CreateCouponInput {
  code: string;
  discount: number;
  valid: number;
}
