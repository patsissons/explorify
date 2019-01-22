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
  showDataSourceSelector?: boolean;
  showFooter?: boolean;
  showHeader?: boolean;
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
      showDataSourceSelector,
      showFooter,
      showHeader,
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
              {
                label: showHeader ? 'Hide Header' : 'Show Header',
                onClick: () => {
                  this.toggleHeader();
                },
              },
              {
                label: showFooter ? 'Hide Footer' : 'Show Footer',
                onClick: () => {
                  this.toggleFooter();
                },
              },
              {
                label: showDataSourceSelector
                  ? 'Hide Data Source Selector'
                  : 'Show Data Source Selector',
                onClick: () => {
                  this.toggleDataSourceSelector();
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

  toggleDataSourceSelector = () => {
    const {showDataSourceSelector, voyager} = this.state;

    if (voyager) {
      voyager.updateConfig({showDataSourceSelector: !showDataSourceSelector});
      this.setState({showDataSourceSelector: !showDataSourceSelector});
    }
  };

  toggleEncodingPane = () => {
    const {isEncodingPaneHidden} = this.state;

    this.setState({isEncodingPaneHidden: !isEncodingPaneHidden});
  };

  toggleFooter = () => {
    const {showFooter, voyager} = this.state;

    if (voyager) {
      voyager.updateConfig({hideFooter: showFooter});
      this.setState({showFooter: !showFooter});
    }
  };

  toggleHeader = () => {
    const {showHeader, voyager} = this.state;

    if (voyager) {
      voyager.updateConfig({hideHeader: showHeader});
      this.setState({showHeader: !showHeader});
    }
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
