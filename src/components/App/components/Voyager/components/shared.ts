import { Data } from "vega";

export type DataLoader = (data: Data) => void;

export interface DataLoaderProps {
  loader: DataLoader;
}
