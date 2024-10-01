import './App.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import { AppModel, AppModelContext } from './models/AppModel';
import { Router } from './Router';

export const globalAppModel = new AppModel();

export const App = () => {
  return (
    <AppModelContext.Provider value={globalAppModel}>
      <Router />
    </AppModelContext.Provider>
  );
};
