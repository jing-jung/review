import Image from 'next/image';

type ProfileProps = {
  name: string;
  bio: string;
  imageUrl: string;
};

export default function Profile({ name, bio, imageUrl }: ProfileProps) {
  return (
    <div className="flex flex-col items-center text-center pt-2 pb-6">
      {/* 원형 프로필 사진 */}
      <div className="relative mb-5">
        <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-emerald-500/20 dark:ring-emerald-400/20 shadow-md flex items-center justify-center bg-gradient-to-tr from-emerald-100 to-teal-50 dark:from-gray-800 dark:to-gray-750">
          <Image
            src={imageUrl}
            alt={name}
            width={112}
            height={112}
            className="w-full h-full object-cover rounded-full"
            priority
          />
        </div>
      </div>

      {/* 이름 */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
        {name}
      </h1>

      {/* 한 줄 소개 */}
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium max-w-xs">
        {bio}
      </p>
    </div>
  );
}
