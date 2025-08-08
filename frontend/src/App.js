import React from "react";
import "./App.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import CoverageArea from "./components/CoverageArea";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <Services />
        <CoverageArea />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;