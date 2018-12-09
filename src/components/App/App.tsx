import * as React from "react";

import {
  Frame,
  Navigation,
  SkeletonPage,
  Toast,
  TopBar
} from "@shopify/polaris";
import classNames from "classnames";
import { Voyager } from "datavoyager";
import logo from "datavoyager/images/logo.png";

import { DataLoader, DataLoaderType, VoyagerContainer } from "./components";

import "./App.css";

interface State {
  dataLoaderType?: DataLoaderType;
  isDataPaneHidden?: boolean;
  isEncodingPaneHidden?: boolean;
  isMobileNavVisible?: boolean;
  toastContent?: string;
  toastIsError?: boolean;
  voyager?: Voyager;
}

export class App extends React.PureComponent<{}, State> {
  state: State = {};

  private readonly dataSourceItems = Object.keys(DataLoaderType)
    .filter(type => {
      if (type === DataLoaderType.Test) {
        return Boolean(process.env.SHOW_TEST_LOADER);
      }

      return true;
    })
    .map(key => {
      return {
        label: DataLoaderType[key],
        onClick: () => {
          this.showDataLoader(DataLoaderType[key]);
        }
      };
    });

  render() {
    const {
      dataLoaderType,
      isDataPaneHidden,
      isEncodingPaneHidden,
      isMobileNavVisible,
      toastContent,
      toastIsError,
      voyager
    } = this.state;

    const navigation = voyager && (
      <Navigation location="/">
        <Navigation.Section
          title="Load Data Source"
          items={this.dataSourceItems}
        />
        <Navigation.Section
          title="Options"
          items={[
            {
              label: isDataPaneHidden ? "Show Data Pane" : "Hide Data Pane",
              onClick: () => {
                this.toggleDataPane();
              }
            },
            {
              label: isEncodingPaneHidden
                ? "Show Encoding Pane"
                : "Hide Encoding Pane",
              onClick: () => {
                this.toggleEncodingPane();
              }
            }
          ]}
        />
      </Navigation>
    );

    const topBar = (
      <TopBar
        showNavigationToggle={true}
        onNavigationToggle={this.toggleNavigation}
      />
    );

    return (
      <div
        className={classNames("App", {
          HideDataPane: isDataPaneHidden,
          HideEncodingPane: isEncodingPaneHidden
        })}
      >
        <Frame
          navigation={navigation}
          topBar={topBar}
          showMobileNavigation={isMobileNavVisible}
          onNavigationDismiss={this.dismissNavigation}
        >
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

  dismissNavigation = () => {
    this.setState({ isMobileNavVisible: false });
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
      this.dismissNavigation();
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

  toggleDataPane = () => {
    const { isDataPaneHidden } = this.state;

    this.setState({ isDataPaneHidden: !Boolean(isDataPaneHidden) });
  };

  toggleEncodingPane = () => {
    const { isEncodingPaneHidden } = this.state;

    this.setState({ isEncodingPaneHidden: !Boolean(isEncodingPaneHidden) });
  };

  toggleNavigation = () => {
    const { isMobileNavVisible } = this.state;

    this.setState({ isMobileNavVisible: !Boolean(isMobileNavVisible) });
  };
}

export const theme = {
  colors: {
    topBar: {
      background: "#C4CDD5",
      backgroundDarker: "#C4CDD5",
      backgroundLighter: "#F9FAFB"
    }
  },
  logo: {
    topBarSource: logo,
    width: 174
  }
};

export default App;
