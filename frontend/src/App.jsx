import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import Header from './components/Header';
import TechCategory from './pages/TechCategory';
import client from './apolloClient';
import ClothesCategory from './pages/ClothesCategory';

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/clothes" />} />
          <Route index path='/clothes' element={<ClothesCategory />} />
          <Route path='/tech' element={<TechCategory />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
