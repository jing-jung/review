import Profile from '../components/Profile';
import LinkCard from '../components/LinkCard';
import DarkModeToggle from '../components/DarkModeToggle';

// wireframe.png 기준 데이터
const profile = {
  name: '김클로',
  bio: '세계 최강 바이브코더',
  imageUrl: '/profile.svg',
};

const links = [
  {
    title: 'GitHub 프로필',
    url: 'https://github.com',
    icon: '🐙',
    initialClicks: 142,
  },
  {
    title: '기술 블로그',
    url: 'https://velog.io',
    icon: '✍️',
    initialClicks: 235,
  },
  {
    title: '바이브코딩 포트폴리오',
    url: 'https://portfolio.dev',
    icon: '💼',
    initialClicks: 98,
  },
  {
    title: 'X (트위터)',
    url: 'https://twitter.com',
    icon: '🐦',
    initialClicks: 64,
  },
  {
    title: '인스타그램',
    url: 'https://instagram.com',
    icon: '📸',
    initialClicks: 180,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-6 sm:py-12 px-4 transition-colors duration-300">
      {/* 와이어프레임 스마트폰 목업 프레임 */}
      <div className="max-w-md mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-[2.5rem] border-2 border-gray-200/90 dark:border-gray-800 shadow-2xl p-6 sm:p-8 flex flex-col justify-between">
        
        {/* 상단 네비게이션 / 다크모드 토글 */}
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
            링크나무 🌱
          </span>
          <DarkModeToggle />
        </div>

        {/* 프로필 영역: 원형 프로필 사진, 이름(김클로), 한 줄 소개(세계 최강 바이브코더) */}
        <Profile {...profile} />

        {/* 링크 카드 목록 ... */}
        <section className="w-full space-y-3.5 pt-2">
          {links.map((link) => (
            <LinkCard key={link.title} {...link} />
          ))}
        </section>

        {/* 하단 더보기 및 푸터 */}
        <footer className="pt-8 pb-2 text-center">
          <div className="text-gray-400 dark:text-gray-600 text-lg tracking-widest font-bold mb-3 select-none">
            •••
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            © 2026 김클로 · 링크나무
          </p>
        </footer>

      </div>
    </div>
  );
}
