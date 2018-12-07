export interface LoadedData<T = {}> {
  name?: string;
  values: T[];
}

export type DataLoaderFunction<T = {}> = () => Promise<LoadedData<T>>;

export interface DataLoaderMountedProps<T = {}> {
  onMounted(dataLoader: DataLoaderFunction<T>): void;
}
