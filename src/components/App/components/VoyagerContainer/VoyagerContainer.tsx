import * as React from "react";

import { compose, defaultProps, lifecycle, withProps } from "recompose";
import { CreateVoyager, Voyager, VoyagerConfig } from "datavoyager";

import "datavoyager/build/style.css";
import "./VoyagerContainer.css";

export const defaultConfig: VoyagerConfig = {
  hideFooter: true,
  hideHeader: true,
  showDataSourceSelector: false
};

export interface Props {
  config?: VoyagerConfig;
  onMounted(voyager?: Voyager): void;
}

interface DefaultProps {
  config: VoyagerConfig;
}

interface RefProps {
  containerRef: React.RefObject<HTMLDivElement> | undefined;
}

type ComposedProps = Props & DefaultProps & RefProps;

export function VoyagerContainer({ containerRef }: ComposedProps) {
  return <div id="voyager" ref={containerRef} />;
}

export default compose<ComposedProps, Props>(
  defaultProps({ config: defaultConfig }),
  withProps<RefProps, any>({ containerRef: React.createRef<HTMLDivElement>() }),
  lifecycle<ComposedProps, any>({
    componentDidMount() {
      const { config, containerRef, onMounted } = this.props;

      if (!containerRef || !containerRef.current) {
        throw new Error("Unable to mount voyager");
      }

      onMounted(CreateVoyager(containerRef.current, config));
    }
  })
)(VoyagerContainer);
