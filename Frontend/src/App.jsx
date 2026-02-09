import { useState } from 'react'
import AttendanceCalendar from './assets/pages/Admin/courses'
import Layout from './components/Layout.jsx'
import './App.css'
import Login from './assets/pages/Login/login.jsx'
import AppComponent from './components/Appcomponent.jsx'
function App() {

  return (
    <>
    {/* <Layout>
      <h2 className="text-2xl font-semibold">Dashboard</h2>
    </Layout> */}
    {/* <Login/> */}
    <AppComponent/>
    </>
  )
}

export default App;
