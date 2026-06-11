import { HomeContent } from '@/components/home/HomeContent';
import { getPortfolioData } from '@/lib/data/portfolio';

export default async function HomePage() {
  const data = await getPortfolioData();

  return <HomeContent data={data} />;
}
