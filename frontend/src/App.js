import React from "react";
import "./App.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import WeekendPromotion from "./components/WeekendPromotion";
import Services from "./components/Services";
import TestimonialsSection from "./components/TestimonialsSection";
import CoverageArea from "./components/CoverageArea";
import Contact from "./components/Contact";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import Analytics from "./components/Analytics";
import ChatWidget from "./components/ChatWidget";

function App() {
  return (
    <div className="App">
      <Analytics page="homepage" />
      <Header />
      <main>
        <Hero />
        <div className="container">
          <WeekendPromotion />
        </div>
        <Services />
        <TestimonialsSection />
        <CoverageArea />
        <Contact />
        <FAQ />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default App;