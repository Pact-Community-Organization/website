import Hero from '@/components/home/Hero';
import MissionVision from '@/components/home/MissionVision';
import ContractPreview from '@/components/home/ContractPreview';
import DocsHub from '@/components/home/DocsHub';
import CommunityCTA from '@/components/home/CommunityCTA';
import Footer from '@/components/home/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <MissionVision />
      <ContractPreview />
      <DocsHub />
      <CommunityCTA />
      <Footer />
    </main>
  );
}
