import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import pages
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Configure from './pages/Configure';
import View from './pages/View';

import { useState } from 'react';

// class MongoDB {
//   user: String | null;
//   pass: String | null;
//   cluster: String | null;
// }

const defaultUser = "<db_username>"
const defaultPass = "<db_password>"
const defaultCluster = "<db_cluster>"
export const generateUrl = (mongoCred) => (
  `mongodb+srv://${mongoCred.user}:${mongoCred.pass}@${mongoCred.cluster}.mongodb.net`
)

const defaultMongoDBCred = {
  user: defaultUser,
  pass: defaultPass,
  cluster: defaultCluster,
}


function App() {
  const [MongoDBCred, setMongoDBCred] = useState(defaultMongoDBCred)
  /*
    Load MongoDB Credentials from Environmental mongodb.env
  */
  // if USERNAME or PASSWORD or CLUSTER is set in the mongodb.env
  const storedUser = localStorage.getItem('MONGO_USERNAME');
  const storedPass = localStorage.getItem('MONGO_PASSWORD');
  const storedCluster = localStorage.getItem('MONGO_CLUSTER');
  if (storedUser || storedPass || storedCluster) {
    setMongoDBCred({
      user: storedUser || defaultUser,
      pass: storedPass || defaultPass,
      cluster: storedCluster || defaultCluster,
    })
  }
  /*
    Load MongoDB Credentials from URL
  */
  if (false) {
    setMongoDBCred({
      user: "",
      pass: "",
      cluster: ""
    })
  }



  /*
    Go to configure page and force user to enter MongoDB credentials if ANY credential is the default
  */
  if (Object.keys(MongoDBCred).filter((key) => MongoDBCred[key] == defaultMongoDBCred[key]).length) {
    return <Configure mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />
  }

  /*
    IF and only IF, credentials are loaded, allow the router to work
  */

  const routeComponentMap = {
    "/": Home,
    "/configure": Configure,
    "/view": View,
  }

  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container-fluid">
          <Routes>
            {
              Object.keys(routeComponentMap).map(route => {
                const ReactPage = routeComponentMap[route]
                return (<Route
                  path={route}
                  element={
                    <ReactPage mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />
                  }
                />)
              }
              )
            }
            {/* <Route path="/" element={<Home mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />} />
            <Route path="/configure" element={<Configure mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />} />
            <Route path="/view" element={<View mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />} /> */}
          </Routes>
        </div>
      </div>
    </Router >
  );
}

export default App;
