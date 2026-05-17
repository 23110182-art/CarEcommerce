import { ConfigProvider, theme, App as AntdApp } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './app/store';
import { AppRouter } from './routes/AppRouter';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            token: {
              colorPrimary: '#D4AF37', // Accent Gold
              colorBgBase: '#0B0B0C', // Background
              colorBgContainer: '#181A1D', // Surface
              colorBorder: '#2A2D31', // Border
              fontFamily: "'Inter', sans-serif",
              colorTextBase: '#FFFFFF',
            },
            components: {
              Button: {
                colorPrimaryHover: '#F4D03F',
                borderRadius: 12, // rounded-xl
                controlHeight: 44, // slightly larger for luxury feel
              },
              Card: {
                colorBgContainer: '#181A1D',
                borderRadius: 16,
              },
              Typography: {
                fontFamilyCode: "'Space Grotesk', sans-serif",
              }
            }
          }}
        >
          <AntdApp>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </AntdApp>
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
