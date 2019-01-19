import * as React from 'react';

import {Frame, Navigation, SkeletonPage, Toast, TopBar} from '@shopify/polaris';
import classNames from 'classnames';
import logo from 'datavoyager/images/logo.png';
import {Voyager} from 'datavoyager';

import {DataLoader, DataLoaderType, VoyagerContainer} from './components';

import './App.css';

interface State {
  dataLoaderType?: DataLoaderType;
  isDataPaneHidden?: boolean;
  isEncodingPaneHidden?: boolean;
  isNavigationHidden?: boolean;
  toastContent?: string;
  toastIsError?: boolean;
  voyager?: Voyager;
}

export class App extends React.PureComponent<{}, State> {
  state: State = {};

  private readonly dataSourceItems = Object.keys(DataLoaderType)
    .filter((type) => {
      if (type === DataLoaderType.Test) {
        // eslint-disable-next-line no-process-env
        return Boolean(process.env.SHOW_TEST_LOADER);
      }

      return true;
    })
    .map((key) => {
      return {
        label: DataLoaderType[key],
        onClick: () => {
          this.showDataLoader(DataLoaderType[key]);
        },
      };
    });

  render() {
    const {
      dataLoaderType,
      isDataPaneHidden,
      isEncodingPaneHidden,
      isNavigationHidden,
      toastContent,
      toastIsError,
      voyager,
    } = this.state;

    const navigation = voyager && !isNavigationHidden && (
      <Navigation location="/">
        <Navigation.Section
          title="Load Data Source"
          items={this.dataSourceItems}
        />
        <Navigation.Section
          title="Options"
          items={[
            {
              label: isDataPaneHidden ? 'Show Data Pane' : 'Hide Data Pane',
              onClick: () => {
                this.toggleDataPane();
              },
            },
            {
              label: isEncodingPaneHidden
                ? 'Show Encoding Pane'
                : 'Hide Encoding Pane',
              onClick: () => {
                this.toggleEncodingPane();
              },
            },
          ]}
        />
      </Navigation>
    );

    const topBar = (
      <TopBar showNavigationToggle onNavigationToggle={this.toggleNavigation} />
    );

    return (
      <div
        className={classNames('App', {
          HideDataPane: isDataPaneHidden,
          HideEncodingPane: isEncodingPaneHidden,
        })}
      >
        <Frame
          navigation={navigation}
          topBar={topBar}
          showMobileNavigation={!isNavigationHidden}
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
    this.setState({dataLoaderType: undefined});
  };

  dismissNavigation = () => {
    this.setState({isNavigationHidden: true});
  };

  dismissToast = () => {
    this.setState({toastContent: undefined, toastIsError: undefined});
  };

  loadData = (name: string, data: {}[]) => {
    const {voyager} = this.state;

    if (voyager) {
      voyager.setFilename(name);
      voyager.updateData({values: data});

      this.dismissModal();
      this.dismissNavigation();
      this.showToast(`Data Loaded: ${name}`);
    }
  };

  onVoyagerMounted = (voyager: any) => {
    this.setState({voyager});
  };

  showDataLoader = (type: DataLoaderType) => {
    this.setState({dataLoaderType: type});
  };

  showToast = (content: string, isError?: boolean) => {
    this.setState({toastContent: content, toastIsError: isError});
  };

  toggleDataPane = () => {
    const {isDataPaneHidden} = this.state;

    this.setState({isDataPaneHidden: !isDataPaneHidden});
  };

  toggleEncodingPane = () => {
    const {isEncodingPaneHidden} = this.state;

    this.setState({isEncodingPaneHidden: !isEncodingPaneHidden});
  };

  toggleNavigation = () => {
    const {isNavigationHidden} = this.state;

    this.setState({isNavigationHidden: !isNavigationHidden});
  };
}

export const theme = {
  colors: {
    topBar: {
      background: '#C4CDD5',
      backgroundDarker: '#C4CDD5',
      backgroundLighter: '#F9FAFB',
    },
  },
  logo: {
    topBarSource: logo,
    width: 174,
  },
};

export default App;
