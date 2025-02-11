import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';  
import Header from './components/Header';
import HomePage from './pages/HomePage';
import TechCategory from './pages/TechCategory';
import client from './apolloClient'; 
function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Header />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/tech' element={<TechCategory />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
