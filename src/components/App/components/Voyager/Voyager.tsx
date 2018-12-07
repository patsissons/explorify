import * as React from "react";

import { compose, lifecycle, withProps } from "recompose";
import { CreateVoyager, VoyagerConfig } from "datavoyager";
import { Data, DataFormat } from "vega-lite";

import { TestLoader } from "./components";

import "datavoyager/build/style.css";
import "./Voyager.css";

export const defaultConfig: VoyagerConfig = {
  renderCustomDataSelectorTabs(loader) {
    return [
      {
        name: "testing",
        panel: <TestLoader loader={loader} />
      }
    ];
  }
};

export interface Props {
  config?: VoyagerConfig;
  data?: Data;
}

interface RefProps {
  containerRef: React.RefObject<HTMLDivElement> | undefined;
}

type ComposedProps = Props & RefProps;

export function Voyager({ containerRef }: ComposedProps) {
  return <div id="voyager" ref={containerRef} />;
}

function coerceData(data: Data | undefined) {
  const params = new URL(window.location.href).searchParams;
  const url = params.get("url");
  const format = params.get("format") as DataFormat | null;

  if (format && url) {
    return {
      format,
      url
    };
  }

  return data;
}

export default compose<ComposedProps, Props>(
  withProps<RefProps, any>({ containerRef: React.createRef<HTMLDivElement>() }),
  lifecycle<ComposedProps, any>({
    componentDidMount() {
      const { config = defaultConfig, data, containerRef } = this.props;

      if (containerRef && containerRef.current) {
        CreateVoyager(
          containerRef.current,
          { showDataSourceSelector: data == null, ...config },
          coerceData(data)
        );
      }
    }
  })
)(Voyager);
