import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';  
import Header from './components/Header';
import HomePage from './pages/HomePage';
import TechCategory from './pages/TechCategory';
import client from './apolloClient'; 
import ClothesCategory from './pages/ClothesCategory';
function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Header />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/tech' element={<TechCategory />} />
          <Route path='/clothes' element={<ClothesCategory />}/>
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
