import * as React from "react";

import { DataLoader, DataLoaderProps } from "../shared";

export function loadData(loader: DataLoader) {
  loader({
    name: "testing",
    values: [{ id: 1, title: "a" }, { id: 2, title: "b" }]
  });
}

export interface Props extends DataLoaderProps {}

export type ComposedProps = Props;

export function TestLoader({ loader }: ComposedProps) {
  return <button onClick={() => loadData(loader)}>Load Data</button>;
}

export default TestLoader;
