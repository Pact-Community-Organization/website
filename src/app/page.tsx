import TokenBanner from '@/components/home/TokenBanner';
import Hero from '@/components/home/Hero';
import MissionVision from '@/components/home/MissionVision';
import ContractPreview from '@/components/home/ContractPreview';
import DocsHub from '@/components/home/DocsHub';
import CommunityCTA from '@/components/home/CommunityCTA';

export default function Home() {
  return (
    <main>
      <TokenBanner />
      <Hero />
      <MissionVision />
      <ContractPreview />
      <DocsHub />
      <CommunityCTA />
    </main>
  );
}
