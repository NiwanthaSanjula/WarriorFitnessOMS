import AboutUs from '../../components/landing/AboutUs'
import Calculators from '../../components/landing/Calculators'
import Facilities from '../../components/landing/Facilities'
import FAQ from '../../components/landing/FAQ'
import Hero from '../../components/landing/Hero'
import Milestones from '../../components/landing/Milestones'
import Pricing from '../../components/landing/Pricing'
import SuccessStories from '../../components/landing/SuccessStories'
import WhyUs from '../../components/landing/WhyUs'

const Home = () => {
  return (
    <div>
      <section id="home">       <Hero />          </section>
      <section id="about">      <AboutUs />       </section>
      <section id="why-us">     <WhyUs />         </section>
      <section id="stories">    <SuccessStories /></section>
      <section id="facilities"> <Facilities />    </section>
      <section id="milestones"> <Milestones />    </section>
      <section id="plans">      <Pricing />       </section>
      <section id="faq">        <FAQ />           </section>
      <section id="calculators"><Calculators />   </section>
    </div>
  )
}

export default Home