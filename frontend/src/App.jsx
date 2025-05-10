import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import Header from './components/Header';
import TechCategory from './pages/TechCategory';
import client from './apolloClient';
import ClothesCategory from './pages/ClothesCategory';
import ProductDetailsPage from './pages/ProductDetailsPage';

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/clothes" />} />
          <Route index path='/clothes' element={<ClothesCategory />} />
          <Route path='/tech' element={<TechCategory />} />
          <Route path='/product/:id' element={<ProductDetailsPage />}/>
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
