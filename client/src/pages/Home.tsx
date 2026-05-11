import Navbar from "../components/Navbar";
import Hero from "../sections/Home/Hero";
import Steps from "../sections/Home/Steps";
import Features from "../sections/Home/Features";
import Modes from "../sections/Home/Modes";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      <Navbar />
      <main>
        <Hero />
        <Steps />
        <Features />
        <Modes />
      </main>
      <Footer />
    </div>
  )
}

export default Home;