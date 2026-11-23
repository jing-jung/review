import Link from 'next/link';

type LinkCardProps = {
  title: string;
  url: string;
  icon?: string;
};

export default function LinkCard({ title, url, icon }: LinkCardProps) {
  const handleClick = () => {
    // TODO: increment click count via API
    console.log(`Clicked ${title}`);
  };

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
      <div className="flex items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
        {icon && <span className="mr-3 text-xl">{icon}</span>}
        <span className="font-medium text-gray-800 dark:text-gray-200">{title}</span>
      </div>
    </Link>
  );
}
