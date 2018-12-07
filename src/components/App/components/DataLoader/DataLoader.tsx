import * as React from "react";

import { Modal, FormLayout, TextField } from "@shopify/polaris";

import {
  DataLoaderFunction,
  TestDataLoader,
  VegaDatasetLoader
} from "./components";

export enum DataLoaderType {
  Test = "Test",
  VegaDatasets = "Vega Datasets"
}

export interface Props {
  dismiss(): void;
  loadData(name: string, data: {}[]): void;
  type: DataLoaderType | undefined;
}

type ComposedProps = Props;

interface State {
  loader?: DataLoaderFunction;
  name: string;
}

export class DataLoader extends React.PureComponent<ComposedProps, State> {
  state: State = { name: "" };

  render() {
    const { dismiss, type } = this.props;
    const { name } = this.state;

    return (
      <Modal
        open={Boolean(type)}
        onClose={dismiss}
        primaryAction={{ content: "Load Data", onAction: this.handleLoadData }}
        title={`Load ${name} Data...`}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Data Source Name"
              value={name}
              onChange={this.setName}
            />
          </FormLayout>
        </Modal.Section>
        <Modal.Section>{this.renderLoader()}</Modal.Section>
      </Modal>
    );
  }

  renderLoader() {
    const { type } = this.props;
    switch (type) {
      case DataLoaderType.Test:
        return <TestDataLoader onMounted={this.onMounted} />;

      case DataLoaderType.VegaDatasets:
        return <VegaDatasetLoader onMounted={this.onMounted} />;
    }

    return false;
  }

  handleLoadData = async () => {
    const { dismiss, loadData, type } = this.props;
    const { loader, name } = this.state;

    try {
      if (!loader) {
        throw new Error("Invalid data loader function");
      }

      if (!type) {
        throw new Error("Invalid data loader type");
      }

      const { name: dataName, values } = await loader();

      loadData(name || dataName || type, values);
    } catch (e) {
      dismiss();
    }
  };

  onMounted = (loader: DataLoaderFunction) => {
    this.setState({ loader });
  };

  setName = (name: string) => {
    this.setState({ name });
  };
}

export default DataLoader;
