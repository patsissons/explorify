import * as React from 'react';

import {Modal, FormLayout, TextField} from '@shopify/polaris';

import {
  DataLoaderFunction,
  DBLoader,
  isDBLoaderEnabled,
  isTestLoaderEnabled,
  TestDataLoader,
  VegaLoader,
  GraphQLLoader,
} from './components';

export enum DataLoaderType {
  // eslint-disable-next-line shopify/typescript/prefer-pascal-case-enums
  DB = 'Database',
  // eslint-disable-next-line shopify/typescript/prefer-pascal-case-enums
  GraphQL = 'GraphQL',
  Test = 'Test',
  Vega = 'Vega (URL)',
}

export const allDataLoaderTypes = Object.entries<DataLoaderType>(
  DataLoaderType as any,
).map(([{}, type]) => type);

export interface Props {
  dismiss(): void;
  loadData(name: string, data: {}[]): void;
  onError(message: string): void;
  type: DataLoaderType | undefined;
}

type ComposedProps = Props;

interface State {
  loader?: DataLoaderFunction;
  loading?: boolean;
  name: string;
}

export class DataLoader extends React.PureComponent<ComposedProps, State> {
  state: State = {name: ''};

  render() {
    const {dismiss, type} = this.props;
    const {loading, name} = this.state;

    return (
      <Modal
        loading={loading}
        open={Boolean(type)}
        onClose={dismiss}
        primaryAction={{
          content: 'Load Data',
          onAction: this.handleLoadData,
          loading,
        }}
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
    const {type} = this.props;
    switch (type) {
      case DataLoaderType.DB:
        return <DBLoader onMounted={this.onMounted} />;

      case DataLoaderType.GraphQL:
        return <GraphQLLoader onMounted={this.onMounted} />;

      case DataLoaderType.Test:
        return <TestDataLoader onMounted={this.onMounted} />;

      case DataLoaderType.Vega:
        return <VegaLoader onMounted={this.onMounted} />;
    }

    return false;
  }

  handleLoadData = async () => {
    const {loadData, onError, type} = this.props;
    const {loader, name} = this.state;

    try {
      if (!loader) {
        throw new Error('Invalid data loader function');
      }

      if (!type) {
        throw new Error('Invalid data loader type');
      }

      this.setState({loading: true});

      const {name: dataName, values} = await loader();

      loadData(name || dataName || type, values);

      this.setState({loading: false});
    } catch (error) {
      this.setState({loading: false});
      onError(error.message);
    }
  };

  onMounted = (loader: DataLoaderFunction) => {
    this.setState({loader});
  };

  setName = (name: string) => {
    this.setState({name});
  };
}

export async function isDataLoaderEnabled(type: DataLoaderType) {
  try {
    switch (type) {
      case DataLoaderType.DB: {
        const enabled = await isDBLoaderEnabled();

        return enabled;
      }
      case DataLoaderType.Test:
        return isTestLoaderEnabled();
      default:
        return true;
    }
  } catch (error) {
    return false;
  }
}

export default DataLoader;
