export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export type AgeRange = "infant" | "child" | "teen" | "adult";

export interface Rider {
  id: string;
  user_id: string;
  name: string;
  age_range: AgeRange;
  height_inches: number;
  created_at: string;
  updated_at: string;
}

export type Park = "Magic Kingdom" | "EPCOT" | "Animal Kingdom" | "Hollywood Studios";

export interface Attraction {
  id: string;
  name: string;
  park: string;
  sub_park: string | null;
  ride_type: string | null;
  min_age: string | null;
  height_requirement: number | null;
  rain_safe: boolean;
  attraction_api_id: string | null;
  image_url: string | null;
  lightning_lane_type: "single_pass" | "genie_plus" | null;
  lightning_lane_price: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface RiderAttraction {
  id: string;
  rider_id: string;
  attraction_id: string;
  can_ride: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface AttractionWithDetails extends Attraction {
  wait_time?: number | null;
  status?: string;
  rider_preferences?: (RiderAttraction & { rider: Rider })[];
}
