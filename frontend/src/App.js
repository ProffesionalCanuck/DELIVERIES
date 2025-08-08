import React from "react";
import "./App.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import TestimonialsSection from "./components/TestimonialsSection";
import CoverageArea from "./components/CoverageArea";
import Contact from "./components/Contact";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import Analytics from "./components/Analytics";

function App() {
  return (
    <div className="App">
      <Analytics page="homepage" />
      <Header />
      <main>
        <Hero />
        <Services />
        <TestimonialsSection />
        <CoverageArea />
        <Contact />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;