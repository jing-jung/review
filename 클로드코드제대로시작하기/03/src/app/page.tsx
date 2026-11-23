import Profile from '@/components/Profile';
import LinkCard from '@/components/LinkCard';
import DarkModeToggle from '@/components/DarkModeToggle';

// Mock data. In a real app, fetch from API or DB.
const profile = {
  name: '홍길동',
  bio: '크리에이터 & 개발자',
  imageUrl: '/profile.jpg', // place image in public folder.
};

const links = [
  { title: 'GitHub', url: 'https://github.com/yourname', icon: '🐙' },
  { title: 'Twitter', url: 'https://twitter.com/yourname', icon: '🐦' },
  { title: 'Blog', url: 'https://yourname.dev', icon: '✍️' },
];

export default function HomePage() {
  return (
    <main className="flex flex-col items-center p-4 gap-6">
      <DarkModeToggle />
      <Profile {...profile} />
      <section className="w-full max-w-md space-y-4">
        {links.map((link) => (
          <LinkCard key={link.title} {...link} />
        ))}
      </section>
    </main>
  );
}
