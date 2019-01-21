import * as React from 'react';

import {Frame, Navigation, SkeletonPage, Toast, TopBar} from '@shopify/polaris';
import classNames from 'classnames';
import logo from 'datavoyager/images/logo.png';
import {Voyager} from 'datavoyager';

import {
  allDataLoaderTypes,
  DataLoader,
  DataLoaderType,
  isDataLoaderEnabled,
  VoyagerContainer,
} from './components';

import './App.css';

interface DataLoaderItem {
  label: string;
  onClick(): void;
}

interface State {
  dataLoaderType?: DataLoaderType;
  enabledDataLoaderItems?: DataLoaderItem[];
  isDataPaneHidden?: boolean;
  isEncodingPaneHidden?: boolean;
  isNavigationHidden?: boolean;
  toastContent?: string;
  toastIsError?: boolean;
  voyager?: Voyager;
}

export class App extends React.PureComponent<{}, State> {
  state: State = {};

  async componentDidMount() {
    const enabledDataLoaderItems = (await Promise.all(
      allDataLoaderTypes.map(async (type) => {
        const enabled = await isDataLoaderEnabled(type);

        return enabled && type;
      }),
    ))
      .filter((type): type is DataLoaderType => Boolean(type))
      .map((type) => ({
        label: type,
        onClick: () => {
          this.showDataLoader(type);
        },
      }));

    this.setState({enabledDataLoaderItems});
  }

  render() {
    const {
      dataLoaderType,
      enabledDataLoaderItems,
      isDataPaneHidden,
      isEncodingPaneHidden,
      isNavigationHidden,
      toastContent,
      toastIsError,
      voyager,
    } = this.state;

    const navigation = voyager &&
      !isNavigationHidden &&
      enabledDataLoaderItems && (
        <Navigation location="/">
          <Navigation.Section
            title="Load Data Source"
            items={enabledDataLoaderItems}
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
            onError={this.onError}
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
      try {
        voyager.setFilename(name);
        voyager.updateData({values: data});

        this.dismissModal();
        this.dismissNavigation();
        this.showToast(`Data Loaded: ${name}`);
      } catch (error) {
        this.onError(error.message);
      }
    }
  };

  onError = (message: string) => {
    this.showToast(message, true);
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
