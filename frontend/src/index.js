import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './css/index.css';
import HomePage from "./pages/HomePage";
import StorePage from "./pages/StorePage";
import InLinePage from "./pages/InLinePage";
import InLinePageCheckout from "./pages/InLinePageCheckout";
import YourTurnPage from "./pages/YourTurnPage";
import YourTurnPageCheckout from "./pages/YourTurnPageCheckout";
import CheckoutPage from "./pages/CheckoutPage";
import CaptchaTest from './captcha_test';
import CaptchaPage from './pages/CaptchaPage'; 
import YourTicketsPage from './pages/YourTicketsPage';

/**
 * [Store,UserID,IsInside]
 * If IsInside is false the line to the store is outside
 */
window.activeQueues = [];

/**
 * The application base that returns the right page depending on the current route path.
 * @returns the right component depending on the route path.
 */
const App = () => {
  return (
    <Router>
      <Switch>
          <Route path="/store/:id" component={StorePage} />
          <Route path="/queue/:id" component={InLinePage} />
          <Route path="/checkout/:id" component={CheckoutPage} />
          <Route path="/queuecheckout/:id" component={InLinePageCheckout} />
          <Route path="/yourturn/:id" component={YourTurnPage}/>
          <Route path="/yourturncheckout/:id" component={YourTurnPageCheckout}/>
          <Route path="/captcha/:id" component={CaptchaPage} />
          <Route path="/yourtickets" component={YourTicketsPage} />
          <Route path="/" component={HomePage} />
      </Switch>
    </Router>
  );
};

//Renders with reactjs
ReactDOM.render(
          <App>
          <CaptchaTest/> 
          </App>, document.getElementById('root'));