import * as React from "react";

import { Frame, Navigation, SkeletonPage, Toast } from "@shopify/polaris";
import { Voyager } from "datavoyager";
// import logo from "datavoyager/images/logo.png";

import { DataLoader, DataLoaderType, VoyagerContainer } from "./components";

import "./App.css";

interface State {
  dataLoaderType?: DataLoaderType;
  toastContent?: string;
  toastIsError?: boolean;
  voyager?: Voyager;
}

export class App extends React.PureComponent<{}, State> {
  state: State = {};

  private readonly navItems = Object.keys(DataLoaderType).map(key => {
    return {
      label: DataLoaderType[key],
      onClick: () => {
        this.showDataLoader(DataLoaderType[key]);
      }
    };
  });

  render() {
    const { dataLoaderType, toastContent, toastIsError, voyager } = this.state;

    const navigation = voyager && (
      <Navigation location="/">
        <Navigation.Section
          title="Load Data Source"
          icon="import"
          items={this.navItems}
        />
      </Navigation>
    );

    return (
      <div className="App">
        <Frame navigation={navigation}>
          {!voyager && <SkeletonPage title="Loading Voyager..." />}
          <VoyagerContainer onMounted={this.onVoyagerMounted} />
          <DataLoader
            dismiss={this.dismissModal}
            loadData={this.loadData}
            type={dataLoaderType}
          />
          {toastContent && (
            <Toast
              content={toastContent}
              error={toastIsError}
              onDismiss={this.dismissToast}
            />
          )}
        </Frame>
      </div>
    );
  }

  dismissModal = () => {
    this.setState({ dataLoaderType: undefined });
  };

  dismissToast = () => {
    this.setState({ toastContent: undefined, toastIsError: undefined });
  };

  loadData = (name: string, data: {}[]) => {
    const { voyager } = this.state;

    if (voyager) {
      voyager.setFilename(name);
      voyager.updateData({ values: data });

      this.dismissModal();
      this.showToast(`Data Loaded: ${name}`);
    }
  };

  onVoyagerMounted = (voyager: any) => {
    this.setState({ voyager });
  };

  showDataLoader = (type: DataLoaderType) => {
    this.setState({ dataLoaderType: type });
  };

  showToast = (content: string, isError?: boolean) => {
    this.setState({ toastContent: content, toastIsError: isError });
  };
}

export default App;
